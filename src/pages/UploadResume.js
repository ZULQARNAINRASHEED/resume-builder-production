// 📁 src/pages/UploadResume.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/api";

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleEnhance = async () => {
    if (!file) {
      setError("Please upload a resume first!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch(apiUrl("enhance-resume"), {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const rawResponse = await response.text();

      console.log("HTTP Status:", response.status);
      console.log("Raw Laravel Response:", rawResponse);

      if (!rawResponse.trim()) {
        throw new Error(
          `Laravel returned an empty response. HTTP status: ${response.status}`
        );
      }

      let result;

      try {
        result = JSON.parse(rawResponse);
      } catch (jsonError) {
        console.error("JSON Parse Error:", jsonError);
        console.error("Laravel Response:", rawResponse);

        throw new Error(
          `Laravel returned invalid JSON. HTTP ${response.status}. Check browser console.`
        );
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.message ||
            `Server error: ${response.status}`
        );
      }

      if (!result.success) {
        throw new Error(
          result.error || "Resume enhancement failed."
        );
      }

      sessionStorage.setItem(
        "enhancedResume",
        result.resume || ""
      );

      sessionStorage.setItem(
        "originalResumeName",
        file.name
      );

      console.log("Resume enhanced successfully!");

      navigate("/enhanced-resume");

    } catch (error) {
      console.error("Enhancement error:", error);

      setError(
        error.message || "Something went wrong."
      );

    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/ResumeLanding");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f8f9] via-white to-[#e8f0f2] flex items-center justify-center px-4 py-12">

      {/* Main Card */}
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#043442] rounded-2xl shadow-lg mb-5">
            <span className="text-3xl">📄</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#043442] mb-3">
            Upload Your Resume
          </h1>

          <p className="text-gray-600 max-w-lg mx-auto">
            Upload your existing resume and let our AI improve your
            content, structure and professional presentation.
          </p>

        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">

          {/* Upload Area */}
          <label
            htmlFor="resume-upload"
            className={`
              relative block cursor-pointer rounded-2xl border-2 border-dashed
              p-8 sm:p-12 text-center transition-all duration-300
              ${
                file
                  ? "border-[#043442] bg-[#043442]/5"
                  : "border-gray-300 hover:border-[#043442] hover:bg-[#043442]/5"
              }
            `}
          >

            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              disabled={loading}
              className="hidden"
            />

            {/* Upload Icon */}
            <div className="flex justify-center mb-5">

              <div
                className={`
                  w-20 h-20 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${
                    file
                      ? "bg-[#043442] text-white"
                      : "bg-[#043442]/10 text-[#043442]"
                  }
                `}
              >
                <span className="text-4xl">
                  {file ? "✓" : "↑"}
                </span>
              </div>

            </div>

            {/* File Selected */}
            {file ? (
              <>
                <h3 className="text-lg font-bold text-[#043442] mb-2">
                  Resume Selected
                </h3>

                <p className="text-gray-700 font-medium break-all">
                  {file.name}
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  Click here to choose another file
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-[#043442] mb-2">
                  Choose your resume
                </h3>

                <p className="text-gray-500 mb-3">
                  Click to browse your files
                </p>

                <div className="flex justify-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    PDF
                  </span>

                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    DOC
                  </span>

                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    DOCX
                  </span>

                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    TXT
                  </span>
                </div>
              </>
            )}

          </label>

          {/* Error */}
          {error && (
            <div className="mt-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">

              <span className="text-lg">⚠️</span>

              <p className="text-sm">
                {error}
              </p>

            </div>
          )}

          {/* AI Information */}
          <div className="mt-6 bg-[#043442]/5 rounded-2xl p-5">

            <div className="flex items-start gap-4">

              <div className="w-11 h-11 shrink-0 bg-[#043442] rounded-xl flex items-center justify-center text-white">
                🤖
              </div>

              <div>
                <h3 className="font-bold text-[#043442] mb-1">
                  AI Resume Enhancement
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">
                  Our AI analyzes your resume and helps improve your
                  professional content while keeping your original
                  information intact.
                </p>
              </div>

            </div>

          </div>

          {/* Buttons */}
          <div className="mt-7 space-y-3">

            <button
              type="button"
              onClick={handleEnhance}
              disabled={loading}
              className="
                w-full py-3.5 rounded-xl
                bg-[#043442] text-white
                font-bold shadow-md
                hover:bg-[#064e63]
                hover:-translate-y-0.5
                hover:shadow-lg
                transition-all duration-300
                disabled:bg-gray-400
                disabled:cursor-not-allowed
                disabled:transform-none
              "
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  Enhancing Resume...
                </span>
              ) : (
                "✨ Enhance Resume with AI"
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="
                w-full py-3.5 rounded-xl
                border border-gray-300
                text-gray-600
                font-semibold
                hover:bg-gray-100
                transition-all duration-300
                disabled:bg-gray-100
                disabled:cursor-not-allowed
              "
            >
              Cancel
            </button>

          </div>

          {/* Bottom Note */}
          <p className="text-center text-xs text-gray-400 mt-5">
            Supported formats: PDF, DOC, DOCX and TXT
          </p>

        </div>

      </div>
    </div>
  );
}