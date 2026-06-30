import { request, uploadMultipart } from "./apiClient.js";

// La imagen del producto se guarda en la base (tabla imagen_producto) vía el backend.
// Acá envolvemos esos endpoints y cacheamos las imágenes ya leídas (son data URLs
// pesadas) para no re-pedirlas en cada render del catálogo.
const cache = new Map(); // idProducto -> dataUrl | null

// GET /productos/{id}/imagen -> { contentType, imageBase64 } => "data:<type>;base64,<...>"
export async function fetchProductImage(id) {
  if (cache.has(id)) return cache.get(id);
  try {
    const data = await request(`/productos/${id}/imagen`);
    const url = data?.imageBase64 ? `data:${data.contentType};base64,${data.imageBase64}` : null;
    cache.set(id, url);
    return url;
  } catch {
    cache.set(id, null);
    return null;
  }
}

// POST multipart /productos/{id}/imagen (campo "file"). Guarda los bytes en la base.
export async function uploadProductImage(id, file) {
  const formData = new FormData();
  formData.append("file", file);
  await uploadMultipart(`/productos/${id}/imagen`, formData);
  cache.delete(id);
}

export async function deleteProductImage(id) {
  await request(`/productos/${id}/imagen`, { method: "DELETE" });
  cache.delete(id);
}
