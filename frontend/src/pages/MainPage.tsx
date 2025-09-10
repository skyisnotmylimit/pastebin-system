import React, { useState } from "react";
import axios from "axios";

const MainPage: React.FC = () => {
  const [fileContent, setFileContent] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [viewLink, setViewLink] = useState<string>("");

  const getPresignedUrl = async (fileName: string) => {
    setMessage("Requesting pre-signed URL...");
    const serverUrl = "http://localhost:8080/api/pastes/create-paste";
    console.log(`Simulating API call to: ${serverUrl}?filename=${fileName}`);
    const response = await axios.post(serverUrl);
    console.log(response);
    return response.data;
  };

  const uploadFileToS3 = async (url: string, file: Blob): Promise<void> => {
    setMessage("Uploading file to S3...");
    console.log(`PUT request to S3 bucket at: ${url}`);
    const response = await axios.put(url, file, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
    if (response.status !== 200) {
      throw new Error("Failed to upload file to S3.");
    }
  };

  const handleGenerateLink = async () => {
    if (!fileContent.trim()) {
      setMessage("Please enter some text to generate a file.");
      return;
    }

    setIsLoading(true);
    setMessage("Starting upload process...");
    setViewLink("");

    try {
      const fileBlob = new Blob([fileContent], { type: "text/plain" });
      const fileName = "content.txt";
      const file = new File([fileBlob], fileName, { type: "text/plain" });

      const resourceMetadata = await getPresignedUrl(fileName);
      console.log("Received resource metadata:", resourceMetadata);
      const presignedUrl = resourceMetadata.putUrl;
      const fileHash = resourceMetadata.hash;

      if (!presignedUrl) {
        throw new Error("Failed to obtain a pre-signed URL.");
      }

      await uploadFileToS3(presignedUrl, file);

      const viewLink = `${window.location.origin}/${fileHash}`;
      setViewLink(viewLink);

      setMessage(`File uploaded successfully! You can view it here:`);
      console.log(`File view link: ${viewLink}`);
      setFileContent("");
    } catch (error) {
      console.error("Upload failed:", error);
      setMessage(
        `Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(viewLink);
      setMessage("Link copied to clipboard!");
    } catch (err) {
      setMessage("Failed to copy the link.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Pastebin System
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Enter your text below and generate a shareable link to view it later.
        </p>

        <textarea
          className="w-full h-48 p-4 border border-gray-300 rounded-lg shadow-inner text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 transition-all duration-200"
          placeholder="Type your content here..."
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
        />

        <button
          onClick={handleGenerateLink}
          disabled={isLoading}
          className={`
            w-full py-3 px-6 rounded-xl font-semibold text-white shadow-lg
            transition-all duration-300 transform hover:scale-105
            ${
              isLoading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </div>
          ) : (
            "Generate Link"
          )}
        </button>

        {message && (
          <p className="mt-6 text-center text-sm font-medium text-gray-600 p-3 bg-gray-50 rounded-lg">
            {message}
          </p>
        )}

        {viewLink && (
          <div className="mt-4 w-full">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Your View Link:
            </label>
            <div className="flex items-center space-x-2">
              <textarea
                readOnly
                className="flex-1 p-3 border border-gray-300 rounded-lg shadow-inner text-gray-700 bg-gray-100 focus:outline-none resize-none"
                rows={2}
                value={viewLink}
              />
              <button
                onClick={handleCopyToClipboard}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-all duration-200"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
