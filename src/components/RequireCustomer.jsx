import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Admins manage the store, they don't shop: block them from cart/checkout and send them
// back to the admin panel. Guests (no user) still pass through so they can build a cart.
export function RequireCustomer({ children }) {
  const user = useSelector((state) => state.auth.user);
  if (user?.rol === "ADMIN") return <Navigate to="/admin" replace />;
  return children;
}
