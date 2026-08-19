const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

export { API_BASE_URL };

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