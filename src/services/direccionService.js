import { request } from "./apiClient.js";

// Direcciones de envío del usuario. Se usan en el checkout para resolver
// el idDireccion real que necesita la pasarela de pago del backend.

export function getAddressesByUser(idUsuario) {
  return request(`/direcciones/usuario/${idUsuario}`);
}

export function createAddress(payload) {
  return request("/direcciones", { method: "POST", body: JSON.stringify(payload) });
}
