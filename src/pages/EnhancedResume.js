import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";

export default function EnhancedResume() {
  const navigate = useNavigate();

  const resume = sessionStorage.getItem("enhancedResume");
  const originalName =
    sessionStorage.getItem("originalResumeName");

  // =========================================================
  // CLEAN AI TEXT
  // =========================================================

  const cleanLine = (line) => {
    if (!line) return "";

    return line
      .replace(/\r/g, "")
      .replace(/^\s*#{1,6}\s*/, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .trim();
  };

  // =========================================================
  // CHECK SECTION HEADING
  // =========================================================

  const isSectionHeading = (line) => {
    if (!line) return false;

    const clean = cleanLine(line)
      .replace(/[:\-]+$/, "")
      .trim();

    const normalized = clean.toLowerCase();

    const sections = [
      "professional summary",
      "summary",
      "profile",
      "professional profile",

      "technical skills",
      "skills",
      "core skills",
      "core competencies",
      "core competencies & skills",
      "key skills",

      "professional experience",
      "work experience",
      "experience",
      "employment history",

      "projects",
      "professional projects",
      "software development projects",

      "education",
      "academic background",
      "qualification",

      "certifications",
      "certificates",

      "achievements",
      "accomplishments",

      "languages",

      "interests",
      "hobbies",

      "references",

      "additional information",
    ];

    if (sections.includes(normalized)) {
      return true;
    }

    // Detect uppercase AI headings
    if (
      clean.length >= 3 &&
      clean.length <= 60 &&
      clean === clean.toUpperCase() &&
      /[A-Z]/.test(clean)
    ) {
      return true;
    }

    return false;
  };

  // =========================================================
  // BULLET DETECTION
  // =========================================================

  const isBullet = (line) => {
    if (!line) return false;

    return (
      /^\s*[•●▪◦]\s+/.test(line) ||
      /^\s*[-*]\s+/.test(line) ||
      /^\s*\d+\.\s+/.test(line)
    );
  };

  // =========================================================
  // REMOVE BULLET SYMBOL
  // =========================================================

  const removeBullet = (line) => {
    return line
      .replace(/^\s*[•●▪◦]\s+/, "")
      .replace(/^\s*[-*]\s+/, "")
      .replace(/^\s*\d+\.\s+/, "")
      .trim();
  };

  // =========================================================
  // PARSE RESUME
  // =========================================================

  const parsedResume = useMemo(() => {
    if (!resume) {
      return {
        name: "",
        subtitle: "",
        contact: [],
        sections: [],
      };
    }

    let lines = resume
      .replace(/\r/g, "")
      .split("\n")
      .map((line) => line.trim());

    // Remove empty lines at beginning/end
    while (lines.length && !lines[0]) {
      lines.shift();
    }

    while (lines.length && !lines[lines.length - 1]) {
      lines.pop();
    }

    // Remove unwanted markdown separators
    lines = lines.filter(
      (line) =>
        !/^[-_=]{3,}$/.test(line.trim())
    );

    let name = "";
    let subtitle = "";
    let contact = [];

    // =======================================================
    // HEADER
    // =======================================================

    let firstSectionIndex = lines.findIndex((line) =>
      isSectionHeading(line)
    );

    if (firstSectionIndex === -1) {
      firstSectionIndex = Math.min(lines.length, 6);
    }

    const headerLines = lines.slice(
      0,
      firstSectionIndex
    );

    if (headerLines.length > 0) {
      name = cleanLine(headerLines[0]);
    }

    if (headerLines.length > 1) {
      subtitle = cleanLine(headerLines[1]);
    }

    if (headerLines.length > 2) {
      contact = headerLines
        .slice(2)
        .flatMap((line) =>
          line
            .split("|")
            .map((item) => cleanLine(item))
            .filter(Boolean)
        );
    }

    // =======================================================
    // SECTIONS
    // =======================================================

    const sections = [];

    let currentSection = null;

    for (
      let i = firstSectionIndex;
      i < lines.length;
      i++
    ) {
      const rawLine = lines[i];

      if (!rawLine) {
        continue;
      }

      const line = cleanLine(rawLine);

      if (!line) {
        continue;
      }

      if (isSectionHeading(line)) {
        const title = line
          .replace(/[:\-]+$/, "")
          .trim();

        currentSection = {
          title,
          items: [],
        };

        sections.push(currentSection);

        continue;
      }

      if (!currentSection) {
        currentSection = {
          title: "Professional Profile",
          items: [],
        };

        sections.push(currentSection);
      }

      currentSection.items.push({
        type: isBullet(line)
          ? "bullet"
          : "text",
        text: isBullet(line)
          ? removeBullet(line)
          : line,
      });
    }

    return {
      name,
      subtitle,
      contact,
      sections,
    };
  }, [resume]);

  // =========================================================
  // BACK
  // =========================================================

  const handleBack = () => {
    navigate("/ResumeLanding");
  };

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  const handleDownloadPDF = async () => {
    if (!resume) {
      alert("No enhanced resume available.");
      return;
    }

    const element =
      document.getElementById(
        "resume-pdf-content"
      );

    if (!element) {
      alert("Resume content not found.");
      return;
    }

    try {
      const safeName = originalName
        ? originalName
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-zA-Z0-9-_]/g, "_")
        : parsedResume.name
            ?.replace(/[^a-zA-Z0-9-_]/g, "_") ||
          "AI_Enhanced_Resume";

      const options = {
        margin: [8, 8, 8, 8],

        filename:
          `${safeName}_AI_Enhanced.pdf`,

        image: {
          type: "jpeg",
          quality: 0.98,
        },

        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          logging: false,
          scrollX: 0,
          scrollY: 0,
        },

        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },

        pagebreak: {
          mode: ["css", "legacy"],
          avoid: [
            ".resume-section",
            ".resume-item",
            ".resume-header",
          ],
        },
      };

      await html2pdf()
        .set(options)
        .from(element)
        .save();

    } catch (error) {
      console.error(
        "PDF Download Error:",
        error
      );

      alert(
        "Unable to download PDF. Please try again."
      );
    }
  };

  // =========================================================
  // PRINT
  // =========================================================

  const handlePrint = () => {
    if (!resume) {
      alert("No enhanced resume available.");
      return;
    }

    window.print();
  };

  // =========================================================
  // DOWNLOAD TXT
  // =========================================================

  const handleDownloadTXT = () => {
    if (!resume) {
      alert("No enhanced resume available.");
      return;
    }

    try {
      const blob = new Blob(
        [resume],
        {
          type: "text/plain;charset=utf-8",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      const safeName = originalName
        ? originalName
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-zA-Z0-9-_]/g, "_")
        : "AI_Enhanced_Resume";

      link.download =
        `${safeName}_AI_Enhanced.txt`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(
        "TXT Download Error:",
        error
      );

      alert(
        "Unable to download TXT file."
      );
    }
  };

  // =========================================================
  // EMPTY STATE
  // =========================================================

  if (!resume) {
    return (
      <div className="min-h-screen bg-[#f4f7f8] p-6">

        <div className="max-w-3xl mx-auto">

          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">

            <div className="text-5xl mb-5">
              📄
            </div>

            <h1 className="text-2xl font-bold text-[#043442]">
              No Enhanced Resume Found
            </h1>

            <p className="text-gray-500 mt-3">
              Please upload your resume and
              generate an enhanced version first.
            </p>

            <button
              onClick={() =>
                navigate("/UploadResume")
              }
              className="
                mt-6
                px-6
                py-3
                bg-[#043442]
                text-white
                rounded-lg
                font-semibold
                hover:bg-[#064e63]
                transition
              "
            >
              Upload Resume →
            </button>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div
      className="
        min-h-screen
        bg-[#f3f6f7]
        py-6
        px-3
        sm:px-6
      "
    >

      {/* =====================================================
          CONTROL HEADER
      ====================================================== */}

      <div
        className="
          max-w-6xl
          mx-auto
          mb-6
          print:hidden
        "
      >

        <div
          className="
            bg-white
            rounded-2xl
            shadow-lg
            p-5
            sm:p-6
          "
        >

          <div
            className="
              flex
              flex-col
              md:flex-row
              justify-between
              items-start
              md:items-center
              gap-5
            "
          >

            <div>

              <div className="flex items-center gap-3">

                <div
                  className="
                    w-11
                    h-11
                    rounded-xl
                    bg-[#043442]
                    text-white
                    flex
                    items-center
                    justify-center
                    text-xl
                  "
                >
                  ✨
                </div>

                <div>

                  <h1
                    className="
                      text-xl
                      sm:text-2xl
                      font-bold
                      text-[#043442]
                    "
                  >
                    AI Enhanced Resume
                  </h1>

                  <p className="text-sm text-gray-500">
                    Professionally formatted
                    AI-enhanced resume
                  </p>

                </div>

              </div>

              {originalName && (
                <div
                  className="
                    mt-4
                    inline-flex
                    items-center
                    gap-2
                    bg-gray-100
                    rounded-lg
                    px-3
                    py-2
                  "
                >
                  <span>📄</span>

                  <span className="text-sm text-gray-600">
                    Source:
                    <strong className="ml-1 text-gray-800">
                      {originalName}
                    </strong>
                  </span>

                </div>
              )}

            </div>

            <div className="flex flex-wrap gap-2">

              <button
                onClick={handleBack}
                className="
                  px-4
                  py-2.5
                  border
                  border-[#043442]
                  text-[#043442]
                  rounded-lg
                  font-semibold
                  hover:bg-[#043442]
                  hover:text-white
                  transition
                "
              >
                ← Back
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          RESUME AREA
      ====================================================== */}

      <div className="max-w-6xl mx-auto">

        <div
          className="
            flex
            flex-wrap
            gap-3
            mb-5
            print:hidden
          "
        >

          <button
            onClick={handleDownloadPDF}
            className="
              flex-1
              min-w-[180px]
              px-5
              py-3
              rounded-xl
              bg-[#043442]
              text-white
              font-semibold
              shadow-md
              hover:bg-[#064e63]
              transition
            "
          >
            📥 Download PDF
          </button>

          <button
            onClick={handlePrint}
            className="
              flex-1
              min-w-[180px]
              px-5
              py-3
              rounded-xl
              border-2
              border-[#043442]
              bg-white
              text-[#043442]
              font-semibold
              hover:bg-[#043442]
              hover:text-white
              transition
            "
          >
            🖨️ Print Resume
          </button>

          <button
            onClick={handleDownloadTXT}
            className="
              flex-1
              min-w-[180px]
              px-5
              py-3
              rounded-xl
              bg-gray-200
              text-gray-700
              font-semibold
              hover:bg-gray-300
              transition
            "
          >
            📄 Download TXT
          </button>

        </div>

        {/* ===================================================
            ACTUAL RESUME
        ==================================================== */}

        <div
          id="resume-pdf-content"
          className="
            resume-document
            bg-white
            mx-auto
            shadow-xl
            rounded-lg
            px-7
            py-8
            sm:px-12
            sm:py-10
          "
        >

          {/* =================================================
              RESUME HEADER
          ================================================== */}

          <header
            className="
              resume-header
              text-center
              pb-5
              mb-6
              border-b-2
              border-[#043442]
            "
          >

            <h1
              className="
                resume-name
                text-3xl
                sm:text-4xl
                font-bold
                tracking-wide
                text-[#043442]
                uppercase
              "
            >
              {parsedResume.name ||
                "Professional Resume"}
            </h1>

            {parsedResume.subtitle && (
              <div
                className="
                  mt-2
                  text-base
                  sm:text-lg
                  font-medium
                  text-gray-600
                "
              >
                {parsedResume.subtitle}
              </div>
            )}

            {parsedResume.contact.length > 0 && (
              <div
                className="
                  mt-3
                  flex
                  flex-wrap
                  justify-center
                  gap-x-4
                  gap-y-1
                  text-xs
                  sm:text-sm
                  text-gray-600
                "
              >

                {parsedResume.contact.map(
                  (item, index) => (
                    <span
                      key={index}
                      className="contact-item"
                    >
                      {item}
                    </span>
                  )
                )}

              </div>
            )}

          </header>

          {/* =================================================
              SECTIONS
          ================================================== */}

          <main>

            {parsedResume.sections.map(
              (section, sectionIndex) => (

                <section
                  key={sectionIndex}
                  className="
                    resume-section
                    mb-6
                  "
                >

                  {/* Section heading */}

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      mb-3
                    "
                  >

                    <h2
                      className="
                        text-sm
                        sm:text-base
                        font-bold
                        uppercase
                        tracking-wider
                        text-[#043442]
                        whitespace-nowrap
                      "
                    >
                      {section.title}
                    </h2>

                    <div
                      className="
                        h-[1.5px]
                        bg-[#043442]
                        flex-1
                        opacity-70
                      "
                    />

                  </div>

                  {/* Section content */}

                  <div className="space-y-2">

                    {section.items.map(
                      (item, itemIndex) => {

                        if (
                          item.type ===
                          "bullet"
                        ) {
                          return (
                            <div
                              key={itemIndex}
                              className="
                                resume-item
                                flex
                                items-start
                                gap-2
                                text-[11px]
                                sm:text-[12px]
                                leading-[1.55]
                                text-gray-700
                              "
                            >

                              <span
                                className="
                                  mt-[6px]
                                  w-1.5
                                  h-1.5
                                  min-w-[6px]
                                  rounded-full
                                  bg-[#043442]
                                "
                              />

                              <span className="flex-1">
                                {item.text}
                              </span>

                            </div>
                          );
                        }

                        return (
                          <p
                            key={itemIndex}
                            className="
                              resume-item
                              text-[11px]
                              sm:text-[12px]
                              leading-[1.6]
                              text-gray-700
                            "
                          >
                            {item.text}
                          </p>
                        );
                      }
                    )}

                  </div>

                </section>

              )
            )}

          </main>

          {/* =================================================
              FOOTER
          ================================================== */}

          <footer
            className="
              mt-8
              pt-3
              border-t
              border-gray-200
              text-center
              text-[8px]
              text-gray-400
            "
          >
            AI-enhanced resume
          </footer>

        </div>

      </div>

      {/* =====================================================
          CSS
      ====================================================== */}

      <style>{`

        /* ================================================
           SCREEN
        ================================================= */

        .resume-document {
          width: 100%;
          max-width: 850px;
          min-height: 1100px;
          box-sizing: border-box;
        }

        .resume-section {
          page-break-inside: auto;
          break-inside: auto;
        }

        .resume-item {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .resume-header {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        /* ================================================
           PRINT
        ================================================= */

        @media print {

          @page {
            size: A4;
            margin: 10mm 12mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden;
          }

          #resume-pdf-content,
          #resume-pdf-content * {
            visibility: visible;
          }

          #resume-pdf-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;

            width: 100% !important;
            max-width: none !important;

            margin: 0 !important;
            padding: 0 !important;

            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;

            background: white !important;
          }

          .resume-document {
            min-height: auto !important;
          }

          .resume-header {
            margin-bottom: 18px !important;
          }

          .resume-section {
            margin-bottom: 17px !important;
          }

          .resume-item {
            font-size: 10.5pt !important;
            line-height: 1.45 !important;
          }

          .resume-name {
            font-size: 24pt !important;
          }

          .contact-item {
            font-size: 9pt !important;
          }

          footer {
            display: none !important;
          }

          h2 {
            font-size: 11pt !important;
          }

        }

        /* ================================================
           PDF
        ================================================= */

        .resume-document {
          page-break-after: auto;
        }

        .resume-section {
          break-inside: auto;
        }

        .resume-item {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        h1,
        h2,
        p,
        div {
          overflow-wrap: break-word;
        }

      `}</style>

    </div>
  );
}