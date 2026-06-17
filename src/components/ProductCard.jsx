import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/features/cart/cartSlice.js";
import { showToast } from "@/features/ui/toastSlice.js";
import { formatMoney } from "@/utils/formatters.js";
import { Button } from "./Button.jsx";
import { Card } from "./ui/Card.jsx";
import { ProductVisual } from "./ProductVisual.jsx";
export function ProductCard({ product }) {
  const dispatch = useDispatch();
  async function handleAddToCart() {
    try {
      await dispatch(addItemToCart({ product, quantity: 1 })).unwrap();
      dispatch(showToast({ type: "success", message: `${product.nombreProducto} agregado al carrito` }));
    } catch (err) {
      dispatch(showToast({ type: "error", message: err.message || "No se pudo agregar al carrito" }));
    }
  }
  return (
    <Card as="article" className="overflow-hidden">
      <Link to={`/productos/${product.id}`} className="block">
        <ProductVisual product={product} />
      </Link>
      <div className="space-y-2 p-4">
        <p className="text-[11px] font-bold uppercase text-neutral-500">{product.marca}</p>
        <Link to={`/productos/${product.id}`} className="line-clamp-2 min-h-10 text-sm font-bold hover:text-forest">
          {product.nombreProducto}
        </Link>
        <p className="text-lg font-extrabold text-forest">{formatMoney(product.precio)}</p>
        <Button size="sm" className="w-full" onClick={handleAddToCart}>
          Agregar al carrito
        </Button>
      </div>
    </Card>
  );
}
