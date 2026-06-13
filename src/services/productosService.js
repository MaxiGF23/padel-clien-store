// Servicio de integración con el backend (Spring Boot).
// El backend expone el catálogo en http://localhost:4040/api/productos
// y devuelve la respuesta en formato JSON.
const API_URL = "http://localhost:4040/api";

// Devuelve una promesa con la lista de productos.
// Se usa con fetch().then().catch() dentro de useEffect en el componente.
export function getProductos() {
  return fetch(`${API_URL}/productos`).then((res) => {
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    return res.json();
  });
}
