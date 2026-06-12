import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "@/features/cart/cartSlice.js";
import { showToast } from "@/features/ui/toastSlice.js";
import { formatMoney } from "@/utils/formatters.js";
import { Button } from "./Button.jsx";
import { ProductVisual } from "./ProductVisual.jsx";
export function ProductCard({ product }) {
  const dispatch = useDispatch();
  function handleAddToCart() {
    dispatch(addToCart({ product, quantity: 1 }));
    dispatch(showToast({ type: "success", message: `${product.nombreProducto} agregado al carrito` }));
  }
  return (
    <article className="overflow-hidden rounded border border-line bg-white">
      <Link to={`/productos/${product.id}`} className="block">
        <ProductVisual product={product} />
      </Link>
      <div className="space-y-2 p-4">
        <p className="text-[11px] font-bold uppercase text-neutral-500">{product.marca}</p>
        <Link to={`/productos/${product.id}`} className="line-clamp-2 min-h-10 text-sm font-bold hover:text-forest">
          {product.nombreProducto}
        </Link>
        <p className="text-lg font-extrabold text-forest">{formatMoney(product.precio)}</p>
        <Button className="h-8 w-full text-xs" onClick={handleAddToCart}>
          Agregar al carrito
        </Button>
      </div>
    </article>
  );
}
