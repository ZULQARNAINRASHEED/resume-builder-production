import { useEffect, useState } from "react";
import { API_BASE_URL, authHeaders } from "../config/api";

const moduleDetails = {
  resumes: {
    title: "Resume Management",
    description: "Review and manage resumes submitted through the builder.",
  },
  templates: {
    title: "Template Management",
    description: "Manage the resume templates available to users.",
  },
  analytics: {
    title: "Analytics",
    description: "Monitor usage and activity across the Resume Builder.",
  },
  settings: {
    title: "Settings",
    description: "Configure application behavior and administrative preferences.",
  },
};

export default function AdminModulePage({ module }) {
  const details = moduleDetails[module] || moduleDetails.settings;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadModule();
  }, [module]);

  const loadModule = async () => {
    setLoading(true);
    setError("");

    try {
      let endpoint = "";

      switch (module) {
        case "resumes":
          endpoint = "/resumes";
          break;

        case "templates":
          endpoint = "/templates";
          break;

        case "analytics":
          endpoint = "/analytics";
          break;

        case "settings":
          endpoint = "/settings";
          break;

        default:
          endpoint = "/settings";
      }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
  method: "GET",
  headers: authHeaders(),
});

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            `Request failed with status ${response.status}`
        );
      }

      setData(result);
    } catch (err) {
      console.error("Admin module error:", err);
      setError(err.message || "Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#0f766e]">
          Admin module
        </p>

        <h1 className="text-3xl font-bold text-gray-800 mt-2">
          {details.title}
        </h1>

        <p className="text-gray-600 mt-2">
          {details.description}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600">
            Loading {details.title.toLowerCase()}...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800">
            Unable to load data
          </h2>

          <p className="text-red-700 mt-2">
            {error}
          </p>

          <button
            onClick={loadModule}
            className="mt-4 px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800"
          >
            Try Again
          </button>
        </div>
      )}

      {/* RESUMES */}
      {!loading && !error && module === "resumes" && (
        <ResumeModule data={data} />
      )}

      {/* TEMPLATES */}
      {!loading && !error && module === "templates" && (
        <TemplateModule data={data} onRefresh={loadModule} />
      )}

      {/* ANALYTICS */}
      {!loading && !error && module === "analytics" && (
        <AnalyticsModule data={data} />
      )}

      {/* SETTINGS */}
      {!loading && !error && module === "settings" && (
        <SettingsModule data={data} onRefresh={loadModule} />
      )}
    </section>
  );
}


/* =========================================================
   RESUMES
========================================================= */

