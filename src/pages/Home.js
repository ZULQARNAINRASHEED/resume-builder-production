import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Sparkles,
  Palette,
  Bot,
  ArrowRight,
  CheckCircle2,
  Zap,
  Target,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: "Resume Builder",
      description:
        "Build a professional, ATS-friendly resume with AI-powered content suggestions.",
      button: "Create Resume",
      action: () => navigate("/create"),
      gradient: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50",
    },
    {
      icon: Sparkles,
      title: "AI Cover Letter",
      description:
        "Generate personalized cover letters tailored to your skills and target job.",
      button: "Create Cover Letter",
      action: () => navigate("/cover-letter"),
      gradient: "from-purple-500 to-pink-500",
      bg: "bg-purple-50",
    },
    {
      icon: Palette,
      title: "Professional Templates",
      description:
        "Choose from modern, professional templates designed to impress recruiters.",
      button: "Explore Templates",
      action: () => navigate("/templates"),
      gradient: "from-orange-500 to-yellow-500",
      bg: "bg-orange-50",
    },
    {
      icon: Bot,
      title: "AI Interview Prep",
      description:
        "Practice realistic interview questions and receive instant AI feedback.",
      button: "Start Interview",
      action: () => navigate("/interview"),
      gradient: "from-teal-500 to-cyan-500",
      bg: "bg-teal-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden">

        {/* Background decoration */}

        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-200 rounded-full blur-3xl opacity-30"></div>

        <div className="absolute top-20 -right-32 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16">

          {/* Badge */}

          <div className="flex justify-center mb-6">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-teal-100 shadow-sm text-sm font-semibold text-teal-700">

              <Sparkles className="w-4 h-4" />

              AI-Powered Career Platform

            </div>

          </div>

          {/* Heading */}

          <div className="text-center max-w-4xl mx-auto">

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#043442] leading-tight">

              Build Your Career.
              <br />

              <span className="bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
                Land Your Dream Job.
              </span>

            </h1>

            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">

              Create an impressive resume, generate personalized cover
              letters, choose professional templates, and practice interviews
              with AI — all in one place.

            </p>

          </div>

          {/* Hero Buttons */}

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-9">

            <button
              onClick={() => navigate("/create")}
              className="group w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#043442] text-white font-bold shadow-lg hover:shadow-xl hover:bg-[#032c36] transition-all duration-300 flex items-center justify-center gap-2"
            >

              Build My Resume

              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />

            </button>

            <button
              onClick={() => navigate("/templates")}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white border border-gray-200 text-[#043442] font-bold shadow-sm hover:shadow-md hover:border-teal-300 transition-all"
            >

              Explore Templates

            </button>

          </div>

          {/* Trust points */}

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-8 text-sm text-gray-500">

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              ATS Friendly
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              AI Powered
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              Professional Templates
            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section className="max-w-7xl mx-auto px-6 py-16">

        {/* Section heading */}

        <div className="text-center mb-12">

          <p className="text-sm font-bold uppercase tracking-widest text-teal-600 mb-3">
            Everything You Need
          </p>

          <h2 className="text-3xl md:text-4xl font-extrabold text-[#043442]">
            Your Complete Career Toolkit
          </h2>

          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Everything you need to create a strong professional profile and
            prepare for your next opportunity.
          </p>

        </div>


        {/* Cards */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {features.map((feature, index) => {

            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
              >

                {/* Top gradient line */}

                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient}`}
                ></div>


                {/* Icon */}

                <div
                  className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >

                  <Icon
                    className="w-7 h-7 text-[#043442]"
                  />

                </div>


                {/* Number */}

                <span className="absolute top-5 right-5 text-xs font-bold text-gray-300">
                  0{index + 1}
                </span>


                {/* Content */}

                <h3 className="text-xl font-bold text-[#043442] mb-3">

                  {feature.title}

                </h3>

                <p className="text-gray-500 text-sm leading-relaxed min-h-[72px]">

                  {feature.description}

                </p>


                {/* Button */}

                <button
                  onClick={feature.action}
                  className="mt-6 flex items-center gap-2 text-sm font-bold text-[#043442] group-hover:text-teal-600 transition"
                >

                  {feature.button}

                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-1 transition"
                  />

                </button>

              </div>
            );
          })}

        </div>

      </section>


      {/* =====================================================
          AI INTERVIEW SECTION
      ===================================================== */}

      <section className="max-w-7xl mx-auto px-6 pb-16">

        <div className="relative overflow-hidden rounded-3xl bg-[#043442] shadow-2xl">

          {/* Decorative circles */}

          <div className="absolute -right-20 -top-20 w-72 h-72 bg-teal-400 rounded-full blur-3xl opacity-20"></div>

          <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-cyan-400 rounded-full blur-3xl opacity-20"></div>


          <div className="relative p-8 md:p-12 lg:p-14">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

              {/* Left */}

              <div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-teal-200 text-sm font-semibold mb-5">

                  <Bot className="w-4 h-4" />

                  AI Interview Coach

                </div>

                <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">

                  Practice Before
                  <br />

                  <span className="text-teal-300">
                    The Real Interview
                  </span>

                </h2>

                <p className="mt-4 text-gray-300 leading-relaxed max-w-xl">

                  Answer realistic interview questions, receive AI-generated
                  feedback, get a score, discover your strengths and understand
                  exactly where you can improve.

                </p>


                <button
                  onClick={() => navigate("/interview")}
                  className="mt-7 px-6 py-3.5 rounded-xl bg-white text-[#043442] font-bold hover:bg-teal-50 transition flex items-center gap-2"
                >

                  Start AI Interview

                  <ArrowRight className="w-5 h-5" />

                </button>

              </div>


              {/* Right Stats */}

              <div className="grid grid-cols-2 gap-4">

                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">

                  <div className="w-11 h-11 rounded-xl bg-teal-400/20 flex items-center justify-center mb-4">

                    <Target className="w-5 h-5 text-teal-300" />

                  </div>

                  <h3 className="text-2xl font-bold text-white">
                    AI
                  </h3>

                  <p className="text-sm text-gray-300 mt-1">
                    Smart Evaluation
                  </p>

                </div>


                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">

                  <div className="w-11 h-11 rounded-xl bg-cyan-400/20 flex items-center justify-center mb-4">

                    <Zap className="w-5 h-5 text-cyan-300" />

                  </div>

                  <h3 className="text-2xl font-bold text-white">
                    Instant
                  </h3>

                  <p className="text-sm text-gray-300 mt-1">
                    Feedback
                  </p>

                </div>


                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">

                  <div className="w-11 h-11 rounded-xl bg-purple-400/20 flex items-center justify-center mb-4">

                    <FileText className="w-5 h-5 text-purple-300" />

                  </div>

                  <h3 className="text-2xl font-bold text-white">
                    Detailed
                  </h3>

                  <p className="text-sm text-gray-300 mt-1">
                    Analysis
                  </p>

                </div>


                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">

                  <div className="w-11 h-11 rounded-xl bg-yellow-400/20 flex items-center justify-center mb-4">

                    <CheckCircle2 className="w-5 h-5 text-yellow-300" />

                  </div>

                  <h3 className="text-2xl font-bold text-white">
                    History
                  </h3>

                  <p className="text-sm text-gray-300 mt-1">
                    Saved Results
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="max-w-4xl mx-auto px-6 pb-20 text-center">

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 flex items-center justify-center mb-5">

            <Sparkles className="w-7 h-7 text-teal-600" />

          </div>

          <h2 className="text-3xl font-bold text-[#043442]">
            Ready to Build Your Future?
          </h2>

          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Create your resume, prepare for interviews, and take the next step
            toward your dream career.
          </p>

          <button
            onClick={() => navigate("/create")}
            className="mt-7 px-8 py-3.5 rounded-xl bg-[#043442] text-white font-bold hover:bg-[#032c36] shadow-lg hover:shadow-xl transition-all"
          >

            Get Started

            <ArrowRight className="inline-block w-5 h-5 ml-2" />

          </button>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-gray-200 bg-white">

        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-gray-500">

          © {new Date().getFullYear()} Resume Builder · Designed by Team

        </div>

      </footer>

    </div>
  );
}