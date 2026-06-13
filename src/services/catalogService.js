import { normalizeText } from "@/utils/formatters.js";
import { request, usingMocks } from "./apiClient.js";
import * as adminService from "./adminService.js";

export async function getProducts(filters = {}) {
  // Traemos el catálogo completo (del backend o de los mocks) y aplicamos el mismo
  // pipeline de filtrado/orden en ambos casos. El backend solo soporta filtros
  // limitados (y "Todos los productos" no es una categoría real), así que filtrar
  // en el front mantiene coherente la búsqueda, marcas múltiples, orden y el "ver todo".
  const products = usingMocks() ? adminService.getMockData().products : await request("/productos");
  const search = normalizeText(filters.search);
  return products
    .filter((p) => !search || normalizeText(`${p.nombreProducto} ${p.marca}`).includes(search))
    .filter(
      (p) => filters.category === "Todos los productos" || !filters.category || p.nombreCategoria === filters.category
    )
    .filter((p) => !filters.brands?.length || filters.brands.includes(p.marca))
    .sort((a, b) =>
      filters.sort === "price-asc"
        ? a.precio - b.precio
        : filters.sort === "price-desc"
          ? b.precio - a.precio
          : a.id - b.id
    );
}
export async function getProductById(id) {
  if (!usingMocks()) return request(`/productos/${id}`);
  const mockData = adminService.getMockData();
  return mockData.products.find((p) => p.id === Number(id));
}
export async function getCategories() {
  if (!usingMocks()) return request("/categorias");
  const mockData = adminService.getMockData();
  return mockData.categories;
}
