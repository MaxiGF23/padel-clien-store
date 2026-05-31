import { categories, coupons, orders, products, users } from "@/data/mockData.js";
import { request, usingMocks } from "./apiClient.js";

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
  const product = { ...payload, id: Number(id), tieneImagen: false, nombreCategoria: category?.nombreCategoria || "" };
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
