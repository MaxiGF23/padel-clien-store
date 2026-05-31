import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export function RequireAdmin({ children }) {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.rol !== "ADMIN") return <Navigate to="/" replace />;

  return children;
}
