import { categories, products } from "@/data/mockData.js";
import { normalizeText } from "@/utils/formatters.js";
import { request, usingMocks } from "./apiClient.js";

export async function getProducts(filters = {}) {
  if (!usingMocks()) {
    const params = new URLSearchParams();
    if (filters.category) params.set("categoria", filters.category);
    if (filters.brand) params.set("marca", filters.brand);
    const query = params.toString();
    return request(`/productos${query ? `?${query}` : ""}`);
  }
  const search = normalizeText(filters.search);
  return products
    .filter((p) => !search || normalizeText(`${p.nombreProducto} ${p.marca}`).includes(search))
    .filter((p) => filters.category === "Todos los productos" || !filters.category || p.nombreCategoria === filters.category)
    .filter((p) => !filters.brands?.length || filters.brands.includes(p.marca))
    .sort((a, b) => filters.sort === "price-asc" ? a.precio - b.precio : filters.sort === "price-desc" ? b.precio - a.precio : a.id - b.id);
}
export async function getProductById(id) { return usingMocks() ? products.find((p) => p.id === Number(id)) : request(`/productos/${id}`); }
export async function getCategories() { return usingMocks() ? categories : request("/categorias"); }
