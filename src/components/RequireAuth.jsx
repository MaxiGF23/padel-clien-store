import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
export function RequireAuth({ children }) {
  const user = useSelector((s) => s.auth.user);
  const location = useLocation();
  return user ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
