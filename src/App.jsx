import { Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout.jsx";
import { RequireAuth } from "@/components/RequireAuth.jsx";
import { CartPage } from "@/pages/CartPage.jsx";
import { CheckoutPage } from "@/pages/CheckoutPage.jsx";
import { HomePage } from "@/pages/HomePage.jsx";
import { LoginPage, RegisterPage } from "@/pages/AuthPages.jsx";
import { OrdersPage } from "@/pages/OrdersPage.jsx";
import { ProductDetailPage } from "@/pages/ProductDetailPage.jsx";
export default function App() {
  return <Routes><Route element={<Layout />}><Route index element={<HomePage />} /><Route path="/productos/:id" element={<ProductDetailPage />} /><Route path="/carrito" element={<CartPage />} /><Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} /><Route path="/login" element={<LoginPage />} /><Route path="/registro" element={<RegisterPage />} /><Route path="/pedidos" element={<RequireAuth><OrdersPage /></RequireAuth>} /></Route></Routes>;
}
