import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout.jsx";
import { Layout } from "@/components/Layout.jsx";
import { RequireAdmin } from "@/components/RequireAdmin.jsx";
import { RequireAuth } from "@/components/RequireAuth.jsx";
import { CartPage } from "@/pages/CartPage.jsx";
import { CheckoutPage } from "@/pages/CheckoutPage.jsx";
import { HomePage } from "@/pages/HomePage.jsx";
import { LoginPage, RegisterPage } from "@/pages/AuthPages.jsx";
import { OrdersPage } from "@/pages/OrdersPage.jsx";
import { ProductDetailPage } from "@/pages/ProductDetailPage.jsx";
import { AdminCategoriesPage, AdminCouponsPage, AdminDashboardPage, AdminOrdersPage, AdminProductsPage, AdminUsersPage } from "@/pages/AdminPages.jsx";
export default function App() {
  return <Routes><Route element={<Layout />}><Route index element={<HomePage />} /><Route path="/productos/:id" element={<ProductDetailPage />} /><Route path="/carrito" element={<CartPage />} /><Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} /><Route path="/login" element={<LoginPage />} /><Route path="/registro" element={<RegisterPage />} /><Route path="/pedidos" element={<RequireAuth><OrdersPage /></RequireAuth>} /></Route><Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}><Route index element={<AdminDashboardPage />} /><Route path="productos" element={<AdminProductsPage />} /><Route path="categorias" element={<AdminCategoriesPage />} /><Route path="cupones" element={<AdminCouponsPage />} /><Route path="pedidos" element={<AdminOrdersPage />} /><Route path="usuarios" element={<AdminUsersPage />} /></Route></Routes>;
}
