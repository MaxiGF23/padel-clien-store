import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAdmin } from "@/features/auth/authSlice.js";
import { useAddToCart } from "@/hooks/useAddToCart.js";
import { formatMoney } from "@/utils/formatters.js";
import { Button } from "./Button.jsx";
import { Card } from "./ui/Card.jsx";
import { ProductVisual } from "./ProductVisual.jsx";
export function ProductCard({ product }) {
  const isAdmin = useSelector(selectIsAdmin);
  const addToCart = useAddToCart();
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
        {!isAdmin && (
          <Button size="sm" className="w-full" onClick={() => addToCart(product, 1)}>
            Agregar al carrito
          </Button>
        )}
      </div>
    </Card>
  );
}
