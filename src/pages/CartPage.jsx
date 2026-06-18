import { useDispatch, useSelector } from "react-redux";
import {
  changeQuantity,
  removeItem,
  selectCartSubtotal,
  selectCartTotal,
  setCouponCode,
  validateCoupon
} from "@/features/cart/cartSlice.js";
import { formatMoney } from "@/utils/formatters.js";
import { Button } from "@/components/Button.jsx";
import { ProductVisual } from "@/components/ProductVisual.jsx";
import { QuantityStepper } from "@/components/QuantityStepper.jsx";
import { SummaryRows } from "@/components/SummaryRows.jsx";
import { Card } from "@/components/ui/Card.jsx";
import { Container } from "@/components/ui/Container.jsx";
import { EmptyState } from "@/components/ui/EmptyState.jsx";
import { Input } from "@/components/ui/Input.jsx";
import { Text } from "@/components/ui/Text.jsx";
export function CartPage() {
  const dispatch = useDispatch(),
    cart = useSelector((s) => s.cart),
    subtotal = useSelector(selectCartSubtotal),
    total = useSelector(selectCartTotal);

  const handleApplyCoupon = async () => {
    await dispatch(validateCoupon(cart.couponCode));
  };
  return (
    <Container>
      <Text variant="title">Mi carrito</Text>
      <Text variant="subtitle" className="mt-1">
        {cart.detalles.length} productos en tu carrito
      </Text>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="min-h-96">
          {cart.detalles.length === 0 ? (
            <EmptyState
              className="h-72"
              message="Todavia no agregaste productos."
              action={<Button to="/">Ver productos</Button>}
            />
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
                    onClick={() => dispatch(removeItem(item.idProducto))}
                  >
                    Eliminar
                  </button>
                </div>
                <QuantityStepper
                  value={item.cantidad}
                  onChange={(quantity) => dispatch(changeQuantity({ idProducto: item.idProducto, quantity }))}
                />
                <div className="text-right">
                  <p className="text-xs text-neutral-500">Subtotal</p>
                  <p className="font-extrabold text-forest">{formatMoney(item.subtotal)}</p>
                </div>
              </div>
            ))
          )}
        </Card>
        <Card as="aside" className="self-start p-5">
          <Text variant="section" className="mb-5">
            Resumen del pedido
          </Text>
          <SummaryRows subtotal={subtotal} shipping={cart.shippingCost} discount={cart.discount} total={total} />
          <div className="mt-5 flex gap-2">
            <Input
              className="min-w-0 flex-1"
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
        </Card>
      </div>
    </Container>
  );
}