function ResumeModule({ data }) {
  const resumes = Array.isArray(data?.resumes)
    ? data.resumes
    : Array.isArray(data)
    ? data
    : [];

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800">
          Resumes
        </h2>

        <p className="text-gray-500 mt-1">
          {resumes.length} resume(s) found.
        </p>
      </div>

      {resumes.length === 0 ? (
        <div className="p-6 text-gray-500">
          No resumes found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold">
                  ID
                </th>

                <th className="text-left px-6 py-3 text-sm font-semibold">
                  Title
                </th>

                <th className="text-left px-6 py-3 text-sm font-semibold">
                  User
                </th>

                <th className="text-left px-6 py-3 text-sm font-semibold">
                  Status
                </th>

                <th className="text-left px-6 py-3 text-sm font-semibold">
                  Created
                </th>
              </tr>
            </thead>

            <tbody>
              {resumes.map((resume) => (
                <tr key={resume.id} className="border-t">
                  <td className="px-6 py-4">
                    {resume.id}
                  </td>

                  <td className="px-6 py-4">
                    {resume.title ||
                      resume.name ||
                      resume.resume_title ||
                      "Untitled Resume"}
                  </td>

                  <td className="px-6 py-4">
                    {resume.user?.name ||
                      resume.user?.email ||
                      resume.user_id ||
                      "N/A"}
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                      {resume.status || "draft"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {resume.created_at
                      ? new Date(resume.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


/* =========================================================
   TEMPLATES
========================================================= */

function TemplateModule({ data, onRefresh }) {
  const templates = Array.isArray(data?.templates)
    ? data.templates
    : [];

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    preview_url: "",
    is_active: true,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const createTemplate = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
  const response = await fetch(`${API_BASE_URL}/templates`, {
  method: "POST",
  headers: authHeaders({
    "Content-Type": "application/json",
  }),
  body: JSON.stringify(form),
});

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to create template"
        );
      }

      setMessage("Template created successfully.");

      setForm({
        name: "",
        description: "",
        preview_url: "",
        is_active: true,
      });

      setShowForm(false);

      onRefresh();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this template?"
    );

    if (!confirmed) return;

    try {
    const response = await fetch(
  `${API_BASE_URL}/templates/${id}`,
  {
    method: "DELETE",
    headers: authHeaders(),
  }
);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to delete template"
        );
      }

      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Templates
          </h2>

          <p className="text-gray-500 mt-1">
            {templates.length} template(s)
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2 bg-[#0f766e] text-white rounded-md hover:bg-[#0d665f]"
        >
          {showForm ? "Cancel" : "+ Add Template"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
          {message}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <form
          onSubmit={createTemplate}
          className="bg-white rounded-lg shadow-sm p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold">
            Create Template
          </h3>

          <input
            type="text"
            placeholder="Template name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            required
            className="w-full border rounded-md px-4 py-2"
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            className="w-full border rounded-md px-4 py-2"
            rows="3"
          />

          <input
            type="text"
            placeholder="Preview URL"
            value={form.preview_url}
            onChange={(e) =>
              setForm({
                ...form,
                preview_url: e.target.value,
              })
            }
            className="w-full border rounded-md px-4 py-2"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({
                  ...form,
                  is_active: e.target.checked,
                })
              }
            />

            Active
          </label>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-[#0f766e] text-white rounded-md disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Template"}
          </button>
        </form>
      )}

      {/* Template List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {templates.length === 0 ? (
          <div className="p-6 text-gray-500">
            No templates found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3">
                    Name
                  </th>

                  <th className="text-left px-6 py-3">
                    Description
                  </th>

                  <th className="text-left px-6 py-3">
                    Status
                  </th>

                  <th className="text-left px-6 py-3">
                    Usage
                  </th>

                  <th className="text-left px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {templates.map((template) => (
                  <tr
                    key={template.id}
                    className="border-t"
                  >
                    <td className="px-6 py-4 font-semibold">
                      {template.name}
                    </td>

                    <td className="px-6 py-4">
                      {template.description || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {template.is_active ? (
                        <span className="text-green-600">
                          Active
                        </span>
                      ) : (
                        <span className="text-red-600">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {template.usage_count || 0}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          deleteTemplate(template.id)
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


/* =========================================================
   ANALYTICS
========================================================= */

function AnalyticsModule({ data }) {
  const stats = data?.stats || {};

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        <StatCard
          title="Total Users"
          value={stats.users ?? 0}
        />

        <StatCard
          title="Total Resumes"
          value={stats.resumes ?? 0}
        />

        <StatCard
          title="Templates"
          value={stats.templates ?? 0}
        />

        <StatCard
          title="Published Resumes"
          value={stats.published_resumes ?? 0}
        />

      </div>

      {/* Resume Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Resume Status
        </h2>

        <div className="mt-5 space-y-3">
          {Object.entries(data?.resume_statuses || {}).length === 0 ? (
            <p className="text-gray-500">
              No resume status data available.
            </p>
          ) : (
            Object.entries(data.resume_statuses).map(
              ([status, total]) => (
                <div
                  key={status}
                  className="flex justify-between border-b pb-2"
                >
                  <span className="capitalize">
                    {status}
                  </span>

                  <span className="font-semibold">
                    {total}
                  </span>
                </div>
              )
            )
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Users
        </h2>

        {data?.recent_users?.length ? (
          <div className="space-y-3">
            {data.recent_users.map((user) => (
              <div
                key={user.id}
                className="flex justify-between border-b pb-3"
              >
                <div>
                  <p className="font-semibold">
                    {user.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {user.email}
                  </p>
                </div>

                <span className="text-sm text-gray-400">
                  {user.created_at
                    ? new Date(
                        user.created_at
                      ).toLocaleDateString()
                    : ""}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No users found.
          </p>
        )}
      </div>

      {/* Top Templates */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Top Templates
        </h2>

        {data?.top_templates?.length ? (
          <div className="space-y-3">
            {data.top_templates.map((template) => (
              <div
                key={template.id}
                className="flex justify-between border-b pb-3"
              >
                <span className="font-semibold">
                  {template.name}
                </span>

                <span>
                  {template.usage_count || 0} uses
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No template data found.
          </p>
        )}
      </div>
    </div>
  );
}


/* =========================================================
   SETTINGS
========================================================= */

function SettingsModule({ data, onRefresh }) {
  const settings = Array.isArray(data?.settings)
    ? data.settings
    : [];

  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const initialValues = {};

    settings.forEach((setting) => {
      initialValues[setting.key] = setting.value || "";
    });

    setValues(initialValues);
  }, [data]);

  const saveSettings = async () => {
    setSaving(true);
    setMessage("");

    try {
    const response = await fetch(
  `${API_BASE_URL}/settings`,
  {
    method: "PUT",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      settings: values,
    }),
  }
);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to save settings"
        );
      }

      setMessage("Settings saved successfully.");

      onRefresh();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">

      <h2 className="text-xl font-semibold text-gray-800">
        Application Settings
      </h2>

      <p className="text-gray-500 mt-1 mb-6">
        Configure your Resume Builder.
      </p>

      {settings.length === 0 ? (
        <p className="text-gray-500">
          No settings found.
        </p>
      ) : (
        <div className="space-y-5">

          {settings.map((setting) => (
            <div key={setting.key}>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {setting.label || setting.key}
              </label>

              <input
                type="text"
                value={values[setting.key] || ""}
                onChange={(e) =>
                  setValues({
                    ...values,
                    [setting.key]: e.target.value,
                  })
                }
                className="w-full border rounded-md px-4 py-2"
              />

            </div>
          ))}

          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-5 py-2 bg-[#0f766e] text-white rounded-md disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>

          {message && (
            <p className="text-sm text-gray-600">
              {message}
            </p>
          )}

        </div>
      )}
    </div>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="text-3xl font-bold text-[#0f766e] mt-2">
        {value}
      </p>
    </div>
  );
}