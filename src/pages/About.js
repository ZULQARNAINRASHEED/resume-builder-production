import React from "react";

const About = () => {
  const features = [
    {
      icon: "🤖",
      title: "AI Resume Builder",
      description:
        "Create professional resume content with intelligent AI assistance tailored to your skills and career goals.",
    },
    {
      icon: "🎨",
      title: "Modern Templates",
      description:
        "Select clean, professional and ATS-friendly templates designed for different career profiles.",
    },
    {
      icon: "✨",
      title: "AI Enhancement",
      description:
        "Improve your professional summary, experience descriptions, achievements and other resume content.",
    },
    {
      icon: "💼",
      title: "Cover Letter Generator",
      description:
        "Create personalized cover letters based on your resume and the job you are targeting.",
    },
    {
      icon: "🎯",
      title: "AI Interview Preparation",
      description:
        "Practice realistic interview questions and receive scores, feedback, strengths and improvement suggestions.",
    },
    {
      icon: "🔎",
      title: "Job Search",
      description:
        "Explore relevant job opportunities and find positions related to your skills and career interests.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Add Your Information",
      description:
        "Enter your personal details, education, experience, skills and projects.",
    },
    {
      number: "02",
      title: "Choose Your Template",
      description:
        "Select a professional template that matches your career profile.",
    },
    {
      number: "03",
      title: "Enhance With AI",
      description:
        "Use AI assistance to improve your resume content and presentation.",
    },
    {
      number: "04",
      title: "Prepare For Jobs",
      description:
        "Create cover letters, practice interviews and search for opportunities.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f9f9] text-[#043442]">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden px-5 sm:px-8 lg:px-12 py-16 sm:py-20">

        {/* Decorative Background */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl"></div>

        <div className="absolute top-10 -right-32 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl"></div>

        <div className="relative max-w-5xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-2 mb-7">

            <span className="w-2.5 h-2.5 bg-teal-500 rounded-full"></span>

            <span className="text-sm font-semibold text-[#043442]">
              AI-Powered Career Platform
            </span>

          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            About Our
            <span className="block bg-gradient-to-r from-[#043442] via-teal-600 to-cyan-500 bg-clip-text text-transparent">
              AI Resume Builder
            </span>
          </h1>

          <p className="max-w-3xl mx-auto mt-6 text-gray-600 text-base sm:text-lg lg:text-xl leading-relaxed">
            A smarter way to build professional resumes, improve your career
            profile, prepare for interviews and become job-ready.
          </p>

        </div>
      </section>

      {/* ================= INTRO ================= */}
      <section className="px-5 sm:px-8 lg:px-12 pb-16">

        <div className="max-w-6xl mx-auto">

          <div className="relative bg-[#043442] rounded-3xl overflow-hidden shadow-xl">

            {/* Decorative circles */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-500/20 rounded-full blur-2xl"></div>

            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl"></div>

            <div className="relative grid lg:grid-cols-2 gap-10 p-8 sm:p-10 lg:p-14">

              <div className="text-white">

                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl mb-6">
                  📄
                </div>

                <span className="text-teal-300 text-sm font-bold uppercase tracking-widest">
                  Who We Are
                </span>

                <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-5">
                  More than just a resume builder.
                </h2>

                <p className="text-white/70 leading-relaxed text-base sm:text-lg">
                  Our platform combines resume building, artificial
                  intelligence and career preparation tools into one simple
                  experience.
                </p>

                <p className="text-white/70 leading-relaxed mt-4">
                  We designed it for students, professionals, fresh graduates
                  and career changers who want to present their skills and
                  experience in a professional way.
                </p>

              </div>

              {/* Right side mini dashboard */}
              <div className="flex items-center">

                <div className="w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5">

                  <div className="flex items-center gap-3 mb-5">

                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                      📊
                    </div>

                    <div>
                      <p className="text-white font-semibold">
                        Career Toolkit
                      </p>

                      <p className="text-white/50 text-xs">
                        Everything in one platform
                      </p>
                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    {[
                      ["📄", "Resume"],
                      ["✨", "AI Enhance"],
                      ["💼", "Cover Letter"],
                      ["🎯", "Interview"],
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="bg-white/10 rounded-xl p-4"
                      >
                        <div className="text-2xl mb-2">{item[0]}</div>

                        <p className="text-white text-sm font-medium">
                          {item[1]}
                        </p>
                      </div>
                    ))}

                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="px-5 sm:px-8 lg:px-12 py-16">

        <div className="max-w-6xl mx-auto">

          <div className="text-center max-w-2xl mx-auto mb-12">

            <span className="text-teal-600 text-sm font-bold uppercase tracking-widest">
              Platform Features
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3">
              Everything you need for your
              <span className="text-teal-600"> career journey</span>
            </h2>

            <p className="text-gray-500 mt-4 leading-relaxed">
              Our platform brings multiple career preparation tools together
              so you can focus on finding the right opportunity.
            </p>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >

                <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="w-14 h-14 bg-[#043442]/5 rounded-2xl flex items-center justify-center text-3xl mb-5 group-hover:bg-teal-50 transition">
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.description}
                </p>

              </div>
            ))}

          </div>

        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="px-5 sm:px-8 lg:px-12 py-16 bg-white">

        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-12">

            <span className="text-teal-600 text-sm font-bold uppercase tracking-widest">
              Simple & Easy
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3">
              How the platform works
            </h2>

          </div>

          <div className="relative">

            {/* Connecting line */}
            <div className="hidden lg:block absolute top-8 left-[12%] right-[12%] h-px bg-gray-200"></div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">

              {steps.map((step, index) => (
                <div
                  key={index}
                  className="relative text-center"
                >

                  <div className="relative z-10 w-16 h-16 mx-auto bg-[#043442] text-white rounded-2xl flex items-center justify-center font-bold text-sm shadow-lg">
                    {step.number}
                  </div>

                  <h3 className="font-bold text-lg mt-5 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-gray-500 text-sm leading-relaxed">
                    {step.description}
                  </p>

                </div>
              ))}

            </div>

          </div>

        </div>
      </section>

      {/* ================= VISION ================= */}
      <section className="px-5 sm:px-8 lg:px-12 py-20">

        <div className="max-w-4xl mx-auto text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#043442] text-white flex items-center justify-center text-3xl shadow-lg mb-6">
            🔮
          </div>

          <span className="text-teal-600 text-sm font-bold uppercase tracking-widest">
            Our Vision
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-6">
            Making career preparation smarter
          </h2>

          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            Our vision is to create a complete AI-powered career assistant
            that helps people build better resumes, write professional cover
            letters, practice interviews and discover suitable job
            opportunities — all through one simple platform.
          </p>

        </div>
      </section>

      {/* ================= FOOTER TEXT ================= */}
      <section className="border-t border-gray-200 bg-white py-8">

        <div className="max-w-6xl mx-auto text-center px-5">

          <p className="text-[#043442] font-semibold">
            Resume Builder
          </p>

          <p className="text-gray-400 text-sm mt-1">
            Build smarter. Present better. Prepare confidently.
          </p>

        </div>

      </section>

    </div>
  );
};

export default About;