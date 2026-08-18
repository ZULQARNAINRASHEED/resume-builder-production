// 📁 src/pages/ResumeLanding.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ResumeLanding() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center relative flex items-center justify-center px-6 py-12"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=85')",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#043442]/75"></div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Left Side */}
          <div className="text-white text-center lg:text-left">

            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-6">
              <span className="text-lg">✨</span>
              <span className="text-sm font-medium">
                AI-Powered Resume Builder
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Build a Resume
              <span className="block text-cyan-300">
                That Gets Noticed
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-200 max-w-xl leading-relaxed mb-8">
              Create a professional, ATS-friendly resume or improve your
              existing resume with the help of AI. Simple, fast and
              professional.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">

              <button
                onClick={() => navigate("/create")}
                className="px-7 py-3.5 bg-white text-[#043442] font-bold rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
              >
                Create New Resume →
              </button>

              <button
                onClick={() => navigate("/upload")}
                className="px-7 py-3.5 bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 hover:-translate-y-1 transition-all duration-300"
              >
                Upload Existing Resume
              </button>

            </div>
          </div>

          {/* Right Side Resume Preview */}
          <div className="hidden lg:flex justify-center">

            <div className="relative">

              {/* Glow */}
              <div className="absolute -inset-4 bg-cyan-400/20 blur-3xl rounded-full"></div>

              {/* Resume Card */}
              <div className="relative bg-white w-[330px] h-[430px] rounded-2xl shadow-2xl p-7 text-[#043442] transform rotate-2 hover:rotate-0 transition-all duration-500">

                {/* Resume Header */}
                <div className="border-b border-gray-200 pb-4 mb-5">

                  <div className="h-4 bg-[#043442] rounded w-40 mb-3"></div>

                  <div className="h-2 bg-gray-300 rounded w-28"></div>

                </div>

                {/* Summary */}
                <div className="mb-5">

                  <div className="h-2 bg-[#043442]/80 rounded w-24 mb-3"></div>

                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-11/12"></div>
                    <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                  </div>

                </div>

                {/* Experience */}
                <div className="mb-5">

                  <div className="h-2 bg-[#043442]/80 rounded w-28 mb-3"></div>

                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-10/12"></div>
                    <div className="h-2 bg-gray-200 rounded w-9/12"></div>
                  </div>

                </div>

                {/* Skills */}
                <div>

                  <div className="h-2 bg-[#043442]/80 rounded w-16 mb-3"></div>

                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-[#043442]/10 rounded-full text-xs">
                      React
                    </span>

                    <span className="px-3 py-1 bg-[#043442]/10 rounded-full text-xs">
                      JavaScript
                    </span>

                    <span className="px-3 py-1 bg-[#043442]/10 rounded-full text-xs">
                      Laravel
                    </span>
                  </div>

                </div>

                {/* AI Badge */}
                <div className="absolute -right-8 -bottom-6 bg-[#043442] text-white px-5 py-3 rounded-xl shadow-xl">
                  <div className="flex items-center gap-2">
                    <span>🤖</span>
                    <span className="text-sm font-semibold">
                      AI Enhanced
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}