import { currentUser } from "@/data/mockData.js";
import { request, usingMocks } from "./apiClient.js";
import * as adminService from "./adminService.js";

export async function login(credentials) {
  if (!usingMocks()) {
    return request("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
  }

  // Mock login: buscar usuario por email o username
  const mockData = adminService.getMockData();
  const user = mockData.users.find(
    (u) =>
      (u.email === credentials.email || u.username === credentials.email) &&
      u.password === credentials.password
  );

  if (!user) {
    throw new Error("Email/usuario o contraseña incorrectos");
  }

  return {
    token: "mock-jwt-token-" + user.id,
    tokenType: "Bearer",
    expiresIn: 86400,
    usuario: { id: user.id, email: user.email, nombre: user.nombre, apellido: user.apellido, rol: user.rol }
  };
}

export async function register(payload) {
  if (!usingMocks()) {
    return request("/usuarios", { method: "POST", body: JSON.stringify(payload) });
  }

  const mockData = adminService.getMockData();
  
  // Validar que no exista un usuario con ese email
  if (mockData.users.some((u) => u.email === payload.email)) {
    throw new Error("El email ya está registrado");
  }

  // Validar que no exista un usuario con ese username
  if (mockData.users.some((u) => u.username === payload.username)) {
    throw new Error("El usuario ya existe");
  }

  // Crear nuevo usuario
  const newUser = {
    id: Math.max(0, ...mockData.users.map((u) => Number(u.id) || 0)) + 1,
    ...payload,
    rol: "USER",
    activo: true,
    createdAt: new Date().toISOString()
  };

  // Actualizar el array de usuarios en el mock data (por referencia en adminService)
  mockData.users.push(newUser);

  return {
    id: newUser.id,
    email: newUser.email,
    nombre: newUser.nombre,
    apellido: newUser.apellido,
    rol: newUser.rol
  };
}
