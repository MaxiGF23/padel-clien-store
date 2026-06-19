import { categories, coupons, orders, products, users } from "@/data/mockData.js";
import { getProductImagesDataUrls, request, uploadFile, usingMocks } from "./apiClient.js";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

let mockProducts = [...products];
let mockCategories = [...categories];
let mockCoupons = [...coupons];
let mockOrders = [...orders];
let mockUsers = [...users];

const nextId = (items) => Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1;
const active = (items) => items.filter((item) => item.activo !== false);

export async function getAdminData() {
  const [productsData, categoriesData, couponsData, ordersData, usersData] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
    getAdminCoupons(),
    getAdminOrders(),
    getAdminUsers()
  ]);
  return {
    products: productsData,
    categories: categoriesData,
    coupons: couponsData,
    orders: ordersData,
    users: usersData
  };
}

export async function getAdminProducts() {
  return usingMocks() ? mockProducts : request("/productos");
}

export async function createProduct(payload) {
  if (!usingMocks()) return request("/productos", { method: "POST", body: JSON.stringify(payload) });
  const category = mockCategories.find((item) => item.id === Number(payload.idCategoria));
  const product = {
    ...payload,
    id: nextId(mockProducts),
    tieneImagen: false,
    nombreCategoria: category?.nombreCategoria || ""
  };
  mockProducts = [product, ...mockProducts];
  return product;
}

