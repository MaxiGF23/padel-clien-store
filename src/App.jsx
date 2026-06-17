import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout.jsx";
import { Layout } from "@/components/Layout.jsx";
import { Toaster } from "@/components/Toaster.jsx";
import { RequireAdmin } from "@/components/RequireAdmin.jsx";
import { RequireAuth } from "@/components/RequireAuth.jsx";
import { RequireCustomer } from "@/components/RequireCustomer.jsx";
import { CartPage } from "@/pages/CartPage.jsx";
import { CheckoutPage } from "@/pages/CheckoutPage.jsx";
import { HomePage } from "@/pages/HomePage.jsx";
import { LoginPage, RegisterPage } from "@/pages/AuthPages.jsx";
import { OrdersPage } from "@/pages/OrdersPage.jsx";
import { OrderDetailPage } from "@/pages/OrderDetailPage.jsx";
import { NotFoundPage } from "@/pages/NotFoundPage.jsx";
import { ProductDetailPage } from "@/pages/ProductDetailPage.jsx";
import { ProductosBackendPage } from "@/pages/ProductosBackendPage.jsx";
import {
  AdminCategoriesPage,
  AdminCouponsPage,
  AdminDashboardPage,
  AdminOrdersPage,
  AdminProductsPage,
  AdminUsersPage
} from "@/pages/AdminPages.jsx";
export default function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/productos-backend" element={<ProductosBackendPage />} />
          <Route path="/productos/:id" element={<ProductDetailPage />} />
          <Route
            path="/carrito"
            element={
              <RequireCustomer>
                <CartPage />
              </RequireCustomer>
            }
          />
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <RequireCustomer>
                  <CheckoutPage />
                </RequireCustomer>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route
            path="/pedidos"
            element={
              <RequireAuth>
                <OrdersPage />
              </RequireAuth>
            }
          />
          <Route
            path="/pedidos/:id"
            element={
              <RequireAuth>
                <OrderDetailPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="productos" element={<AdminProductsPage />} />
          <Route path="categorias" element={<AdminCategoriesPage />} />
          <Route path="cupones" element={<AdminCouponsPage />} />
          <Route path="pedidos" element={<AdminOrdersPage />} />
          <Route path="usuarios" element={<AdminUsersPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
