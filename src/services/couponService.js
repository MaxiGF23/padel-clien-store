import { request } from "./apiClient.js";

// Valida un cupón contra el backend (reglas reales: vigencia, usos, activo).
// Devuelve el CuponDTO si existe; lanza error si no.
export function validateCouponBackend(codigo) {
  return request(`/cupones/${encodeURIComponent(codigo)}/validar`);
}
