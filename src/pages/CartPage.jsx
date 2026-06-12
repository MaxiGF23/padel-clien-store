import { useDispatch, useSelector } from "react-redux";
import {
  removeFromCart,
  selectCartSubtotal,
  selectCartTotal,
  setCouponCode,
  updateQuantity,
  validateCoupon
} from "@/features/cart/cartSlice.js";
import { formatMoney } from "@/utils/formatters.js";
import { Button } from "@/components/Button.jsx";
import { ProductVisual } from "@/components/ProductVisual.jsx";
import { QuantityStepper } from "@/components/QuantityStepper.jsx";
import { SummaryRows } from "@/components/SummaryRows.jsx";
export function CartPage() {
  const dispatch = useDispatch(),
    cart = useSelector((s) => s.cart),
    subtotal = useSelector(selectCartSubtotal),
    total = useSelector(selectCartTotal);

  const handleApplyCoupon = async () => {
    await dispatch(validateCoupon(cart.couponCode));
  };
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h1 className="text-3xl font-extrabold">Mi carrito</h1>
      <p className="mt-1 text-sm text-neutral-500">{cart.detalles.length} productos en tu carrito</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-h-96 rounded border border-line bg-white">
          {cart.detalles.length === 0 ? (
            <div className="flex h-72 flex-col items-center justify-center gap-4 text-center">
              <p className="text-sm text-neutral-500">Todavia no agregaste productos.</p>
              <Button to="/">Ver productos</Button>
            </div>
          ) : (
            cart.detalles.map((item) => (
              <div
                key={item.idProducto}
                className="grid gap-4 border-b border-line p-5 last:border-b-0 sm:grid-cols-[72px_1fr_auto_auto] sm:items-center"
              >
                <ProductVisual product={item} size="sm" />
                <div>
                  <p className="text-[11px] font-bold uppercase text-neutral-500">{item.marca}</p>
                  <h2 className="font-bold">{item.nombreProducto}</h2>
                  <button
                    className="mt-1 text-xs font-semibold text-red-600"
                    onClick={() => dispatch(removeFromCart(item.idProducto))}
                  >
                    Eliminar
                  </button>
                </div>
                <QuantityStepper
                  value={item.cantidad}
                  onChange={(quantity) => dispatch(updateQuantity({ idProducto: item.idProducto, quantity }))}
                />
                <div className="text-right">
                  <p className="text-xs text-neutral-500">Subtotal</p>
                  <p className="font-extrabold text-forest">{formatMoney(item.subtotal)}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <aside className="self-start rounded border border-line bg-white p-5">
          <h2 className="mb-5 font-extrabold">Resumen del pedido</h2>
          <SummaryRows subtotal={subtotal} shipping={cart.shippingCost} discount={cart.discount} total={total} />
          <div className="mt-5 flex gap-2">
            <input
              className="focus-ring h-10 min-w-0 flex-1 rounded border border-line px-3 text-sm"
              value={cart.couponCode}
              onChange={(e) => dispatch(setCouponCode(e.target.value))}
              placeholder="Codigo de cupon"
            />
            <Button variant="secondary" onClick={handleApplyCoupon}>
              Aplicar
            </Button>
          </div>
          {cart.couponError && (
            <p className="mt-2 text-xs font-semibold text-red-600">{cart.couponError}</p>
          )}
          {cart.discount > 0 && (
            <p className="mt-2 text-xs font-semibold text-forest">Cupón aplicado: {cart.couponCode}</p>
          )}
          <Button
            to="/checkout"
            className={`mt-5 w-full ${cart.detalles.length === 0 ? "pointer-events-none opacity-60" : ""}`}
          >
            Iniciar compra
          </Button>
          <Button to="/" variant="secondary" className="mt-3 w-full">
            Seguir comprando
          </Button>
        </aside>
      </div>
    </section>
  );
}
