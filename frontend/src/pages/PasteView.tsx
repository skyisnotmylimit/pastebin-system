import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import axios from "axios";
import { publicApi, privateApi } from "../utils/axiosInstance";
import Navbar from "../components/navbar-components/NavBar";
import Toast from "../components/toast-component/Toast";

const PasteView: React.FC = () => {
  const [fileContent, setFileContent] = useState<string>("");
  const [message, setMessage] = useState<string>("Loading file...");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const { hash } = useParams();

  useEffect(() => {
    const fetchFile = async () => {
      if (!hash) {
        setMessage("No file hash provided in the URL.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setMessage("Fetching file content...");

      try {
        const presignedGetUrl = await getPresignedUrl(hash);
        const response = await axios.get(presignedGetUrl, {
          responseType: "text",
        });
        setFileContent(response.data);
        setMessage("File loaded successfully.");
      } catch (error) {
        console.error("Fetch error:", error);
        setMessage(
          `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFile();
  }, [hash]);

  const getPresignedUrl = async (hash: string): Promise<string> => {
    const serverUrl = `http://localhost:8080/api/pastes/${hash}`;
    const response = await axios.get(serverUrl);
    if (response.status !== 200) {
      setError(response.data.error);
    }
    return response.data.getUrl;
  };

  const handleCopy = async () => {
    try {
      const tempTextArea = document.createElement("textarea");
      tempTextArea.value = fileContent;
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand("copy");
      document.body.removeChild(tempTextArea);
      setMessage("Content copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text:", err);
      setMessage("Failed to copy content.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />

      {/* Main container */}
      {error && (
        <Toast variant="failure" message={error} onClose={() => setError("")} />
      )}
      <main className="flex-grow flex justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            File Viewer
          </h1>

          <p className="text-gray-600 text-center mb-6">
            Viewing content for hash:{" "}
            <span className="font-mono text-gray-800 bg-gray-200 px-2 py-1 rounded-md">
              {hash}
            </span>
          </p>

          <div className="w-full bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-inner">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <svg
                  className="animate-spin h-8 w-8 text-gray-500 mb-4"
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
                <p>{message}</p>
              </div>
            ) : fileContent ? (
              <div className="flex flex-col items-center">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 bg-gray-100 p-4 rounded-md border border-gray-300 max-h-96 overflow-y-auto w-full">
                  {fileContent}
                </pre>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center justify-center mt-4 py-2 px-4 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 shadow-lg"
                >
                  Copy
                </button>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-12">{message}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PasteView;