export async function updateProduct(id, payload) {
  if (!usingMocks()) return request(`/productos/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  const category = mockCategories.find((item) => item.id === Number(payload.idCategoria));
  const existing = mockProducts.find((item) => item.id === Number(id));
  // Conservamos las imagenes ya cargadas: editar los datos del producto no las borra.
  const imagenes = existing?.imagenes || [];
  const product = {
    ...existing,
    ...payload,
    id: Number(id),
    nombreCategoria: category?.nombreCategoria || "",
    imagenes,
    tieneImagen: imagenes.length > 0,
    imagenDataUrl: imagenes[0]?.src
  };
  mockProducts = mockProducts.map((item) => (item.id === Number(id) ? product : item));
  return product;
}

export async function deleteProduct(id) {
  if (!usingMocks()) return request(`/productos/${id}`, { method: "DELETE" });
  mockProducts = mockProducts.filter((item) => item.id !== Number(id));
  return null;
}

let mockImageId = 1000;

// Sincroniza el flag tieneImagen y la imagen principal (para las cards) de un producto mock.
const syncMockGallery = (product) => ({
  ...product,
  tieneImagen: (product.imagenes?.length || 0) > 0,
  imagenDataUrl: product.imagenes?.[0]?.src
});

// Agrega una imagen a la galeria del producto via multipart/form-data.
// El backend la guarda como Blob y la devuelve en Base64 al consultarla.
export async function uploadProductImage(id, file) {
  if (!usingMocks()) {
    await uploadFile(`/productos/${id}/imagenes`, file);
    return { id: Number(id) };
  }
  // En modo mock no hay backend: guardamos un data URL en el producto.
  const src = await readFileAsDataUrl(file);
  const nueva = { id: mockImageId++, src };
  mockProducts = mockProducts.map((item) =>
    item.id === Number(id) ? syncMockGallery({ ...item, imagenes: [...(item.imagenes || []), nueva] }) : item
  );
  return { id: Number(id) };
}

// Lista la galeria de un producto: [{ id, orden, src }].
export async function getProductImages(id) {
  if (!usingMocks()) {
    return getProductImagesDataUrls(id);
  }
  const product = mockProducts.find((item) => item.id === Number(id));
  return (product?.imagenes || []).map((img, index) => ({ id: img.id, orden: index, src: img.src }));
}

// Borra una imagen puntual por su id.
export async function deleteProductImage(idImagen) {
  if (!usingMocks()) {
    await request(`/productos/imagenes/${idImagen}`, { method: "DELETE" });
    return { id: Number(idImagen) };
  }
  mockProducts = mockProducts.map((item) =>
    syncMockGallery({ ...item, imagenes: (item.imagenes || []).filter((img) => img.id !== Number(idImagen)) })
  );
  return { id: Number(idImagen) };
}

// Reordena la galeria del producto segun la lista de ids de imagen recibida.
export async function reorderProductImages(id, idsOrdenados) {
  if (!usingMocks()) {
    await request(`/productos/${id}/imagenes/orden`, { method: "PUT", body: JSON.stringify(idsOrdenados) });
    return { id: Number(id) };
  }
  mockProducts = mockProducts.map((item) => {
    if (item.id !== Number(id)) return item;
    const porId = new Map((item.imagenes || []).map((img) => [img.id, img]));
    const imagenes = idsOrdenados.map((imgId) => porId.get(Number(imgId))).filter(Boolean);
    return syncMockGallery({ ...item, imagenes });
  });
  return { id: Number(id) };
}

export async function getAdminCategories() {
  return usingMocks() ? mockCategories : request("/categorias");
}

export async function createCategory(payload) {
  if (!usingMocks()) return request("/categorias", { method: "POST", body: JSON.stringify(payload) });
  const category = { ...payload, id: nextId(mockCategories) };
  mockCategories = [category, ...mockCategories];
  return category;
}

export async function updateCategory(id, payload) {
  if (!usingMocks()) return request(`/categorias/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  const category = { ...payload, id: Number(id) };
  mockCategories = mockCategories.map((item) => (item.id === Number(id) ? category : item));
  return category;
}

export async function deleteCategory(id) {
  if (!usingMocks()) return request(`/categorias/${id}`, { method: "DELETE" });
  mockCategories = mockCategories.filter((item) => item.id !== Number(id));
  return null;
}

export async function getAdminCoupons() {
  return usingMocks() ? active(mockCoupons) : request("/cupones");
}

export async function createCoupon(payload) {
  if (!usingMocks()) return request("/cupones", { method: "POST", body: JSON.stringify(payload) });
  const coupon = {
    ...payload,
    id: nextId(mockCoupons),
    codigo: payload.codigo.toUpperCase(),
    activo: true,
    usosActuales: 0
  };
  mockCoupons = [coupon, ...mockCoupons];
  return coupon;
}

export async function deleteCoupon(id) {
  if (!usingMocks()) return request(`/cupones/${id}`, { method: "DELETE" });
  mockCoupons = mockCoupons.map((item) => (item.id === Number(id) ? { ...item, activo: false } : item));
  return null;
}

export async function getAdminOrders() {
  return usingMocks() ? mockOrders : request("/pedidos");
}

export async function updateOrderStatus(id, estadoPedido) {
  if (!usingMocks())
    return request(`/pedidos/${id}/estado`, { method: "PATCH", body: JSON.stringify({ estadoPedido }) });
  const updated = mockOrders.find((item) => item.id === Number(id));
  const order = { ...updated, estadoPedido };
  mockOrders = mockOrders.map((item) => (item.id === Number(id) ? order : item));
  return order;
}

export async function cancelOrder(id) {
  if (!usingMocks()) return request(`/pedidos/${id}`, { method: "DELETE" });
  mockOrders = mockOrders.map((item) => (item.id === Number(id) ? { ...item, estadoPedido: "CANCELADO" } : item));
  return null;
}

export async function getAdminUsers() {
  return usingMocks() ? active(mockUsers) : request("/usuarios");
}

export async function createUser(payload) {
  if (!usingMocks()) return request("/usuarios", { method: "POST", body: JSON.stringify(payload) });
  const user = { ...payload, id: nextId(mockUsers), rol: "USER", activo: true, createdAt: new Date().toISOString() };
  mockUsers = [user, ...mockUsers];
  return user;
}

export async function updateUser(id, payload) {
  if (!usingMocks()) return request(`/usuarios/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  const existing = mockUsers.find((item) => item.id === Number(id));
  const user = { ...existing, ...payload, id: Number(id) };
  mockUsers = mockUsers.map((item) => (item.id === Number(id) ? user : item));
  return user;
}

export async function updateUserRole(id, rol) {
  if (!usingMocks()) return request(`/usuarios/${id}/rol`, { method: "PATCH", body: JSON.stringify({ rol }) });
  const user = { ...mockUsers.find((item) => item.id === Number(id)), rol };
  mockUsers = mockUsers.map((item) => (item.id === Number(id) ? user : item));
  return user;
}

export async function deleteUser(id) {
  if (!usingMocks()) return request(`/usuarios/${id}`, { method: "DELETE" });
  mockUsers = mockUsers.map((item) => (item.id === Number(id) ? { ...item, activo: false } : item));
  return null;
}

// Getters para sincronizar datos entre admin y catalog
export function getMockData() {
  return {
    products: mockProducts,
    categories: mockCategories,
    coupons: mockCoupons,
    orders: mockOrders,
    users: mockUsers
  };
}
