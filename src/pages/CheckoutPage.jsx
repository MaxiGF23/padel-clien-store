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
import { STATUS } from "@/utils/asyncStatus.js";
import { cardFieldError } from "@/utils/validators.js";
import { formatMoney } from "@/utils/formatters.js";
import { Button } from "@/components/Button.jsx";
import { ProductVisual } from "@/components/ProductVisual.jsx";
import { SummaryRows } from "@/components/SummaryRows.jsx";
import { Card } from "@/components/ui/Card.jsx";
import { FormField } from "@/components/ui/FormField.jsx";
import { Text } from "@/components/ui/Text.jsx";

const ADDRESS_FIELDS = ["nombre", "apellido", "calle", "numero", "ciudad", "provincia", "codigoPostal"];
const CARD_FIELDS = ["numeroTarjeta", "titularTarjeta", "vencimiento", "cvv"];
// Ejemplos mostrados como placeholder (los campos arrancan vacios).
const ADDRESS_PLACEHOLDERS = {
  nombre: "Lionel",
  apellido: "Messi",
  calle: "Av. Corrientes",
  numero: "1234",
  ciudad: "Buenos Aires",
  provincia: "CABA",
  codigoPostal: "1414"
};
const CARD_PLACEHOLDERS = {
  numeroTarjeta: "4111 1111 1111 1111",
  titularTarjeta: "Lionel Messi",
  vencimiento: "12/28",
  cvv: "123"
};
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

// Valida direccion + tarjeta antes de enviar. Reusa cardFieldError (validators.js) para
// no repetir los regex de la tarjeta. Devuelve la lista de mensajes de error.
function validateForm(checkout) {
  const errors = [];
  const missing = ADDRESS_FIELDS.filter((field) => !checkout.address[field]?.trim());
  if (missing.length > 0) errors.push(`Completa la direccion de envio: ${missing.join(", ")}`);
  if (checkout.paymentMethod === "TARJETA_CREDITO") {
    CARD_FIELDS.forEach((field) => {
      const error = cardFieldError(field, checkout.card[field]);
      if (error) errors.push(error);
    });
  }
  return errors;
}

export function CheckoutPage() {
  const dispatch = useDispatch(),
    navigate = useNavigate(),
    cart = useSelector((s) => s.cart),
    checkout = useSelector((s) => s.checkout),
    subtotal = useSelector(selectCartSubtotal),
    total = useSelector(selectCartTotal);

  const isOrderConfirmed = checkout.result?.aprobado;

  // Limpia el carrito y el checkout al salir de la pantalla de confirmacion.
  function leaveConfirmation(to) {
    dispatch(clearCart());
    dispatch(resetCheckout());
    navigate(to);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validateForm(checkout);
    if (errors.length > 0) {
      errors.forEach((message) => dispatch(showToast({ type: "error", message })));
      return;
    }
    const result = await dispatch(submitCheckout());
    if (submitCheckout.rejected.match(result)) {
      dispatch(showToast({ type: "error", message: result.error.message || "No pudimos procesar el pago" }));
    } else if (!result.payload.aprobado) {
      // La pasarela respondio 200 pero rechazo el pago (ej. tarjeta invalida por Luhn).
      dispatch(showToast({ type: "error", message: result.payload.mensaje || "El pago fue rechazado" }));
    } else {
      dispatch(showToast({ type: "success", message: `Pago aprobado · Pedido #${result.payload.pedidoId}` }));
    }
  }

  if (isOrderConfirmed) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-7 md:px-6">
        <OrderConfirmation
          result={checkout.result}
          subtotal={subtotal}
          shipping={cart.shippingCost}
          discount={cart.discount}
          onLeave={leaveConfirmation}
        />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-7 md:px-6">
      <CheckoutSteps />
      <form className="grid gap-6 lg:grid-cols-[1fr_360px]" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <ShippingAddressForm
            address={checkout.address}
            onChange={(field, value) => dispatch(updateAddress({ [field]: value }))}
          />
          <ShippingMethodPicker
            selected={checkout.shippingMethod}
            onSelect={(option) => {
              dispatch(setShippingMethod(option.id));
              dispatch(setShippingCost(option.cost));
            }}
          />
          <PaymentSection
            method={checkout.paymentMethod}
            card={checkout.card}
            onMethodChange={(id) => dispatch(setPaymentMethod(id))}
            onCardChange={(field, value) => dispatch(updateCard({ [field]: value }))}
          />
        </div>
        <OrderSummaryAside
          items={cart.detalles}
          subtotal={subtotal}
          shipping={cart.shippingCost}
          discount={cart.discount}
          total={total}
          status={checkout.status}
        />
      </form>
    </section>
  );
}

