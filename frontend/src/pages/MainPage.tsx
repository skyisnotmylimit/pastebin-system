import React, { useState } from "react";
import axios from "axios";
import { publicApi, privateApi } from "../utils/axiosInstance";
import Navbar from "../components/navbar-components/NavBar";

const MainPage: React.FC = () => {
  const [fileContent, setFileContent] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [viewLink, setViewLink] = useState<string>("");

  // New states
  const [expiration, setExpiration] = useState<string>("1d");
  const [isInviteOnly, setIsInviteOnly] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [inviteList, setInviteList] = useState<string[]>([]);

  const getPresignedUrl = async () => {
    setMessage("Requesting pre-signed URL...");
    let response = null;
    if (isInviteOnly) {
      response = await privateApi.post("/pastes/create-paste", {
        expiration,
        inviteList,
      });
    } else {
      response = await publicApi.post("/pastes/create-paste", {
        expiration,
      });
    }
    return response.data;
  };

  const uploadFileToS3 = async (url: string, file: Blob): Promise<void> => {
    setMessage("Uploading file to S3...");
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

      const resourceMetadata = await getPresignedUrl();
      const presignedUrl = resourceMetadata.putUrl;
      const fileHash = resourceMetadata.hash;

      if (!presignedUrl) {
        throw new Error("Failed to obtain a pre-signed URL.");
      }

      await uploadFileToS3(presignedUrl, file);

      const viewLink = `${window.location.origin}/${fileHash}`;
      setViewLink(viewLink);

      setMessage(`File uploaded successfully! You can view it here:`);
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

  const handleAddInvite = () => {
    if (inviteEmail.trim() && !inviteList.includes(inviteEmail)) {
      setInviteList([...inviteList, inviteEmail]);
      setInviteEmail("");
    }
  };

  const handleRemoveInvite = (email: string) => {
    setInviteList(inviteList.filter((e) => e !== email));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-grow flex justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Pastebin System
          </h1>

          <p className="text-gray-600 text-center mb-8">
            Enter your text below, configure options, and generate a shareable
            link.
          </p>

          {/* Text area */}
          <textarea
            className="w-full h-48 p-4 border border-gray-300 rounded-lg shadow-inner text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 transition-all duration-200"
            placeholder="Type your content here..."
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
          />

          {/* Expiration time */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Expiration Time
            </label>
            <select
              className="w-full sm:w-1/2 p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
            >
              <option value="1h">1 Hour</option>
              <option value="1d">1 Day</option>
              <option value="1w">1 Week</option>
              <option value="1m">1 Month</option>
              <option value="never">Never</option>
            </select>
          </div>

          {/* Public / Invite only toggle */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Access Type
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-200 ${
                  !isInviteOnly
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setIsInviteOnly(false)}
              >
                Public
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-200 ${
                  isInviteOnly
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setIsInviteOnly(true)}
              >
                Invite Only
              </button>
            </div>
          </div>

          {/* Invite-only emails */}
          {isInviteOnly && (
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Invite People (one at a time)
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
                <input
                  type="email"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddInvite}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-all duration-200"
                >
                  Add
                </button>
              </div>

              {/* Email chips */}
              <div className="flex flex-wrap mt-3 gap-2">
                {inviteList.map((email) => (
                  <span
                    key={email}
                    className="flex items-center bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm shadow"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => handleRemoveInvite(email)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerateLink}
            disabled={isLoading}
            className={`w-full py-3 px-6 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-105 ${
              isLoading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
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

          {/* Status message */}
          {message && (
            <p className="mt-6 text-center text-sm font-medium text-gray-600 p-3 bg-gray-50 rounded-lg">
              {message}
            </p>
          )}

          {/* Generated link */}
          {viewLink && (
            <div className="mt-4 w-full">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Your View Link:
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
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
      </main>
    </div>
  );
};

export default MainPage;
