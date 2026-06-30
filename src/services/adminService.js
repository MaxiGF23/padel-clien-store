import { categories, coupons, orders, products, users } from "@/data/mockData.js";
import { request, usingMocks } from "./apiClient.js";
import { deleteProductImage, fetchProductImage, uploadProductImage } from "./productImageService.js";

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

// Agrega la imagen (data URL) a cada producto que tenga una guardada en la base.
async function withImage(product) {
  if (!product?.tieneImagen) return product;
  const imagenUrl = await fetchProductImage(product.id);
  return imagenUrl ? { ...product, imagenUrl } : product;
}

// Separa los campos de imagen (manejados aparte) del resto del producto, que va como JSON.
function splitImageFields(payload) {
  const { imagenFile = null, imagenUrl = "", imagenRemoved = false, ...rest } = payload;
  return { imagenFile, imagenUrl, imagenRemoved, rest };
}

export async function getAdminProducts() {
  if (usingMocks()) return mockProducts;
  const data = await request("/productos");
  return Promise.all(data.map(withImage));
}

export async function createProduct(payload) {
  // El producto se guarda como JSON; la imagen (archivo) se sube aparte y el backend la
  // persiste en la base (tabla imagen_producto).
  const { imagenFile, imagenUrl, rest } = splitImageFields(payload);
  if (!usingMocks()) {
    const saved = await request("/productos", { method: "POST", body: JSON.stringify(rest) });
    if (imagenFile) {
      await uploadProductImage(saved.id, imagenFile);
      return { ...saved, tieneImagen: true, imagenUrl };
    }
    return saved;
  }
  const category = mockCategories.find((item) => item.id === Number(payload.idCategoria));
  const product = {
    ...rest,
    id: nextId(mockProducts),
    tieneImagen: Boolean(imagenUrl),
    imagenUrl: imagenUrl || undefined,
    nombreCategoria: category?.nombreCategoria || ""
  };
  mockProducts = [product, ...mockProducts];
  return product;
}

export async function updateProduct(id, payload) {
  const { imagenFile, imagenUrl, imagenRemoved, rest } = splitImageFields(payload);
  if (!usingMocks()) {
    const saved = await request(`/productos/${id}`, { method: "PUT", body: JSON.stringify(rest) });
    if (imagenFile) {
      await uploadProductImage(id, imagenFile);
      return { ...saved, tieneImagen: true, imagenUrl };
    }
    if (imagenRemoved) {
      await deleteProductImage(id);
      return { ...saved, tieneImagen: false, imagenUrl: undefined };
    }
    // Imagen sin cambios: conservamos la vista previa ya cargada.
    return { ...saved, imagenUrl };
  }
  const category = mockCategories.find((item) => item.id === Number(payload.idCategoria));
  const product = {
    ...rest,
    id: Number(id),
    tieneImagen: Boolean(imagenUrl),
    imagenUrl: imagenUrl || undefined,
    nombreCategoria: category?.nombreCategoria || ""
  };
  mockProducts = mockProducts.map((item) => (item.id === Number(id) ? product : item));
  return product;
}

export async function deleteProduct(id) {
  if (!usingMocks()) return request(`/productos/${id}`, { method: "DELETE" });
  mockProducts = mockProducts.filter((item) => item.id !== Number(id));
  return null;
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
