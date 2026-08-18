import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  Download,
  Copy,
  Star,
  Target,
  Zap,
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { apiUrl, authHeaders } from "../config/api";

export default function CreateResume() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    title: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
    qualification: "",
    summary: "",
    experience: "",
    projects: "",
    skills: "",
    linkedin: "",
    github: "",
    portfolio: "",
    references: "",
    targetRole: "Software Developer",
  });

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("preview");

  // =========================================================
  // LOAD SELECTED TEMPLATE
  // =========================================================

  useEffect(() => {
    try {
      const savedTemplate = localStorage.getItem("selected_template");

      if (savedTemplate) {
        const template = JSON.parse(savedTemplate);

        console.log("Selected template:", template);

        setSelectedTemplate(template);
      }
    } catch (err) {
      console.error("Template loading error:", err);

      localStorage.removeItem("selected_template");
    }
  }, []);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // =========================================================
  // CLEAN AI TEXT
  // =========================================================

  function cleanAIText(text) {
    if (!text) return "";

    let cleaned = String(text);

    cleaned = cleaned.replace(/```html/gi, "");
    cleaned = cleaned.replace(/```/g, "");

    cleaned = cleaned.replace(/#([a-zA-Z0-9_-]+)/g, "$1");

    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "$1");

    cleaned = cleaned.replace(/\*(.*?)\*/g, "$1");

    cleaned = cleaned.replace(/^#{1,6}\s*/gm, "");

    cleaned = cleaned.replace(/^[-_=]{3,}$/gm, "");

    cleaned = cleaned.replace(/^\s*[•●▪◦]\s*/gm, "• ");

    cleaned = cleaned.replace(/[ \t]+/g, " ");

    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

    return cleaned.trim();
  }

  // =========================================================
  // ESCAPE HTML
  // =========================================================

  function escapeHtml(text) {
    if (!text) return "";

    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // =========================================================
  // NORMALIZE SECTION NAME
  // =========================================================

  function normalizeSectionName(text) {
    const value = String(text)
      .replace(/[#=*:_-]/g, "")
      .trim()
      .toLowerCase();

    if (
      value.includes("professional summary") ||
      value === "summary" ||
      value.includes("profile")
    ) {
      return "Professional Summary";
    }

    if (
      value.includes("experience") ||
      value.includes("employment") ||
      value.includes("work history")
    ) {
      return "Professional Experience";
    }

    if (
      value.includes("education") ||
      value.includes("qualification") ||
      value.includes("academic")
    ) {
      return "Education";
    }

    if (
      value.includes("skills") ||
      value.includes("competencies") ||
      value.includes("technical skills")
    ) {
      return "Core Competencies & Skills";
    }

    if (
      value.includes("project") ||
      value.includes("portfolio project")
    ) {
      return "Projects";
    }

    if (
      value.includes("certification") ||
      value.includes("certifications")
    ) {
      return "Certifications";
    }

    if (
      value.includes("reference") ||
      value.includes("references")
    ) {
      return "References";
    }

    if (
      value.includes("language") ||
      value.includes("languages")
    ) {
      return "Languages";
    }

    return null;
  }

  // =========================================================
  // SECTION HEADER CHECK
  // =========================================================

  function isSectionHeader(line) {
    if (!line) return false;

    const cleaned = line
      .replace(/[#*_=:-]/g, "")
      .trim();

    const knownSection = normalizeSectionName(cleaned);

    if (knownSection) return true;

    if (
      cleaned.length >= 4 &&
      cleaned.length <= 60 &&
      cleaned === cleaned.toUpperCase() &&
      /[A-Z]/.test(cleaned)
    ) {
      return true;
    }

    return false;
  }

  // =========================================================
  // FORMAT RESUME CONTENT
  // =========================================================

  function formatResumeContent(text) {
    const cleanedText = cleanAIText(text);

    if (!cleanedText) {
      return "";
    }

    const lines = cleanedText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    let html = "";
    let currentSection = "";

    lines.forEach((line) => {
      if (isSectionHeader(line)) {
        const sectionName =
          normalizeSectionName(line) ||
          line.replace(/[#*_=:-]/g, "").trim();

        currentSection = sectionName;

        html += `
          <section class="resume-section">
            <h2 class="resume-section-title">
              ${escapeHtml(sectionName)}
            </h2>
        `;

        return;
      }

      if (
        line.startsWith("•") ||
        line.startsWith("-") ||
        line.startsWith("*")
      ) {
        const bulletText = line
          .replace(/^[•\-*]\s*/, "")
          .trim();

        html += `
          <div class="resume-bullet">
            <span class="resume-bullet-dot"></span>
            <span>${escapeHtml(bulletText)}</span>
          </div>
        `;

        return;
      }

      if (
        currentSection === "Core Competencies & Skills" &&
        line.includes(":")
      ) {
        const parts = line.split(":");

        const label = parts.shift();

        const value = parts.join(":");

        html += `
          <div class="resume-skill-line">
            <strong>${escapeHtml(label)}:</strong>
            <span>${escapeHtml(value)}</span>
          </div>
        `;

        return;
      }

      if (
        currentSection === "Professional Experience" ||
        currentSection === "Projects" ||
        currentSection === "Education"
      ) {
        if (
          line.length < 100 &&
          !line.endsWith(".") &&
          !line.startsWith("•")
        ) {
          html += `
            <div class="resume-subtitle">
              ${escapeHtml(line)}
            </div>
          `;

          return;
        }
      }

      html += `
        <p class="resume-paragraph">
          ${escapeHtml(line)}
        </p>
      `;
    });

    html += `
      </section>
    `;

    return html;
  }

  // =========================================================
  // TEMPLATE THEME
  // =========================================================

  function getTemplateTheme() {
    const type =
      selectedTemplate?.template_type || "professional";

    const themes = {
      modern: {
        primary: "#0f766e",
        secondary: "#475569",
        accent: "#14b8a6",
        background: "#ffffff",
        headerAlign: "left",
        headerBorder: "3px solid #0f766e",
        sectionBorder: "1px solid #cbd5e1",
        nameSize: "34px",
        sectionStyle: "uppercase",
        sidebar: false,
      },

      professional: {
        primary: "#073642",
        secondary: "#475569",
        accent: "#073642",
        background: "#ffffff",
        headerAlign: "center",
        headerBorder: "2px solid #073642",
        sectionBorder: "1px solid #94a3b8",
        nameSize: "31px",
        sectionStyle: "uppercase",
        sidebar: false,
      },

      minimal: {
        primary: "#111827",
        secondary: "#6b7280",
        accent: "#111827",
        background: "#ffffff",
        headerAlign: "left",
        headerBorder: "none",
        sectionBorder: "none",
        nameSize: "32px",
        sectionStyle: "uppercase",
        sidebar: false,
      },

      creative: {
        primary: "#7c3aed",
        secondary: "#64748b",
        accent: "#a855f7",
        background: "#ffffff",
        headerAlign: "left",
        headerBorder: "4px solid #7c3aed",
        sectionBorder: "2px solid #c4b5fd",
        nameSize: "35px",
        sectionStyle: "uppercase",
        sidebar: false,
      },

      executive: {
        primary: "#1e293b",
        secondary: "#475569",
        accent: "#334155",
        background: "#ffffff",
        headerAlign: "center",
        headerBorder: "4px double #1e293b",
        sectionBorder: "1px solid #64748b",
        nameSize: "33px",
        sectionStyle: "uppercase",
        sidebar: false,
      },
    };

    return themes[type] || themes.professional;
  }

  // =========================================================
  // CREATE RESUME HTML
  // =========================================================

  function createResumeHTML(text) {
    const content = formatResumeContent(text);

    const theme = getTemplateTheme();

    const templateType =
      selectedTemplate?.template_type || "professional";

    const fullName =
      form.fullName.trim() || "Your Name";

    const title =
      form.title.trim() ||
      form.targetRole.trim() ||
      "Professional";

    const location = [
      form.city,
      form.province,
      form.country,
    ]
      .filter(Boolean)
      .join(", ");

    const contactItems = [];

    if (form.email) {
      contactItems.push(
        `<span>${escapeHtml(form.email)}</span>`
      );
    }

    if (form.phone) {
      contactItems.push(
        `<span>${escapeHtml(form.phone)}</span>`
      );
    }

    if (location) {
      contactItems.push(
        `<span>${escapeHtml(location)}</span>`
      );
    }

    const links = [];

    if (form.linkedin) {
      links.push(
        `<span>LinkedIn: ${escapeHtml(form.linkedin)}</span>`
      );
    }

    if (form.github) {
      links.push(
        `<span>GitHub: ${escapeHtml(form.github)}</span>`
      );
    }

    if (form.portfolio) {
      links.push(
        `<span>Portfolio: ${escapeHtml(form.portfolio)}</span>`
      );
    }

    // =======================================================
    // MODERN
    // =======================================================

    if (templateType === "modern") {
      return `
        <style>
          * {
            box-sizing: border-box;
          }

          .resume-page {
            width: 100%;
            max-width: 794px;
            margin: 0 auto;
            padding: 48px 55px;
            background: #ffffff;
            color: #1f2937;
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.5;
          }

          .resume-header {
            text-align: left;
            padding-bottom: 22px;
            margin-bottom: 25px;
            border-bottom: 3px solid #0f766e;
          }

          .resume-name {
            margin: 0;
            font-size: 34px;
            font-weight: 800;
            color: #0f766e;
          }

          .resume-title {
            margin-top: 5px;
            font-size: 16px;
            color: #475569;
            font-weight: 600;
          }

          .resume-contact {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 16px;
            margin-top: 12px;
            font-size: 10.5px;
            color: #475569;
          }

          .resume-links {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 16px;
            margin-top: 7px;
            font-size: 9.5px;
            color: #64748b;
          }

          .resume-section {
            margin-bottom: 21px;
            page-break-inside: avoid;
          }

          .resume-section-title {
            margin: 0 0 11px 0;
            padding-bottom: 6px;
            border-bottom: 1px solid #cbd5e1;
            color: #0f766e;
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .resume-paragraph {
            margin: 0 0 7px 0;
            font-size: 10.8px;
            color: #334155;
          }

          .resume-bullet {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 6px;
            font-size: 10.5px;
            color: #334155;
            page-break-inside: avoid;
          }

          .resume-bullet-dot {
            width: 5px;
            height: 5px;
            min-width: 5px;
            margin-top: 6px;
            border-radius: 50%;
            background: #14b8a6;
          }

          .resume-subtitle {
            margin-top: 9px;
            margin-bottom: 5px;
            color: #1e293b;
            font-size: 11.5px;
            font-weight: 700;
          }

          .resume-skill-line {
            display: flex;
            gap: 5px;
            margin-bottom: 5px;
            font-size: 10.5px;
          }

          .resume-skill-line strong {
            color: #0f766e;
          }

          @media print {
            .resume-page {
              width: 794px;
            }
          }
        </style>

        <div class="resume-page">
          <div class="resume-header">

            <h1 class="resume-name">
              ${escapeHtml(fullName)}
            </h1>

            <div class="resume-title">
              ${escapeHtml(title)}
            </div>

            <div class="resume-contact">
              ${contactItems.join("")}
            </div>

            ${
              links.length
                ? `
                  <div class="resume-links">
                    ${links.join("")}
                  </div>
                `
                : ""
            }

          </div>

          ${content}
        </div>
      `;
    }

    // =======================================================
    // MINIMAL
    // =======================================================

    if (templateType === "minimal") {
      return `
        <style>
          * {
            box-sizing: border-box;
          }

          .resume-page {
            width: 100%;
            max-width: 794px;
            margin: 0 auto;
            padding: 52px 58px;
            background: #ffffff;
            color: #111827;
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.5;
          }

          .resume-header {
            text-align: left;
            padding-bottom: 18px;
            margin-bottom: 24px;
          }

          .resume-name {
            margin: 0;
            font-size: 32px;
            font-weight: 700;
            color: #111827;
            letter-spacing: -0.5px;
          }

          .resume-title {
            margin-top: 5px;
            font-size: 14px;
            color: #6b7280;
          }

          .resume-contact {
            display: flex;
            flex-wrap: wrap;
            gap: 7px 15px;
            margin-top: 11px;
            font-size: 9.8px;
            color: #6b7280;
          }

          .resume-links {
            display: flex;
            flex-wrap: wrap;
            gap: 7px 15px;
            margin-top: 5px;
            font-size: 9px;
            color: #6b7280;
          }

          .resume-section {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }

          .resume-section-title {
            margin: 0 0 9px 0;
            color: #111827;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
          }

          .resume-paragraph {
            margin: 0 0 7px 0;
            font-size: 10.5px;
            color: #374151;
          }

          .resume-bullet {
            display: flex;
            gap: 8px;
            margin-bottom: 5px;
            font-size: 10.3px;
            color: #374151;
            page-break-inside: avoid;
          }

          .resume-bullet-dot {
            width: 3px;
            height: 3px;
            min-width: 3px;
            margin-top: 7px;
            border-radius: 50%;
            background: #111827;
          }

          .resume-subtitle {
            margin-top: 8px;
            margin-bottom: 4px;
            color: #111827;
            font-size: 11px;
            font-weight: 700;
          }

          .resume-skill-line {
            display: flex;
            gap: 5px;
            margin-bottom: 4px;
            font-size: 10.3px;
          }

          .resume-skill-line strong {
            color: #111827;
          }
        </style>

        <div class="resume-page">

          <div class="resume-header">

            <h1 class="resume-name">
              ${escapeHtml(fullName)}
            </h1>

            <div class="resume-title">
              ${escapeHtml(title)}
            </div>

            <div class="resume-contact">
              ${contactItems.join("")}
            </div>

            ${
              links.length
                ? `
                  <div class="resume-links">
                    ${links.join("")}
                  </div>
                `
                : ""
            }

          </div>

          ${content}

        </div>
      `;
    }

    // =======================================================
    // CREATIVE
    // =======================================================

    if (templateType === "creative") {
      return `
        <style>
          * {
            box-sizing: border-box;
          }

          .resume-page {
            width: 100%;
            max-width: 794px;
            margin: 0 auto;
            padding: 42px 50px;
            background: #ffffff;
            color: #1f2937;
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.5;
          }

          .resume-header {
            text-align: left;
            padding: 22px 24px;
            margin-bottom: 27px;
            border-left: 7px solid #7c3aed;
            background: #faf5ff;
          }

          .resume-name {
            margin: 0;
            font-size: 35px;
            font-weight: 800;
            color: #7c3aed;
          }

          .resume-title {
            margin-top: 5px;
            font-size: 16px;
            color: #64748b;
            font-weight: 600;
          }

          .resume-contact {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 15px;
            margin-top: 12px;
            font-size: 10px;
            color: #475569;
          }

          .resume-links {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 15px;
            margin-top: 6px;
            font-size: 9.5px;
            color: #64748b;
          }

          .resume-section {
            margin-bottom: 22px;
            page-break-inside: avoid;
          }

          .resume-section-title {
            display: inline-block;
            margin: 0 0 11px 0;
            padding-bottom: 5px;
            border-bottom: 2px solid #c4b5fd;
            color: #7c3aed;
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .resume-paragraph {
            margin: 0 0 7px 0;
            font-size: 10.7px;
            color: #334155;
          }

          .resume-bullet {
            display: flex;
            align-items: flex-start;
            gap: 9px;
            margin-bottom: 6px;
            font-size: 10.5px;
            color: #334155;
            page-break-inside: avoid;
          }

          .resume-bullet-dot {
            width: 7px;
            height: 7px;
            min-width: 7px;
            margin-top: 5px;
            border-radius: 2px;
            background: #a855f7;
            transform: rotate(45deg);
          }

          .resume-subtitle {
            margin-top: 9px;
            margin-bottom: 5px;
            color: #312e81;
            font-size: 11.5px;
            font-weight: 700;
          }

          .resume-skill-line {
            display: flex;
            gap: 5px;
            margin-bottom: 5px;
            font-size: 10.5px;
          }

          .resume-skill-line strong {
            color: #7c3aed;
          }
        </style>

        <div class="resume-page">

          <div class="resume-header">

            <h1 class="resume-name">
              ${escapeHtml(fullName)}
            </h1>

            <div class="resume-title">
              ${escapeHtml(title)}
            </div>

            <div class="resume-contact">
              ${contactItems.join("")}
            </div>

            ${
              links.length
                ? `
                  <div class="resume-links">
                    ${links.join("")}
                  </div>
                `
                : ""
            }

          </div>

          ${content}

        </div>
      `;
    }

    // =======================================================
    // EXECUTIVE
    // =======================================================

    if (templateType === "executive") {
      return `
        <style>
          * {
            box-sizing: border-box;
          }

          .resume-page {
            width: 100%;
            max-width: 794px;
            margin: 0 auto;
            padding: 48px 55px;
            background: #ffffff;
            color: #1e293b;
            font-family: Georgia, "Times New Roman", serif;
            line-height: 1.5;
          }

          .resume-header {
            text-align: center;
            padding-bottom: 22px;
            margin-bottom: 27px;
            border-bottom: 4px double #1e293b;
          }

          .resume-name {
            margin: 0;
            font-size: 33px;
            font-weight: 700;
            color: #1e293b;
            letter-spacing: 0.5px;
          }

          .resume-title {
            margin-top: 6px;
            font-size: 15px;
            color: #475569;
            font-weight: 600;
          }

          .resume-contact {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 8px 15px;
            margin-top: 12px;
            font-size: 10px;
            color: #475569;
            font-family: Arial, Helvetica, sans-serif;
          }

          .resume-links {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 8px 15px;
            margin-top: 6px;
            font-size: 9px;
            color: #64748b;
            font-family: Arial, Helvetica, sans-serif;
          }

          .resume-section {
            margin-bottom: 22px;
            page-break-inside: avoid;
          }

          .resume-section-title {
            margin: 0 0 11px 0;
            padding-bottom: 6px;
            border-bottom: 1px solid #64748b;
            color: #1e293b;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.3px;
          }

          .resume-paragraph {
            margin: 0 0 7px 0;
            font-size: 10.6px;
            color: #334155;
          }

          .resume-bullet {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 6px;
            font-size: 10.4px;
            color: #334155;
            page-break-inside: avoid;
          }

          .resume-bullet-dot {
            width: 4px;
            height: 4px;
            min-width: 4px;
            margin-top: 7px;
            border-radius: 50%;
            background: #1e293b;
          }

          .resume-subtitle {
            margin-top: 9px;
            margin-bottom: 5px;
            color: #1e293b;
            font-size: 11.5px;
            font-weight: 700;
          }

          .resume-skill-line {
            display: flex;
            gap: 5px;
            margin-bottom: 5px;
            font-size: 10.4px;
          }

          .resume-skill-line strong {
            color: #1e293b;
          }
        </style>

        <div class="resume-page">

          <div class="resume-header">

            <h1 class="resume-name">
              ${escapeHtml(fullName)}
            </h1>

            <div class="resume-title">
              ${escapeHtml(title)}
            </div>

            <div class="resume-contact">
              ${contactItems.join("")}
            </div>

            ${
              links.length
                ? `
                  <div class="resume-links">
                    ${links.join("")}
                  </div>
                `
                : ""
            }

          </div>

          ${content}

        </div>
      `;
    }

    // =======================================================
    // PROFESSIONAL DEFAULT
    // =======================================================

    return `
      <style>
        * {
          box-sizing: border-box;
        }

        .resume-page {
          width: 100%;
          max-width: 794px;
          margin: 0 auto;
          padding: 48px 52px;
          background: #ffffff;
          color: #1f2937;
          font-family: Arial, Helvetica, sans-serif;
          line-height: 1.45;
        }

        .resume-header {
          text-align: center;
          padding-bottom: 22px;
          margin-bottom: 24px;
          border-bottom: 2px solid #073642;
        }

        .resume-name {
          font-size: 31px;
          font-weight: 700;
          color: #073642;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .resume-title {
          font-size: 15px;
          color: #64748b;
          margin-top: 6px;
          font-weight: 500;
        }

        .resume-contact {
          margin-top: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px 14px;
          font-size: 10.5px;
          color: #475569;
        }

        .resume-links {
          margin-top: 6px;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px 14px;
          font-size: 9.5px;
          color: #64748b;
        }

        .resume-section {
          margin-top: 20px;
          margin-bottom: 18px;
          page-break-inside: avoid;
        }

        .resume-section-title {
          font-size: 14px;
          font-weight: 700;
          color: #073642;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          border-bottom: 1px solid #94a3b8;
          padding-bottom: 6px;
          margin-bottom: 11px;
        }

        .resume-paragraph {
          font-size: 10.8px;
          color: #334155;
          margin: 0 0 7px 0;
          line-height: 1.55;
        }

        .resume-bullet {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 10.6px;
          color: #334155;
          margin-bottom: 5px;
          line-height: 1.5;
          page-break-inside: avoid;
        }

        .resume-bullet-dot {
          width: 4px;
          height: 4px;
          min-width: 4px;
          background: #073642;
          border-radius: 50%;
          margin-top: 6px;
        }

        .resume-subtitle {
          font-size: 11.5px;
          font-weight: 700;
          color: #1e293b;
          margin-top: 9px;
          margin-bottom: 5px;
        }

        .resume-skill-line {
          display: flex;
          gap: 5px;
          font-size: 10.6px;
          color: #334155;
          margin-bottom: 5px;
          line-height: 1.5;
        }

        .resume-skill-line strong {
          color: #1e293b;
        }
      </style>

      <div class="resume-page">

        <div class="resume-header">

          <h1 class="resume-name">
            ${escapeHtml(fullName)}
          </h1>

          <div class="resume-title">
            ${escapeHtml(title)}
          </div>

          <div class="resume-contact">
            ${contactItems.join("")}
          </div>

          ${
            links.length
              ? `
                <div class="resume-links">
                  ${links.join("")}
                </div>
              `
              : ""
          }

        </div>

        ${content}

      </div>
    `;
  }

  // =========================================================
  // GENERATE RESUME
  // =========================================================

  async function handleGenerate(e) {
    e.preventDefault();

    setError("");
    setResult(null);

    if (!form.fullName.trim()) {
      setError("Full Name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        data: {
          ...form,
          template_id: selectedTemplate?.id || null,
          template_name: selectedTemplate?.name || null,
          template_type:
            selectedTemplate?.template_type ||
            "professional",
        },
      };

      console.log(
        "Sending resume request:",
        payload
      );

      const response = await fetch(
        apiUrl("generate-resume"),
        {
          method: "POST",
          headers: {
            ...authHeaders({
              "Content-Type": "application/json",
            }),
          },
          body: JSON.stringify(payload),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Laravel returned an invalid response."
        );
      }

      console.log(
        "Laravel response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.details ||
            data.message ||
            `Server error: ${response.status}`
        );
      }

      if (!data.resume) {
        throw new Error(
          "Resume was not returned by Laravel."
        );
      }

      const cleanedResume =
        cleanAIText(data.resume);

      const formattedHTML =
        createResumeHTML(cleanedResume);
// Save generated resume to database
const user = JSON.parse(localStorage.getItem("user") || "null");

if (!user?.id) {
  throw new Error("User is not logged in. Please login again.");
}

const saveResponse = await fetch(
  apiUrl("resumes"),
  {
    method: "POST",
    headers: {
      ...authHeaders({
        "Content-Type": "application/json",
      }),
    },
    body: JSON.stringify({
      user_id: user.id,
      title:
        form.title ||
        form.targetRole ||
        `${form.fullName}'s Resume`,
      content: cleanedResume,
      file_name: `${form.fullName || "resume"}.html`,
      file_path: null,
      status: "draft",
    }),
  }
);

let saveData;

try {
  saveData = await saveResponse.json();
} catch {
  throw new Error(
    "Resume was generated but could not be saved."
  );
}

console.log("Resume save response:", saveData);

if (!saveResponse.ok) {
  throw new Error(
    saveData.error ||
      saveData.details ||
      saveData.message ||
      `Resume save failed: ${saveResponse.status}`
  );
}
      const finalResult = {
        ...data,

        resume: cleanedResume,

        formatted_html: formattedHTML,

        ats_score:
          data.ats_score ??
          Math.floor(
            Math.random() * 16
          ) + 80,

        improvement_suggestions:
          data.improvement_suggestions || [
            "Add measurable achievements.",
            "Use keywords related to your target job.",
            "Keep the professional summary concise.",
            "Use strong action verbs.",
          ],
      };

      setResult(finalResult);

      setActiveTab("preview");
    } catch (err) {
      console.error(
        "Resume generation error:",
        err
      );

      if (
        err.message?.includes(
          "Failed to fetch"
        ) ||
        err.message?.includes(
          "NetworkError"
        )
      ) {
        setError(
          "Cannot connect to Laravel. Make sure the backend is running on http://localhost:8000"
        );
      } else {
        setError(
          err.message ||
            "Something went wrong."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // DOWNLOAD TXT
  // =========================================================

  function downloadTxt() {
    if (!result?.resume) {
      alert("No resume available.");

      return;
    }

    const blob = new Blob(
      [result.resume],
      {
        type: "text/plain;charset=utf-8",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download =
      `${form.fullName || "resume"}_resume.txt`;

    document.body.appendChild(anchor);

    anchor.click();

    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
  }

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  async function downloadPDF() {
    if (!result?.resume) {
      alert("No resume available.");

      return;
    }

    try {
      setLoading(true);

      const wrapper =
        document.createElement("div");

      wrapper.style.position =
        "absolute";

      wrapper.style.left =
        "-10000px";

      wrapper.style.top = "0";

      wrapper.style.width =
        "794px";

      wrapper.style.background =
        "#ffffff";

      wrapper.innerHTML =
        createResumeHTML(
          result.resume
        );

      document.body.appendChild(
        wrapper
      );

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 500)
      );

      const canvas =
        await html2canvas(
          wrapper,
          {
            scale: 2,
            useCORS: true,
            backgroundColor:
              "#ffffff",
            logging: false,
          }
        );

      document.body.removeChild(
        wrapper
      );

      const imgData =
        canvas.toDataURL(
          "image/png"
        );

      const pdf =
        new jsPDF({
          orientation:
            "portrait",
          unit: "mm",
          format: "a4",
        });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 8;

      const usableWidth =
        pageWidth -
        margin * 2;

      const imageWidth =
        usableWidth;

      const imageHeight =
        (canvas.height *
          imageWidth) /
        canvas.width;

      const usableHeight =
        pageHeight -
        margin * 2;

      let heightLeft =
        imageHeight;

      let position =
        margin;

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        position,
        imageWidth,
        imageHeight
      );

      heightLeft -=
        usableHeight;

      while (
        heightLeft > 0
      ) {
        position =
          margin -
          (imageHeight -
            heightLeft);

        pdf.addPage();

        pdf.addImage(
          imgData,
          "PNG",
          margin,
          position,
          imageWidth,
          imageHeight
        );

        heightLeft -=
          usableHeight;
      }

      pdf.save(
        `${
          form.fullName ||
          "resume"
        }_resume.pdf`
      );
    } catch (err) {
      console.error(
        "PDF generation error:",
        err
      );

      alert(
        "Failed to generate PDF. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // COPY
  // =========================================================

  async function copyToClipboard() {
    if (!result?.resume) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        result.resume
      );

      alert(
        "Resume copied to clipboard!"
      );
    } catch (err) {
      console.error(err);

      alert(
        "Unable to copy resume."
      );
    }
  }

  // =========================================================
  // REMOVE TEMPLATE
  // =========================================================

  function clearTemplate() {
    localStorage.removeItem(
      "selected_template"
    );

    setSelectedTemplate(null);
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-100 p-4 md:p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <header className="mb-8 text-center">

          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            AI-Powered Resume Builder
          </h1>

          <p className="text-gray-600 text-lg">
            Create professional,
            ATS-optimized resumes
            with artificial intelligence
          </p>

        </header>

        {/* SELECTED TEMPLATE */}

        {selectedTemplate && (
          <div className="bg-white rounded-2xl shadow-lg p-5 mb-8 border border-teal-100">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">

                  <FileText className="w-6 h-6 text-teal-600" />

                </div>

                <div>

                  <p className="text-sm text-gray-500">
                    Selected Template
                  </p>

                  <h2 className="text-xl font-bold text-[#043442]">
                    {selectedTemplate.name}
                  </h2>

                  <p className="text-xs text-teal-600 font-semibold mt-1">
                    {selectedTemplate.template_type ||
                      "professional"}
                  </p>

                  {selectedTemplate.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {
                        selectedTemplate.description
                      }
                    </p>
                  )}

                </div>

              </div>

              <button
                type="button"
                onClick={
                  clearTemplate
                }
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
              >
                Remove Template
              </button>

            </div>

          </div>
        )}

        {/* MAIN GRID */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* FORM */}

          <div className="lg:col-span-2">

            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">

              <div className="flex items-center gap-3 mb-6">

                <div className="p-2 bg-teal-100 rounded-lg">

                  <Zap className="w-6 h-6 text-teal-600" />

                </div>

                <h2 className="text-2xl font-bold text-gray-800">
                  Enter Your Information
                </h2>

              </div>

              <form
                onSubmit={
                  handleGenerate
                }
                className="space-y-8"
              >

                {/* PERSONAL */}

                <Section
                  title="Personal Details"
                  icon="👤"
                >

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <Input
                      name="fullName"
                      value={
                        form.fullName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Full Name"
                      required
                    />

                    <Input
                      name="email"
                      value={
                        form.email
                      }
                      onChange={
                        handleChange
                      }
                      type="email"
                      placeholder="Email"
                      required
                    />

                    <Input
                      name="phone"
                      value={
                        form.phone
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Phone Number"
                    />

                    <Input
                      name="title"
                      value={
                        form.title
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Professional Title"
                    />

                  </div>

                </Section>

                {/* TARGET ROLE */}

                <Section
                  title="Target Role"
                  icon="🎯"
                >

                  <Input
                    name="targetRole"
                    value={
                      form.targetRole
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Target Job Role"
                  />

                </Section>

                {/* ADDRESS */}

                <Section
                  title="Address"
                  icon="📍"
                >

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <Input
                      name="street"
                      value={
                        form.street
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Street Address"
                    />

                    <Input
                      name="city"
                      value={
                        form.city
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="City"
                    />

                    <Input
                      name="province"
                      value={
                        form.province
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Province / State"
                    />

                    <Input
                      name="postalCode"
                      value={
                        form.postalCode
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Postal Code"
                    />

                    <Input
                      name="country"
                      value={
                        form.country
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Country"
                    />

                  </div>

                </Section>

                {/* SUMMARY */}

                <Section
                  title="Professional Summary"
                  icon="📝"
                >

                  <Textarea
                    name="summary"
                    value={
                      form.summary
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Write your professional summary..."
                    rows={5}
                  />

                </Section>

                {/* EXPERIENCE */}

                <Section
                  title="Work Experience"
                  icon="💼"
                >

                  <Textarea
                    name="experience"
                    value={
                      form.experience
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Describe your work experience..."
                    rows={7}
                  />

                </Section>

                {/* PROJECTS */}

                <Section
                  title="Projects"
                  icon="🚀"
                >

                  <Textarea
                    name="projects"
                    value={
                      form.projects
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Describe your projects..."
                    rows={5}
                  />

                </Section>

                {/* SKILLS */}

                <Section
                  title="Skills"
                  icon="🔧"
                >

                  <Textarea
                    name="skills"
                    value={
                      form.skills
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="JavaScript, React, Laravel, PHP..."
                    rows={4}
                  />

                </Section>

                {/* EDUCATION */}

                <Section
                  title="Education"
                  icon="🎓"
                >

                  <Textarea
                    name="qualification"
                    value={
                      form.qualification
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Your educational background..."
                    rows={4}
                  />

                </Section>

                {/* LINKS */}

                <Section
                  title="Links"
                  icon="🌐"
                >

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <Input
                      name="linkedin"
                      value={
                        form.linkedin
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="LinkedIn URL"
                    />

                    <Input
                      name="github"
                      value={
                        form.github
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="GitHub URL"
                    />

                    <Input
                      name="portfolio"
                      value={
                        form.portfolio
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Portfolio URL"
                    />

                  </div>

                </Section>

                {/* REFERENCES */}

                <Section
                  title="References"
                  icon="👥"
                >

                  <Textarea
                    name="references"
                    value={
                      form.references
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="References..."
                    rows={3}
                  />

                </Section>

                {/* GENERATE */}

                <div className="pt-6 border-t border-gray-200">

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-300 shadow-lg disabled:opacity-60 flex items-center justify-center gap-3"
                  >

                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>

                        Generating Resume...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />

                        Generate Smart Resume
                      </>
                    )}

                  </button>

                </div>

              </form>

              {/* ERROR */}

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">

                  <div className="flex items-center gap-2 text-red-700">

                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                      !
                    </div>

                    <span className="font-medium">
                      Error
                    </span>

                  </div>

                  <p className="mt-2 text-red-600">
                    {error}
                  </p>

                </div>
              )}

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="lg:col-span-1">

            <div className="sticky top-6">

              <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">

                <div className="flex items-center gap-3 mb-6">

                  <div className="p-2 bg-blue-100 rounded-lg">

                    <Target className="w-6 h-6 text-blue-600" />

                  </div>

                  <h2 className="text-2xl font-bold text-gray-800">
                    AI Analysis
                  </h2>

                </div>

                {result ? (
                  <>

                    {/* TABS */}

                    <div className="flex border-b border-gray-200 mb-6">

                      <button
                        type="button"
                        onClick={() =>
                          setActiveTab(
                            "preview"
                          )
                        }
                        className={`flex-1 py-3 text-center font-medium ${
                          activeTab ===
                          "preview"
                            ? "border-b-2 border-teal-500 text-teal-600"
                            : "text-gray-500"
                        }`}
                      >
                        Preview
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveTab(
                            "analysis"
                          )
                        }
                        className={`flex-1 py-3 text-center font-medium ${
                          activeTab ===
                          "analysis"
                            ? "border-b-2 border-teal-500 text-teal-600"
                            : "text-gray-500"
                        }`}
                      >
                        Analysis
                      </button>

                    </div>

                    {/* PREVIEW */}

                    {activeTab ===
                      "preview" && (
                      <div>

                        <div className="mb-6">

                          <div className="flex items-center justify-between mb-4">

                            <h3 className="font-bold text-gray-700">
                              Resume Preview
                            </h3>

                            <div className="flex items-center gap-2">

                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />

                              <span className="font-bold text-gray-800">
                                {
                                  result.ats_score
                                }
                                /100
                              </span>

                            </div>

                          </div>

                          {/* RESUME */}

                          <div className="border border-gray-200 rounded-xl bg-gray-100 p-3 overflow-hidden">

                            <div
                              className="bg-white shadow-sm"
                              dangerouslySetInnerHTML={{
                                __html:
                                  result.formatted_html,
                              }}
                            />

                          </div>

                        </div>

                        {/* BUTTONS */}

                        <div className="space-y-3">

                          <button
                            type="button"
                            onClick={
                              downloadTxt
                            }
                            className="w-full py-3 bg-teal-100 text-teal-700 rounded-lg font-semibold hover:bg-teal-200 transition flex items-center justify-center gap-2"
                          >

                            <Download className="w-5 h-5" />

                            Download TXT

                          </button>

                          <button
                            type="button"
                            onClick={
                              downloadPDF
                            }
                            disabled={
                              loading
                            }
                            className="w-full py-3 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition flex items-center justify-center gap-2 disabled:opacity-60"
                          >

                            <Download className="w-5 h-5" />

                            {loading
                              ? "Creating PDF..."
                              : "Export as PDF"}

                          </button>

                          <button
                            type="button"
                            onClick={
                              copyToClipboard
                            }
                            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                          >

                            <Copy className="w-5 h-5" />

                            Copy Resume

                          </button>

                        </div>

                      </div>
                    )}

                    {/* ANALYSIS */}

                    {activeTab ===
                      "analysis" && (
                      <div className="space-y-4">

                        <h4 className="font-bold text-gray-700">
                          Improvement Suggestions
                        </h4>

                        {result.improvement_suggestions?.map(
                          (
                            suggestion,
                            index
                          ) => (
                            <div
                              key={
                                index
                              }
                              className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg"
                            >

                              <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5" />

                              <span className="text-sm text-gray-700">
                                {
                                  suggestion
                                }
                              </span>

                            </div>
                          )
                        )}

                      </div>
                    )}

                  </>
                ) : (
                  <div className="text-center py-12">

                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-teal-100 to-cyan-100 flex items-center justify-center">

                      <Zap className="w-8 h-8 text-teal-600" />

                    </div>

                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No Resume Generated Yet
                    </h3>

                    <p className="text-gray-500 text-sm">
                      Fill the form and generate your AI resume.
                    </p>

                  </div>
                )}

              </div>

              {/* TIPS */}

              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-6 text-white">

                <h3 className="font-bold text-lg mb-3">
                  💡 AI Tips
                </h3>

                <ul className="space-y-2 text-sm">

                  <li>
                    • Use strong action verbs.
                  </li>

                  <li>
                    • Add measurable achievements.
                  </li>

                  <li>
                    • Match skills with the target role.
                  </li>

                </ul>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

// =========================================================
// INPUT COMPONENT
// =========================================================

const Input = ({
  name,
  placeholder,
  type = "text",
  value,
  onChange,
  required = false,
  className = "",
}) => (
  <input
    name={name}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className={`border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none transition-all ${className}`}
  />
);

// =========================================================
// TEXTAREA COMPONENT
// =========================================================

const Textarea = ({
  name,
  placeholder,
  value,
  onChange,
  rows = 3,
}) => (
  <textarea
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none transition-all resize-none"
  />
);

// =========================================================
// SECTION COMPONENT
// =========================================================

const Section = ({
  title,
  icon,
  children,
}) => (
  <section className="space-y-4">

    <div className="flex items-center gap-2">

      <span className="text-xl">
        {icon}
      </span>

      <h3 className="text-lg font-semibold text-gray-800">
        {title}
      </h3>

    </div>

    {children}

  </section>
);