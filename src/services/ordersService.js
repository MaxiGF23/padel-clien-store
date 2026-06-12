import { request, usingMocks } from "./apiClient.js";
import * as adminService from "./adminService.js";

export async function getOrdersByUser(idUsuario) {
  if (!usingMocks()) {
    return request(`/pedidos/usuario/${idUsuario}`);
  }
  return adminService.getMockData().orders.filter((o) => o.idUsuario === Number(idUsuario));
}
