import React, { useEffect, useState } from "react";
import { apiUrl, authHeaders } from "../config/api";
import { useNavigate } from "react-router-dom";

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(apiUrl("/templates"), {
        method: "GET",
        headers: authHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load templates"
        );
      }

      setTemplates(result.templates || []);
    } catch (err) {
      console.error("Templates error:", err);

      setError(
        err.message || "Unable to load templates."
      );
    } finally {
      setLoading(false);
    }
  }

function handleUseTemplate(template) {
      localStorage.setItem(
      "selected_template",
      JSON.stringify(template)
    );

    navigate("/create");
  }

  return (
    <div className="min-h-screen bg-[#e5e7e7] px-4 md:px-6 py-12">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="text-center mb-12">

          <h1 className="text-4xl md:text-5xl font-bold text-[#043442]">
            Resume Templates
          </h1>

          <p className="text-gray-600 mt-4 text-lg">
            Choose a professional design for your resume
          </p>

        </div>


        {/* LOADING */}

        {loading && (
          <div className="text-center py-16">

            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#043442] mx-auto"></div>

            <p className="text-gray-600 mt-4">
              Loading templates...
            </p>

          </div>
        )}


        {/* ERROR */}

        {!loading && error && (
          <div className="max-w-xl mx-auto bg-red-50 border border-red-200 rounded-xl p-6 text-center">

            <p className="text-red-700">
              {error}
            </p>

            <button
              onClick={fetchTemplates}
              className="mt-5 bg-[#043442] text-white px-6 py-2.5 rounded-lg hover:bg-[#032c36]"
            >
              Try Again
            </button>

          </div>
        )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          templates.length === 0 && (
            <div className="bg-white rounded-xl shadow p-10 text-center">

              <h2 className="text-xl font-semibold text-gray-800">
                No templates available
              </h2>

              <p className="text-gray-500 mt-2">
                Please check back later.
              </p>

            </div>
          )}


        {/* TEMPLATES */}

        {!loading &&
          !error &&
          templates.length > 0 && (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

              {templates.map((template) => (

                <div
                  key={template.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >

                  {/* PREVIEW */}

                  <div className="h-[360px] bg-gray-200 flex items-center justify-center p-6 overflow-hidden">

                    <TemplatePreview
                      type={template.template_type}
                    />

                  </div>


                  {/* DETAILS */}

                  <div className="p-6">

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <h2 className="text-xl font-bold text-[#043442]">
                          {template.name}
                        </h2>

                        <p className="text-gray-600 text-sm mt-2 leading-6">
                          {template.description ||
                            "Professional resume template"}
                        </p>

                      </div>

                    </div>


                    {/* TYPE */}

                    <div className="mt-4">

                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full capitalize">
                        {template.template_type ||
                          "professional"}
                      </span>

                    </div>


                    {/* BUTTON */}

                    <button
                     onClick={() =>
  handleUseTemplate(template)
}
                      className="mt-5 w-full bg-[#043442] text-white py-3 rounded-xl font-semibold hover:bg-[#032c36] transition"
                    >
                      Use This Template
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

      </div>

    </div>
  );
}


/*
=========================================================
TEMPLATE PREVIEW
=========================================================
*/

function TemplatePreview({ type }) {

  switch (type) {

    case "modern":
      return <ModernPreview />;

    case "professional":
      return <ProfessionalPreview />;

    case "minimal":
      return <MinimalPreview />;

    case "creative":
      return <CreativePreview />;

    case "executive":
      return <ExecutivePreview />;

    default:
      return <ProfessionalPreview />;
  }
}


/*
=========================================================
MODERN
=========================================================
*/

function ModernPreview() {

  return (
    <div className="w-[230px] h-[325px] bg-white shadow-2xl rounded-sm overflow-hidden">

      <div className="h-16 bg-[#043442] p-4">

        <div className="h-3 w-28 bg-white rounded"></div>

        <div className="h-2 w-20 bg-gray-300 rounded mt-2"></div>

      </div>


      <div className="p-4">

        <div className="flex gap-2 mb-5">

          <div className="h-2 w-12 bg-[#043442] rounded"></div>

          <div className="h-2 w-12 bg-gray-300 rounded"></div>

          <div className="h-2 w-12 bg-gray-300 rounded"></div>

        </div>


        <PreviewSection
          title="PROFILE"
        />

        <PreviewLines />


        <PreviewSection
          title="EXPERIENCE"
        />

        <div className="h-2 w-24 bg-gray-700 rounded mb-2"></div>

        <PreviewLines />


        <PreviewSection
          title="SKILLS"
        />

        <PreviewLines small />

      </div>

    </div>
  );
}


/*
=========================================================
PROFESSIONAL
=========================================================
*/

function ProfessionalPreview() {

  return (
    <div className="w-[230px] h-[325px] bg-white shadow-2xl rounded-sm overflow-hidden">

      <div className="p-5">

        <div className="text-center">

          <div className="h-4 w-32 bg-[#1e293b] rounded mx-auto"></div>

          <div className="h-2 w-24 bg-gray-400 rounded mx-auto mt-2"></div>

          <div className="flex justify-center gap-2 mt-3">

            <div className="h-1.5 w-10 bg-gray-300 rounded"></div>

            <div className="h-1.5 w-10 bg-gray-300 rounded"></div>

            <div className="h-1.5 w-10 bg-gray-300 rounded"></div>

          </div>

        </div>


        <div className="border-t border-gray-300 mt-5 pt-4">

          <PreviewSection
            title="PROFESSIONAL SUMMARY"
          />

          <PreviewLines />


          <PreviewSection
            title="WORK EXPERIENCE"
          />

          <div className="h-2 w-28 bg-gray-700 rounded mb-2"></div>

          <PreviewLines />


          <PreviewSection
            title="EDUCATION"
          />

          <PreviewLines small />

        </div>

      </div>

    </div>
  );
}


/*
=========================================================
MINIMAL
=========================================================
*/

function MinimalPreview() {

  return (
    <div className="w-[230px] h-[325px] bg-white shadow-2xl rounded-sm overflow-hidden">

      <div className="p-6">

        <div className="h-4 w-28 bg-gray-800 rounded"></div>

        <div className="h-2 w-20 bg-gray-400 rounded mt-2"></div>


        <div className="mt-7">

          <PreviewSection
            title="SUMMARY"
          />

          <PreviewLines />


          <PreviewSection
            title="EXPERIENCE"
          />

          <div className="h-2 w-24 bg-gray-700 rounded mb-2"></div>

          <PreviewLines />


          <div className="h-2 w-20 bg-gray-700 rounded mb-2 mt-4"></div>

          <PreviewLines />


          <PreviewSection
            title="SKILLS"
          />

          <PreviewLines small />

        </div>

      </div>

    </div>
  );
}


/*
=========================================================
CREATIVE
=========================================================
*/

function CreativePreview() {

  return (
    <div className="w-[230px] h-[325px] bg-white shadow-2xl rounded-sm overflow-hidden flex">

      {/* SIDEBAR */}

      <div className="w-16 bg-purple-700 p-3">

        <div className="w-10 h-10 bg-white rounded-full mx-auto mb-5"></div>

        <div className="h-2 w-8 bg-purple-200 rounded mx-auto mb-2"></div>

        <div className="h-1.5 w-10 bg-purple-300 rounded mx-auto mb-1"></div>

        <div className="h-1.5 w-8 bg-purple-300 rounded mx-auto mb-1"></div>

        <div className="h-1.5 w-10 bg-purple-300 rounded mx-auto"></div>

      </div>


      {/* CONTENT */}

      <div className="flex-1 p-4">

        <div className="h-4 w-28 bg-gray-800 rounded"></div>

        <div className="h-2 w-20 bg-purple-500 rounded mt-2"></div>


        <PreviewSection
          title="PROFILE"
        />

        <PreviewLines />


        <PreviewSection
          title="EXPERIENCE"
        />

        <div className="h-2 w-24 bg-gray-700 rounded mb-2"></div>

        <PreviewLines />


        <PreviewSection
          title="PROJECTS"
        />

        <PreviewLines small />

      </div>

    </div>
  );
}


/*
=========================================================
EXECUTIVE
=========================================================
*/

function ExecutivePreview() {

  return (
    <div className="w-[230px] h-[325px] bg-white shadow-2xl rounded-sm overflow-hidden">

      <div className="bg-gray-900 p-5">

        <div className="h-4 w-32 bg-white rounded"></div>

        <div className="h-2 w-24 bg-gray-400 rounded mt-2"></div>

      </div>


      <div className="p-5">

        <div className="flex items-center gap-2 mb-5">

          <div className="h-1 w-12 bg-gray-800"></div>

          <div className="h-2 w-16 bg-gray-800 rounded"></div>

        </div>


        <PreviewLines />


        <div className="flex items-center gap-2 mb-5 mt-5">

          <div className="h-1 w-12 bg-gray-800"></div>

          <div className="h-2 w-20 bg-gray-800 rounded"></div>

        </div>


        <div className="h-2 w-24 bg-gray-700 rounded mb-2"></div>

        <PreviewLines />


        <div className="flex items-center gap-2 mb-5 mt-5">

          <div className="h-1 w-12 bg-gray-800"></div>

          <div className="h-2 w-14 bg-gray-800 rounded"></div>

        </div>

        <PreviewLines small />

      </div>

    </div>
  );
}


/*
=========================================================
COMMON PREVIEW COMPONENTS
=========================================================
*/

function PreviewSection({ title }) {

  return (
    <div className="mt-4 mb-2">

      <div className="text-[7px] font-bold tracking-wider text-[#043442]">
        {title}
      </div>

      <div className="h-[1px] bg-gray-300 mt-1"></div>

    </div>
  );
}


function PreviewLines({ small = false }) {

  return (
    <div className="space-y-1">

      <div
        className={`h-1.5 bg-gray-200 rounded ${
          small ? "w-3/4" : "w-full"
        }`}
      ></div>

      <div
        className={`h-1.5 bg-gray-200 rounded ${
          small ? "w-2/3" : "w-5/6"
        }`}
      ></div>

      <div
        className={`h-1.5 bg-gray-200 rounded ${
          small ? "w-1/2" : "w-4/6"
        }`}
      ></div>

    </div>
  );
}