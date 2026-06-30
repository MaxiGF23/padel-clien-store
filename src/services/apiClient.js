import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4040/api";
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";

// Adjunta el token JWT (si existe) en cada llamada. Compartido por ambas instancias.
function attachAuth(config) {
  const token = window.localStorage.getItem("padelstore_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

// Instancia JSON (la mayoría de las llamadas).
const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});
http.interceptors.request.use(attachAuth);

// Instancia para subir archivos: SIN Content-Type por defecto, así el navegador lo
// setea como multipart/form-data con su boundary (necesario para MultipartFile).
const httpUpload = axios.create({ baseURL: API_BASE_URL });
httpUpload.interceptors.request.use(attachAuth);

// Mapea el error de axios al contrato anterior: lanzar Error con el mensaje del backend.
function toError(error) {
  if (error.response) {
    const { data, status } = error.response;
    const message = typeof data === "string" ? data : data?.message;
    return new Error(message || `HTTP ${status}`, { cause: error });
  }
  return error;
}

export async function request(path, options = {}) {
  try {
    const response = await http.request({
      url: path,
      method: options.method || "GET",
      // Los servicios ya pasan el body serializado con JSON.stringify().
      data: options.body,
      headers: options.headers
    });
    return response.status === 204 ? null : response.data;
  } catch (error) {
    throw toError(error);
  }
}

// Sube un FormData (archivos) a `path`. El navegador define el Content-Type multipart.
export async function uploadMultipart(path, formData) {
  try {
    const response = await httpUpload.post(path, formData);
    return response.status === 204 ? null : response.data;
  } catch (error) {
    throw toError(error);
  }
}

export function usingMocks() {
  return USE_MOCKS;
}
