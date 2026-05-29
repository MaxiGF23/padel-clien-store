import { formatMoney } from "@/utils/formatters.js";
export function SummaryRows({ subtotal, shipping, discount = 0, total }) {
  return <div className="space-y-2 text-sm"><div className="flex justify-between text-neutral-600"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div><div className="flex justify-between text-neutral-600"><span>Envio</span><span>{shipping === 0 ? "Gratis" : formatMoney(shipping)}</span></div><div className="flex justify-between text-neutral-600"><span>Descuento</span><span>{discount > 0 ? `-${formatMoney(discount)}` : "- $ 0"}</span></div><div className="border-t border-line pt-3"><div className="flex justify-between text-base font-bold text-forest"><span>Total</span><span>{formatMoney(total)}</span></div></div></div>;
}
