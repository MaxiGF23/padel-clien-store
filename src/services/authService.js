import { currentUser } from "@/data/mockData.js";
import { request, usingMocks } from "./apiClient.js";
export async function login(credentials) {
  return usingMocks()
    ? { token: "mock-jwt-token", tokenType: "Bearer", expiresIn: 86400, usuario: currentUser }
    : request("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
}
export async function register(payload) {
  return usingMocks()
    ? { ...currentUser, ...payload, id: 3, rol: "USER", activo: true, createdAt: new Date().toISOString() }
    : request("/usuarios", { method: "POST", body: JSON.stringify(payload) });
}
