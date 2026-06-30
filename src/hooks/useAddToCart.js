import { useDispatch } from "react-redux";
import { addItemToCart } from "@/features/cart/cartSlice.js";
import { showToast } from "@/features/ui/toastSlice.js";

// Logica compartida de "agregar al carrito" usada por ProductCard y ProductDetailPage:
// despacha el thunk, muestra el toast de exito/error y devuelve si funciono (para que
// "Comprar ahora" pueda navegar solo si se agrego bien).
export function useAddToCart() {
  const dispatch = useDispatch();
  return async function addToCart(product, quantity = 1) {
    try {
      await dispatch(addItemToCart({ product, quantity })).unwrap();
      dispatch(showToast({ type: "success", message: `${product.nombreProducto} agregado al carrito` }));
      return true;
    } catch (err) {
      dispatch(showToast({ type: "error", message: err.message || "No se pudo agregar al carrito" }));
      return false;
    }
  };
}
