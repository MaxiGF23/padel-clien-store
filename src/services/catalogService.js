import { categories as mockDataCategories, products as mockDataProducts } from "@/data/mockData.js";
import { normalizeText } from "@/utils/formatters.js";
import { request, usingMocks } from "./apiClient.js";
import * as adminService from "./adminService.js";

export async function getProducts(filters = {}) {
  if (!usingMocks()) {
    const params = new URLSearchParams();
    if (filters.category) params.set("categoria", filters.category);
    if (filters.brand) params.set("marca", filters.brand);
    const query = params.toString();
    return request(`/productos${query ? `?${query}` : ""}`);
  }
  const mockData = adminService.getMockData();
  const products = mockData.products;
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
