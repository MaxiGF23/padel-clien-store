const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4040/api";
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";

// Ante un 401 (token ausente, invalido o expirado) limpiamos la sesion y mandamos
// al login, para que el usuario re-autentique y obtenga un JWT valido.
// No redirigimos cuando el 401 viene del propio login (ej: credenciales incorrectas).
function handleUnauthorized(path) {
  if (path.startsWith("/auth/login")) return;
  const token = window.localStorage.getItem("padelstore_token");
  // Log de diagnostico: muestra que endpoint devolvio 401 y si habia token.
  console.error(
    `[apiClient] 401 en "${path}" — token presente: ${Boolean(token)}` +
      (token ? ` (empieza con: ${token.slice(0, 8)})` : "")
  );
  window.localStorage.removeItem("padelstore_token");
  window.localStorage.removeItem("padelstore_user");
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

export async function request(path, options = {}) {
  const token = window.localStorage.getItem("padelstore_token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  if (response.status === 401) handleUnauthorized(path);
  if (!response.ok) throw new Error((await response.text()) || `HTTP ${response.status}`);
  return response.status === 204 ? null : response.json();
}
// Subida de archivos (multipart/form-data). No seteamos Content-Type a mano:
// el navegador agrega el boundary correcto. Mantiene el token JWT si hay sesion.
export async function uploadFile(path, file, field = "file") {
  const token = window.localStorage.getItem("padelstore_token");
  const formData = new FormData();
  formData.append(field, file);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData
  });
  if (response.status === 401) handleUnauthorized(path);
  if (!response.ok) throw new Error((await response.text()) || `HTTP ${response.status}`);
  // El backend responde 201 sin body; devolvemos null si no hay JSON.
  return response.status === 204 ? null : response.json().catch(() => null);
}

// GET publico de la imagen principal (primera) de un producto. Devuelve un data URL
// listo para <img src> o null si el producto no tiene imagen.
export async function getProductImageDataUrl(id) {
  try {
    const data = await request(`/productos/${id}/imagen`);
    if (!data?.imageBase64) return null;
    return `data:${data.contentType || "image/jpeg"};base64,${data.imageBase64}`;
  } catch {
    return null;
  }
}

const toDataUrl = (img) => `data:${img.contentType || "image/jpeg"};base64,${img.imageBase64}`;

// GET publico de toda la galeria del producto, ordenada. Devuelve [{ id, orden, src }].
export async function getProductImagesDataUrls(id) {
  try {
    const data = await request(`/productos/${id}/imagenes`);
    if (!Array.isArray(data)) return [];
    return data.map((img) => ({ id: img.id, orden: img.orden, src: toDataUrl(img) }));
  } catch {
    return [];
  }
}

export function usingMocks() {
  return USE_MOCKS;
}
