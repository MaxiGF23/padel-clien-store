import { Check, CreditCard, Landmark, Wallet } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, selectCartSubtotal, selectCartTotal, setShippingCost } from "@/features/cart/cartSlice.js";
import {
  setPaymentMethod,
  setShippingMethod,
  submitCheckout,
  updateAddress,
  updateCard
} from "@/features/checkout/checkoutSlice.js";
import { formatMoney } from "@/utils/formatters.js";
import { Button } from "@/components/Button.jsx";
import { ProductVisual } from "@/components/ProductVisual.jsx";
import { SummaryRows } from "@/components/SummaryRows.jsx";
const shippingOptions = [
  { id: "ENVIO_DOMICILIO", title: "Envio estandar", detail: "Llega en 3-5 dias habiles", cost: 1500 },
  { id: "ENVIO_EXPRES", title: "Envio express", detail: "Llega en 24-48 horas", cost: 3200 },
  { id: "RETIRO_TIENDA", title: "Retiro en sucursal", detail: "Disponible desde el dia siguiente", cost: 0 }
];
const paymentOptions = [
  { id: "TARJETA_CREDITO", label: "Tarjeta", icon: CreditCard },
  { id: "TRANSFERENCIA", label: "Transferencia", icon: Landmark },
  { id: "EFECTIVO", label: "Efectivo", icon: Wallet }
];
export function CheckoutPage() {
  const dispatch = useDispatch(),
    cart = useSelector((s) => s.cart),
    checkout = useSelector((s) => s.checkout),
    subtotal = useSelector(selectCartSubtotal),
    total = useSelector(selectCartTotal);
  async function handleSubmit(e) {
    e.preventDefault();
    const result = await dispatch(submitCheckout());
    if (submitCheckout.fulfilled.match(result)) dispatch(clearCart());
  }
  return (
    <section className="mx-auto max-w-6xl px-4 py-7 md:px-6">
      <div className="mb-7 flex items-center justify-center gap-6 border-b border-line pb-5 text-xs font-semibold text-neutral-500">
        <span className="flex items-center gap-2 text-forest">
          <Check size={16} /> Carrito
        </span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest text-white">2</span>
        <span className="text-ink">Direccion y Pago</span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line">3</span>
        <span>Confirmacion</span>
      </div>
      <form className="grid gap-6 lg:grid-cols-[1fr_360px]" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <section className="rounded border border-line bg-white p-5">
            <h1 className="mb-5 text-lg font-extrabold">Direccion de envio</h1>
            <div className="grid gap-4 sm:grid-cols-2">
              {["nombre", "apellido", "calle", "numero", "ciudad", "provincia", "codigoPostal"].map((field) => (
                <label key={field}>
                  <span className="mb-1 block text-xs font-semibold text-neutral-500">{field}</span>
                  <input
                    className="focus-ring h-10 w-full rounded border border-line px-3 text-sm"
                    value={checkout.address[field] || ""}
                    onChange={(e) => dispatch(updateAddress({ [field]: e.target.value }))}
                  />
                </label>
              ))}
            </div>
          </section>
          <section className="rounded border border-line bg-white p-5">
            <h2 className="mb-4 text-lg font-extrabold">Metodo de envio</h2>
            <div className="space-y-3">
              {shippingOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center justify-between rounded border p-4 ${checkout.shippingMethod === option.id ? "border-forest bg-mint" : "border-line"}`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      className="accent-forest"
                      checked={checkout.shippingMethod === option.id}
                      onChange={() => {
                        dispatch(setShippingMethod(option.id));
                        dispatch(setShippingCost(option.cost));
                      }}
                    />
                    <span>
                      <span className="block text-sm font-bold">{option.title}</span>
                      <span className="text-xs text-neutral-500">{option.detail}</span>
                    </span>
                  </span>
                  <span className="text-sm font-extrabold text-forest">
                    {option.cost === 0 ? "Gratis" : formatMoney(option.cost)}
                  </span>
                </label>
              ))}
            </div>
          </section>
          <section className="rounded border border-line bg-white p-5">
            <h2 className="mb-4 text-lg font-extrabold">Medio de pago</h2>
            <div className="mb-5 grid grid-cols-3 rounded border border-line bg-paper p-1">
              {paymentOptions.map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  className={`focus-ring flex h-9 items-center justify-center gap-2 rounded text-xs font-bold ${checkout.paymentMethod === id ? "bg-forest text-white" : "text-neutral-600"}`}
                  onClick={() => dispatch(setPaymentMethod(id))}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {["numeroTarjeta", "titularTarjeta", "vencimiento", "cvv"].map((field) => (
                <label key={field}>
                  <span className="mb-1 block text-xs font-semibold text-neutral-500">{field}</span>
                  <input
                    className="focus-ring h-10 w-full rounded border border-line px-3 text-sm"
                    value={checkout.card[field]}
                    onChange={(e) => dispatch(updateCard({ [field]: e.target.value }))}
                  />
                </label>
              ))}
            </div>
          </section>
        </div>
        <aside className="self-start rounded border border-line bg-white p-5">
          <h2 className="mb-5 font-extrabold">Tu pedido</h2>
          <div className="mb-5 space-y-4">
            {cart.detalles.map((item) => (
              <div key={item.idProducto} className="grid grid-cols-[48px_1fr_auto] gap-3">
                <ProductVisual product={item} size="sm" />
                <div>
                  <p className="text-sm font-bold">{item.nombreProducto}</p>
                  <p className="text-xs text-neutral-500">Cantidad: {item.cantidad}</p>
                </div>
                <p className="text-sm font-bold">{formatMoney(item.subtotal)}</p>
              </div>
            ))}
          </div>
          <SummaryRows subtotal={subtotal} shipping={cart.shippingCost} discount={cart.discount} total={total} />
          <Button className="mt-6 w-full" disabled={cart.detalles.length === 0 || checkout.status === "loading"}>
            {checkout.status === "loading" ? "Confirmando..." : "Confirmar pedido"}
          </Button>
          {checkout.result?.aprobado && (
            <p className="mt-3 text-center text-xs font-semibold text-forest">
              Pago aprobado · Pedido #{checkout.result.pedidoId}
            </p>
          )}
          <p className="mt-4 text-center text-xs text-neutral-500">Pago seguro · Datos encriptados</p>
        </aside>
      </form>
    </section>
  );
}
