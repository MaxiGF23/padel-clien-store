import { request } from "./apiClient.js";

// API del carrito server-side (asociado al usuario autenticado vía JWT).
// Todos los endpoints devuelven el CarritoDTO completo y actualizado.

export function getMyCart() {
  return request("/carritos/mi");
}

export function addItem(idProducto, cantidad) {
  return request("/carritos/mi/items", {
    method: "POST",
    body: JSON.stringify({ idProducto, cantidad })
  });
}

export function updateItem(idDetalle, idProducto, cantidad) {
  return request(`/carritos/mi/items/${idDetalle}`, {
    method: "PUT",
    body: JSON.stringify({ idProducto, cantidad })
  });
}

export function removeItem(idDetalle) {
  return request(`/carritos/mi/items/${idDetalle}`, { method: "DELETE" });
}
