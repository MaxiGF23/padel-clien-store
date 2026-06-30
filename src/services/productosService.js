import axios from "axios";

// Servicio de integración con el backend (Spring Boot).
// El backend expone el catálogo en http://localhost:4040/api/productos
// y devuelve la respuesta en formato JSON.
const API_URL = "http://localhost:4040/api";

// Devuelve una promesa con la lista de productos.
// Se usa con getProductos().then().catch() dentro de useEffect en el componente.
// axios parsea el JSON automáticamente y lanza el error en respuestas no 2xx.
export function getProductos() {
  return axios.get(`${API_URL}/productos`).then((res) => res.data);
}
