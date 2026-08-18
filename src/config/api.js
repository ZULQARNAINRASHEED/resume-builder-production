const configuredApiBase =
  process.env.REACT_APP_API_URL ||
  "https://resume-builder.infinityfree.io/api";

export const API_BASE_URL =
  configuredApiBase.replace(/\/+$/, "");

export function apiUrl(path = "") {
  return `${API_BASE_URL}/${String(path).replace(/^\/+/, "")}`;
}

export function authHeaders(extraHeaders = {}) {
  const token = localStorage.getItem("auth_token");
  const tokenType =
    localStorage.getItem("token_type") || "Bearer";

  return {
    Accept: "application/json",
    ...(token
      ? {
          Authorization: `${tokenType} ${token}`,
        }
      : {}),
    ...extraHeaders,
  };
}