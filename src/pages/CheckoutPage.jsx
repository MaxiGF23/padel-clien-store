import { Check, CreditCard, Info, Landmark, Loader2, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, selectCartSubtotal, selectCartTotal, setShippingCost } from "@/features/cart/cartSlice.js";
import {
  setPaymentMethod,
  setShippingMethod,
  submitCheckout,
  updateAddress,
  updateCard,
  resetCheckout
} from "@/features/checkout/checkoutSlice.js";
import { showToast } from "@/features/ui/toastSlice.js";
import { formatMoney } from "@/utils/formatters.js";
import { Button } from "@/components/Button.jsx";
import { ProductVisual } from "@/components/ProductVisual.jsx";
import { SummaryRows } from "@/components/SummaryRows.jsx";
import { Card } from "@/components/ui/Card.jsx";
import { FormField } from "@/components/ui/FormField.jsx";
import { Text } from "@/components/ui/Text.jsx";
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
// Algoritmo de Luhn: el backend (pasarela ficticia) rechaza tarjetas que no lo
// cumplen, así que lo validamos también en el front para avisar al instante.
function pasaLuhn(numero) {
  let suma = 0;
  let duplicar = false;
  for (let i = numero.length - 1; i >= 0; i--) {
    let digito = numero.charCodeAt(i) - 48;
    if (duplicar) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    suma += digito;
    duplicar = !duplicar;
  }
  return suma % 10 === 0;
}
// Validación por campo de la tarjeta: se evalúa en tiempo real mientras el usuario
// escribe. Devuelve el mensaje de error o null si el valor (no vacío) es válido.
function cardFieldError(field, value) {
  const v = (value || "").trim();
  if (v === "") return null;
  if (field === "numeroTarjeta") {
    const digits = v.replace(/\s/g, "");
    if (!/^\d{16}$/.test(digits)) return "El número debe tener 16 dígitos";
    if (!pasaLuhn(digits)) return "Número de tarjeta inválido";
    return null;
  }
  if (field === "vencimiento") {
    return /^\d{2}\/\d{2}$/.test(v) ? null : "Formato MM/AA";
  }
  if (field === "cvv") {
    return /^\d{3,4}$/.test(v) ? null : "El CVV debe tener 3 o 4 dígitos";
  }
  return null; // titularTarjeta: sin validación de longitud
}
export function CheckoutPage() {
  const dispatch = useDispatch(),
    navigate = useNavigate(),
    cart = useSelector((s) => s.cart),
    checkout = useSelector((s) => s.checkout),
    subtotal = useSelector(selectCartSubtotal),
    total = useSelector(selectCartTotal);

  const isOrderConfirmed = checkout.result?.aprobado;

  // Limpia el carrito y el checkout al salir de la pantalla de confirmación.
  function leaveConfirmation(to) {
    dispatch(clearCart());
    dispatch(resetCheckout());
    navigate(to);
  }

  function validateForm() {
    const errors = [];
    const requiredAddress = ["nombre", "apellido", "calle", "numero", "ciudad", "provincia", "codigoPostal"];
    const missing = requiredAddress.filter((field) => !checkout.address[field]?.trim());
    if (missing.length > 0) errors.push(`Completa la direccion de envio: ${missing.join(", ")}`);
    if (checkout.paymentMethod === "TARJETA_CREDITO") {
      if (!/^\d{16}$/.test(checkout.card.numeroTarjeta.replace(/\s/g, ""))) {
        errors.push("El numero de tarjeta debe tener 16 digitos");
      }
      if (!checkout.card.titularTarjeta.trim()) errors.push("Ingresa el titular de la tarjeta");
      if (!/^\d{2}\/\d{2}$/.test(checkout.card.vencimiento)) errors.push("El vencimiento debe tener formato MM/AA");
      if (!/^\d{3,4}$/.test(checkout.card.cvv)) errors.push("El CVV debe tener 3 o 4 digitos");
    }
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((message) => dispatch(showToast({ type: "error", message })));
      return;
    }
    const result = await dispatch(submitCheckout());
    if (submitCheckout.rejected.match(result)) {
      dispatch(showToast({ type: "error", message: result.error.message || "No pudimos procesar el pago" }));
    } else if (!result.payload.aprobado) {
      // La pasarela respondió 200 pero rechazó el pago (ej. tarjeta inválida por Luhn).
      dispatch(showToast({ type: "error", message: result.payload.mensaje || "El pago fue rechazado" }));
    } else {
      dispatch(showToast({ type: "success", message: `Pago aprobado · Pedido #${result.payload.pedidoId}` }));
    }
  }
  return (
    <section className="mx-auto max-w-6xl px-4 py-7 md:px-6">
      {isOrderConfirmed ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check size={32} className="text-emerald-700" />
          </div>
          <Text variant="title" className="mb-2">
            ¡Pedido confirmado!
          </Text>
          <p className="mb-6 text-sm text-neutral-500">Tu pago ha sido procesado exitosamente</p>
          <Card className="mb-8 p-6">
            <p className="text-xs font-semibold text-neutral-500">NÚMERO DE PEDIDO</p>
            <p className="mt-2 text-2xl font-extrabold text-forest">#{checkout.result?.pedidoId}</p>
            <p className="mt-4 text-xs text-neutral-500">ID de Transacción: {checkout.result?.referenciaTransaccion}</p>
            <div className="mt-6 border-t border-line pt-6">
              <SummaryRows
                subtotal={subtotal}
                shipping={cart.shippingCost}
                discount={cart.discount}
                total={checkout.result?.total}
              />
            </div>
          </Card>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => leaveConfirmation("/")}>Volver al inicio</Button>
            <Button variant="secondary" onClick={() => leaveConfirmation("/pedidos")}>
              Ver mis pedidos
            </Button>
          </div>
        </div>
      ) : (
        <>
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
              <Card as="section" className="p-5">
                <h1 className="mb-5 text-lg font-extrabold">Direccion de envio</h1>
                <div className="grid gap-4 sm:grid-cols-2">
                  {["nombre", "apellido", "calle", "numero", "ciudad", "provincia", "codigoPostal"].map((field) => (
                    <FormField
                      key={field}
                      label={field}
                      value={checkout.address[field] || ""}
                      onChange={(e) => dispatch(updateAddress({ [field]: e.target.value }))}
                    />
                  ))}
                </div>
              </Card>
              <Card as="section" className="p-5">
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
              </Card>
              <Card as="section" className="p-5">
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
                {checkout.paymentMethod === "TARJETA_CREDITO" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {["numeroTarjeta", "titularTarjeta", "vencimiento", "cvv"].map((field) => {
                      const error = cardFieldError(field, checkout.card[field]);
                      return (
                        <label key={field}>
                          <span className="mb-1 block text-xs font-semibold text-neutral-500">{field}</span>
                          <input
                            className={`focus-ring h-10 w-full rounded border px-3 text-sm ${error ? "border-red-400" : "border-line"}`}
                            value={checkout.card[field]}
                            onChange={(e) => dispatch(updateCard({ [field]: e.target.value }))}
                          />
                          {error && <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span>}
                        </label>
                      );
                    })}
                  </div>
                )}
                {checkout.paymentMethod === "TRANSFERENCIA" && (
                  <div className="rounded border border-line bg-paper p-4">
                    <p className="mb-4 text-xs text-neutral-500">
                      Transferi el total del pedido a la siguiente cuenta. Tu pedido se confirma cuando se acredite el
                      pago (hasta 48 hs habiles).
                    </p>
                    <dl className="space-y-2 text-sm">
                      {[
                        ["Banco", "Banco Galicia"],
                        ["Titular", "PadelStore S.A."],
                        ["CUIT", "30-71234567-9"],
                        ["CBU", "0070099020000038218112"],
                        ["Alias", "PADEL.STORE.AR"]
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-4">
                          <dt className="text-neutral-500">{label}</dt>
                          <dd className="font-semibold">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-4 border-t border-line pt-3 text-xs text-neutral-500">
                      Envia el comprobante a <b>pagos@padelstore.com.ar</b> indicando tu numero de pedido.
                    </p>
                  </div>
                )}
                {checkout.paymentMethod === "EFECTIVO" && (
                  <div className="flex items-start gap-3 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                    <Info size={18} className="mt-0.5 shrink-0" />
                    <p>
                      El pago en efectivo se abona al momento de la entrega: si elegiste <b>retiro en sucursal</b>, te
                      lo va a solicitar el cajero en la tienda; si elegiste <b>envio a domicilio</b>, lo abonas al
                      repartidor al recibir tu pedido. Te recomendamos tener el importe justo.
                    </p>
                  </div>
                )}
              </Card>
            </div>
            <Card as="aside" className="self-start p-5">
              <Text variant="section" className="mb-5">
                Tu pedido
              </Text>
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
              <Button
                className="mt-6 w-full gap-2"
                disabled={cart.detalles.length === 0 || checkout.status === "loading"}
              >
                {checkout.status === "loading" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Procesando pago...
                  </>
                ) : (
                  "Confirmar pedido"
                )}
              </Button>
              <p className="mt-4 text-center text-xs text-neutral-500">Pago seguro · Datos encriptados</p>
            </Card>
          </form>
        </>
      )}
    </section>
  );
}