function CheckoutSteps() {
  return (
    <div className="mb-7 flex items-center justify-center gap-6 border-b border-line pb-5 text-xs font-semibold text-neutral-500">
      <span className="flex items-center gap-2 text-forest">
        <Check size={16} /> Carrito
      </span>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest text-white">2</span>
      <span className="text-ink">Direccion y Pago</span>
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line">3</span>
      <span>Confirmacion</span>
    </div>
  );
}

function ShippingAddressForm({ address, onChange }) {
  return (
    <Card as="section" className="p-5">
      <h1 className="mb-5 text-lg font-extrabold">Direccion de envio</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {ADDRESS_FIELDS.map((field) => (
          <FormField
            key={field}
            capitalize
            label={field}
            placeholder={ADDRESS_PLACEHOLDERS[field]}
            value={address[field] || ""}
            onChange={(e) => onChange(field, e.target.value)}
          />
        ))}
      </div>
    </Card>
  );
}

function ShippingMethodPicker({ selected, onSelect }) {
  return (
    <Card as="section" className="p-5">
      <h2 className="mb-4 text-lg font-extrabold">Metodo de envio</h2>
      <div className="space-y-3">
        {shippingOptions.map((option) => (
          <label
            key={option.id}
            className={`flex cursor-pointer items-center justify-between rounded border p-4 ${selected === option.id ? "border-forest bg-mint" : "border-line"}`}
          >
            <span className="flex items-center gap-3">
              <input
                type="radio"
                className="accent-forest"
                checked={selected === option.id}
                onChange={() => onSelect(option)}
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
  );
}

function PaymentSection({ method, card, onMethodChange, onCardChange }) {
  return (
    <Card as="section" className="p-5">
      <h2 className="mb-4 text-lg font-extrabold">Medio de pago</h2>
      <div className="mb-5 grid grid-cols-3 rounded border border-line bg-paper p-1">
        {paymentOptions.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            className={`focus-ring flex h-9 items-center justify-center gap-2 rounded text-xs font-bold ${method === id ? "bg-forest text-white" : "text-neutral-600"}`}
            onClick={() => onMethodChange(id)}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>
      {method === "TARJETA_CREDITO" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {CARD_FIELDS.map((field) => (
            <FormField
              key={field}
              label={field}
              placeholder={CARD_PLACEHOLDERS[field]}
              value={card[field]}
              error={cardFieldError(field, card[field], { allowEmpty: true })}
              onChange={(e) => onCardChange(field, e.target.value)}
            />
          ))}
        </div>
      )}
      {method === "TRANSFERENCIA" && <TransferInstructions />}
      {method === "EFECTIVO" && <CashInstructions />}
    </Card>
  );
}

function TransferInstructions() {
  return (
    <div className="rounded border border-line bg-paper p-4">
      <p className="mb-4 text-xs text-neutral-500">
        Transferi el total del pedido a la siguiente cuenta. Tu pedido se confirma cuando se acredite el pago (hasta 48
        hs habiles).
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
  );
}

function CashInstructions() {
  return (
    <div className="flex items-start gap-3 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <Info size={18} className="mt-0.5 shrink-0" />
      <p>
        El pago en efectivo se abona al momento de la entrega: si elegiste <b>retiro en sucursal</b>, te lo va a
        solicitar el cajero en la tienda; si elegiste <b>envio a domicilio</b>, lo abonas al repartidor al recibir tu
        pedido. Te recomendamos tener el importe justo.
      </p>
    </div>
  );
}

function OrderSummaryAside({ items, subtotal, shipping, discount, total, status }) {
  return (
    <Card as="aside" className="self-start p-5">
      <Text variant="section" className="mb-5">
        Tu pedido
      </Text>
      <div className="mb-5 space-y-4">
        {items.map((item) => (
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
      <SummaryRows subtotal={subtotal} shipping={shipping} discount={discount} total={total} />
      <Button className="mt-6 w-full gap-2" disabled={items.length === 0 || status === STATUS.LOADING}>
        {status === STATUS.LOADING ? (
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
  );
}

function OrderConfirmation({ result, subtotal, shipping, discount, onLeave }) {
  return (
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
        <p className="mt-2 text-2xl font-extrabold text-forest">#{result?.pedidoId}</p>
        <p className="mt-4 text-xs text-neutral-500">ID de Transacción: {result?.referenciaTransaccion}</p>
        <div className="mt-6 border-t border-line pt-6">
          <SummaryRows subtotal={subtotal} shipping={shipping} discount={discount} total={result?.total} />
        </div>
      </Card>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={() => onLeave("/")}>Volver al inicio</Button>
        <Button variant="secondary" onClick={() => onLeave("/pedidos")}>
          Ver mis pedidos
        </Button>
      </div>
    </div>
  );
}
