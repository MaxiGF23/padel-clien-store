import { request, usingMocks } from "./apiClient.js";
import { fetchProductImage } from "./productImageService.js";
import * as adminService from "./adminService.js";

// Agrega la imagen (data URL) traída del backend a los productos que tengan una.
async function withImage(product) {
  if (!product?.tieneImagen || product.imagenUrl) return product;
  const imagenUrl = await fetchProductImage(product.id);
  return imagenUrl ? { ...product, imagenUrl } : product;
}

// Trae el catálogo completo (con imágenes) UNA sola vez. El filtrado, la búsqueda
// y el orden se resuelven en el cliente con un selector (ver selectFilteredProducts
// en catalogSlice), así no hace falta volver a pedir el catálogo en cada cambio de filtro.
export async function getProducts() {
  const raw = usingMocks() ? adminService.getMockData().products : await request("/productos");
  return Promise.all(raw.map(withImage));
}
export async function getProductById(id) {
  if (!usingMocks()) return withImage(await request(`/productos/${id}`));
  const mockData = adminService.getMockData();
  return mockData.products.find((p) => p.id === Number(id));
}
export async function getCategories() {
  if (!usingMocks()) return request("/categorias");
  const mockData = adminService.getMockData();
  return mockData.categories;
}
