const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4040/api";
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";

export async function request(path, options = {}) {
  const token = window.localStorage.getItem("padelstore_token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
  });
  if (!response.ok) throw new Error((await response.text()) || `HTTP ${response.status}`);
  return response.status === 204 ? null : response.json();
}
export function usingMocks() { return USE_MOCKS; }
