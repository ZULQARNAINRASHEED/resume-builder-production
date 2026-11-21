import React, { useState } from "react";
import { API_BASE_URL as API_URL } from "../config/api";

function CoverLetter() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    jobTitle: "",
    companyName: "",
    experience: "",
    skills: "",
    education: "",
    projects: "",
    jobDescription: "",
    tone: "professional",
  });

  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateCoverLetter = async (e) => {
    e.preventDefault();

    setError("");
    setCoverLetter("");

    if (!formData.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!formData.jobTitle.trim()) {
      setError("Please enter the job title.");
      return;
    }

    if (!formData.companyName.trim()) {
      setError("Please enter the company name.");
      return;
    }

    if (!formData.jobDescription.trim()) {
      setError("Please enter the job description.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/generate-cover-letter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to generate cover letter."
        );
      }

      if (data.success) {
        setCoverLetter(data.cover_letter || "");
      } else {
        throw new Error(
          data.error || "Failed to generate cover letter."
        );
      }
    } catch (err) {
      console.error("Cover letter error:", err);
      setError(
        err.message ||
          "Something went wrong while generating the cover letter."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyCoverLetter = async () => {
    if (!coverLetter) return;

    try {
      await navigator.clipboard.writeText(coverLetter);
      alert("Cover letter copied!");
    } catch (err) {
      console.error("Copy failed:", err);
      alert("Unable to copy cover letter.");
    }
  };

  const printCoverLetter = () => {
    if (!coverLetter) return;

    const printWindow = window.open(
      "",
      "_blank",
      "width=900,height=700"
    );

    if (!printWindow) {
      alert("Please allow popups to print the cover letter.");
      return;
    }

    const safeLetter = coverLetter
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cover Letter - ${formData.fullName}</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 40px;
            color: #222;
            line-height: 1.7;
          }

          h1 {
            text-align: center;
            margin-bottom: 30px;
          }

          .letter {
            white-space: pre-wrap;
            font-size: 16px;
          }

          @media print {
            body {
              margin: 0;
              padding: 30px;
            }
          }
        </style>
      </head>

      <body>

        <h1>Cover Letter</h1>

        <div class="letter">
          ${safeLetter}
        </div>

      </body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
  };

  const downloadCoverLetter = () => {
    if (!coverLetter) return;

    const blob = new Blob(
      [coverLetter],
      {
        type: "text/plain;charset=utf-8",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${formData.fullName || "cover-letter"}-cover-letter.txt`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "35px",
          }}
        >
          <h1
            style={{
              fontSize: "36px",
              marginBottom: "10px",
              color: "#1f2937",
            }}
          >
            AI Cover Letter Generator
          </h1>

          <p
            style={{
              color: "#6b7280",
              fontSize: "16px",
            }}
          >
            Create a personalized, professional cover letter
            tailored to your target job.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              coverLetter ? "1fr 1fr" : "1fr",
            gap: "30px",
            alignItems: "start",
          }}
        >
          {/* FORM */}

          <div
            style={{
              background: "#ffffff",
              padding: "30px",
              borderRadius: "14px",
              boxShadow:
                "0 8px 25px rgba(0,0,0,0.08)",
            }}
          >
            <h2
              style={{
                marginBottom: "25px",
                color: "#111827",
              }}
            >
              Your Information
            </h2>

            <form onSubmit={generateCoverLetter}>

              <div style={styles.row}>
                <Input
                  label="Full Name *"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Ali Khan"
                />

                <Input
                  label="Email *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ali@example.com"
                />
              </div>

              <div style={styles.row}>
                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="03001234567"
                />

                <Input
                  label="Job Title *"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="Frontend Developer"
                />
              </div>

              <Input
                label="Company Name *"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="ABC Software"
              />

              <Textarea
                label="Experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="Describe your relevant experience..."
              />

              <Textarea
                label="Skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, JavaScript, Laravel, Git"
              />

              <Textarea
                label="Education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="BS Computer Science"
              />

              <Textarea
                label="Projects"
                name="projects"
                value={formData.projects}
                onChange={handleChange}
                placeholder="Describe relevant projects..."
              />

              <Textarea
                label="Job Description *"
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                placeholder="Paste the job description here..."
                rows={7}
              />

              <div style={styles.field}>
                <label style={styles.label}>
                  Cover Letter Tone
                </label>

                <select
                  name="tone"
                  value={formData.tone}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="professional">
                    Professional
                  </option>

                  <option value="friendly">
                    Friendly
                  </option>

                  <option value="confident">
                    Confident
                  </option>

                  <option value="formal">
                    Formal
                  </option>
                </select>
              </div>

              {error && (
                <div
                  style={{
                    background: "#fee2e2",
                    color: "#b91c1c",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "15px",
                  border: "none",
                  borderRadius: "8px",
                  background: loading
                    ? "#94a3b8"
                    : "#0f766e",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {loading
                  ? "✨ Generating..."
                  : "✨ Generate Cover Letter"}
              </button>
            </form>
          </div>

          {/* RESULT */}

          {coverLetter && (
            <div
              style={{
                background: "#ffffff",
                padding: "30px",
                borderRadius: "14px",
                boxShadow:
                  "0 8px 25px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: "#111827",
                  }}
                >
                  Cover Letter Preview
                </h2>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={copyCoverLetter}
                    style={styles.secondaryButton}
                  >
                    📋 Copy
                  </button>

                  <button
                    onClick={downloadCoverLetter}
                    style={styles.secondaryButton}
                  >
                    📄 Download
                  </button>

                  <button
                    onClick={printCoverLetter}
                    style={styles.secondaryButton}
                  >
                    🖨️ Print
                  </button>
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "30px",
                  background: "#fff",
                  minHeight: "600px",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.8",
                  color: "#374151",
                  fontSize: "15px",
                }}
              >
                {coverLetter}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>

    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={styles.input}
    />
  </div>
);

const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
}) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>

    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={{
        ...styles.input,
        resize: "vertical",
      }}
    />
  </div>
);

const styles = {
  row: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },

  field: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontWeight: "600",
    color: "#374151",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },

  secondaryButton: {
    border: "1px solid #0f766e",
    background: "#ffffff",
    color: "#0f766e",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default CoverLetter;