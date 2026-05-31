import { orders } from "@/data/mockData.js";
import { request, usingMocks } from "./apiClient.js";
export async function getOrdersByUser(idUsuario) {
  return usingMocks()
    ? orders.filter((o) => o.idUsuario === Number(idUsuario))
    : request(`/pedidos/usuario/${idUsuario}`);
}
