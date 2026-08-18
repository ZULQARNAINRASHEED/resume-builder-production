import React, { useState } from "react";
import { apiUrl } from "../config/api";

const Faqs = () => {
  const faqs = [
    {
      question: "What is an AI Resume Builder?",
      answer:
        "An AI Resume Builder helps you create professional, ATS-friendly resumes using smart suggestions for skills, grammar, keywords, and formatting.",
    },
    {
      question: "Is the platform free to use?",
      answer:
        "Yes! You can build and download resumes for free. Premium templates may be added in the future.",
    },
    {
      question: "Do I need design skills?",
      answer:
        "No. Our user-friendly editor and templates automatically handle layout and styling.",
    },
    {
      question: "What is ATS compatibility?",
      answer:
        "ATS stands for Applicant Tracking System. Our templates are designed to pass ATS scans and increase job selection chances.",
    },
    {
      question: "Can AI write content for me?",
      answer:
        "Yes! Our AI suggests job descriptions, achievements, skill points, and professional summaries based on your industry.",
    },
    {
      question: "Can I edit my resume later?",
      answer:
        "Absolutely. You can update and download your resume anytime.",
    },
    {
      question: "Do you support PDF download?",
      answer:
        "Yes! You can export your resume instantly as a high-quality PDF.",
    },
    {
      question: "Are my details secure?",
      answer:
        "Your data is stored securely and will never be shared with third parties.",
    },
    {
      question: "Can I create multiple resumes?",
      answer:
        "Yes! You can build multiple resumes for different job roles or industries.",
    },
    {
      question: "Does the AI improve grammar?",
      answer:
        "Yes. Our AI enhances tone, clarity, readability, and grammar automatically.",
    },
    {
      question: "What devices are supported?",
      answer:
        "It works perfectly on desktop, laptop, tablet, and mobile browsers.",
    },
    {
      question: "Will more features be added?",
      answer:
        "Yes! Upcoming features include AI cover letters, job suggestions, and interview preparation tools.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const [contactOpen, setContactOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSuccess("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!form.email.toLowerCase().endsWith("@gmail.com")) {
      newErrors.email = "Please use a valid Gmail address.";
    }

    if (!form.subject.trim()) {
      newErrors.subject = "Subject is required.";
    }

    if (!form.message.trim()) {
      newErrors.message = "Message is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setSending(true);

    try {
      const response = await fetch(apiUrl("contact"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({
            general: data.message || "Unable to send message.",
          });
        }

        return;
      }

      setSuccess("Message sent successfully! We'll get back to you soon.");

      setForm({
        name: "",
        email: "",
        contact: "",
        subject: "",
        message: "",
      });

      setTimeout(() => {
        setContactOpen(false);
        setSuccess("");
      }, 2000);

    } catch (error) {
      console.error("Contact form error:", error);

      setErrors({
        general: "Unable to connect to the server. Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  const inputClass = (field) => {
    if (errors[field]) {
      return "border-red-500 bg-red-50 focus:ring-red-400";
    }

    if (form[field]) {
      return "border-green-500 bg-green-50 focus:ring-green-400";
    }

    return "border-gray-300 focus:ring-[#043442]";
  };

  return (
    <div className="min-h-screen py-16 px-5 sm:px-8 lg:px-24 bg-[#f8fafb]">

      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">

          <div className="inline-flex items-center justify-center w-16 h-16 mb-5 rounded-2xl bg-[#043442] shadow-lg">
            <span className="text-3xl">❓</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#043442] mb-4">
            Frequently Asked Questions
          </h1>

          <div className="w-20 h-1 bg-[#043442] mx-auto rounded-full mb-5" />

          <p className="text-[#043442]/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Have questions about our AI Resume Builder? We’ve got answers!
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">

          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                onClick={() => toggleFAQ(index)}
                className={`
                  group border rounded-2xl overflow-hidden cursor-pointer
                  transition-all duration-300
                  ${
                    isOpen
                      ? "border-[#043442] bg-white shadow-lg -translate-y-1"
                      : "border-[#043442]/15 bg-white hover:border-[#043442]/40 hover:shadow-md"
                  }
                `}
              >

                {/* Question */}
                <div className="flex justify-between items-center gap-4 p-5 sm:p-6">

                  <div className="flex items-center gap-4">

                    <div
                      className={`
                        flex-shrink-0 w-9 h-9 rounded-full
                        flex items-center justify-center
                        font-bold text-sm
                        transition-all duration-300
                        ${
                          isOpen
                            ? "bg-[#043442] text-white"
                            : "bg-[#043442]/10 text-[#043442]"
                        }
                      `}
                    >
                      {index + 1}
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold text-[#043442]">
                      {faq.question}
                    </h3>

                  </div>

                  <div
                    className={`
                      flex-shrink-0 w-9 h-9 rounded-full
                      flex items-center justify-center
                      text-xl font-bold
                      ${
                        isOpen
                          ? "bg-[#043442] text-white"
                          : "bg-[#043442]/10 text-[#043442]"
                      }
                    `}
                  >
                    {isOpen ? "−" : "+"}
                  </div>

                </div>

                {/* Answer */}
                <div
                  className={`
                    grid transition-all duration-300
                    ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }
                  `}
                >
                  <div className="overflow-hidden">

                    <div className="px-5 sm:px-6 pb-6 pl-[4.5rem] pr-12">

                      <div className="h-px bg-[#043442]/10 mb-4" />

                      <p className="text-[#043442]/70 leading-relaxed text-sm sm:text-base">
                        {faq.answer}
                      </p>

                    </div>

                  </div>
                </div>

              </div>
            );
          })}

        </div>

        {/* Support Section */}
        <div className="relative mt-14 overflow-hidden rounded-3xl bg-[#043442] p-8 sm:p-10 text-center shadow-xl">

          <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-16 w-48 h-48 rounded-full bg-white/5" />

          <div className="relative z-10">

            <div className="text-4xl mb-4">
              💬
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Still Have Questions?
            </h2>

            <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto">
              Can't find the answer you're looking for? Our support team is
              ready to help you.
            </p>

            <button
              onClick={() => {
                setContactOpen(true);
                setErrors({});
                setSuccess("");
              }}
              className="
                mt-6 px-8 py-3
                bg-white text-[#043442]
                rounded-xl font-semibold
                shadow-lg
                hover:bg-gray-100
                hover:scale-105
                active:scale-95
                transition-all duration-300
              "
            >
              Contact Support
            </button>

          </div>
        </div>

      </div>

      {/* CONTACT MODAL */}
      {contactOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="sticky top-0 bg-[#043442] px-6 py-5 flex justify-between items-center">

              <div>
                <h2 className="text-xl font-bold text-white">
                  Contact Support
                </h2>

                <p className="text-white/70 text-sm mt-1">
                  Send us your question or problem
                </p>
              </div>

              <button
                type="button"
                onClick={() => setContactOpen(false)}
                className="text-white text-2xl hover:text-gray-300"
              >
                ✕
              </button>

            </div>

            {/* Form */}
            <form
              onSubmit={handleContactSubmit}
              className="p-6 space-y-4"
            >

              {/* General Error */}
              {errors.general && (
                <div className="rounded-lg border border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
                  ❌ {errors.general}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="rounded-lg border border-green-500 bg-green-50 px-4 py-3 text-sm text-green-700">
                  ✅ {success}
                </div>
              )}

              {/* Name */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={`w-full rounded-lg border p-3 outline-none focus:ring-2 ${inputClass(
                    "name"
                  )}`}
                />

                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.name}
                  </p>
                )}

              </div>

              {/* Email */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gmail Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  className={`w-full rounded-lg border p-3 outline-none focus:ring-2 ${inputClass(
                    "email"
                  )}`}
                />

                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email}
                  </p>
                )}

              </div>

              {/* Contact */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>

                <input
                  type="tel"
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="03001234567"
                  className={`w-full rounded-lg border p-3 outline-none focus:ring-2 ${inputClass(
                    "contact"
                  )}`}
                />

              </div>

              {/* Subject */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>

                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="What is your question?"
                  className={`w-full rounded-lg border p-3 outline-none focus:ring-2 ${inputClass(
                    "subject"
                  )}`}
                />

                {errors.subject && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.subject}
                  </p>
                )}

              </div>

              {/* Message */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Describe your problem..."
                  className={`w-full rounded-lg border p-3 outline-none resize-none focus:ring-2 ${inputClass(
                    "message"
                  )}`}
                />

                {errors.message && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.message}
                  </p>
                )}

              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setContactOpen(false)}
                  disabled={sending}
                  className="flex-1 rounded-lg bg-gray-200 py-3 font-semibold text-gray-700 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={sending}
                  className={`
                    flex-1 rounded-lg py-3 font-semibold text-white transition
                    ${
                      sending
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#043442] hover:bg-[#032c36]"
                    }
                  `}
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default Faqs;