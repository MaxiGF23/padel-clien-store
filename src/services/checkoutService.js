import { request, usingMocks } from "./apiClient.js";
export async function checkoutWithCard(payload) {
  return usingMocks()
    ? { aprobado: true, mensaje: "Pago aprobado", total: payload.total, pedidoId: Math.floor(10000 + Math.random() * 90000), pagoId: Math.floor(1000 + Math.random() * 9000), referenciaTransaccion: `MOCK-${Date.now()}`, ultimos4: payload.numeroTarjeta.slice(-4), estadoPago: "APROBADO" }
    : request("/pagos/pasarela-ficticia/checkout", { method: "POST", body: JSON.stringify(payload) });
}
