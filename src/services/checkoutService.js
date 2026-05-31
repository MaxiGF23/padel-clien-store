import { request, usingMocks } from "./apiClient.js";
import * as adminService from "./adminService.js";

export async function checkoutWithCard(payload) {
  if (!usingMocks()) {
    return request("/pagos/pasarela-ficticia/checkout", { method: "POST", body: JSON.stringify(payload) });
  }

  // Mock: Create and save order
  const pedidoId = Math.floor(10000 + Math.random() * 90000);
  const mockData = adminService.getMockData();
  
  const newOrder = {
    id: pedidoId,
    idUsuario: payload.idUsuario,
    idDireccion: payload.idDireccion,
    fechaPedido: new Date().toISOString(),
    estadoPedido: "CONFIRMADO",
    total: payload.total,
    metodoEnvio: payload.metodoEnvio,
    observaciones: payload.observaciones || "",
    codigoCupon: payload.codigoCupon || null,
    descuentoAplicado: payload.descuentoAplicado || 0,
    detalles: payload.detalles || []
  };

  // Save to mock data
  mockData.orders.unshift(newOrder);

  return {
    aprobado: true,
    mensaje: "Pago aprobado",
    total: payload.total,
    pedidoId: pedidoId,
    pagoId: Math.floor(1000 + Math.random() * 9000),
    referenciaTransaccion: `MOCK-${Date.now()}`,
    ultimos4: payload.numeroTarjeta.slice(-4),
    estadoPago: "APROBADO"
  };
}
