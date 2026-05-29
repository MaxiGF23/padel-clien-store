import { Minus, Plus } from "lucide-react";
export function QuantityStepper({ value, onChange, min = 1 }) {
  return <div className="inline-grid h-8 grid-cols-3 overflow-hidden rounded border border-line bg-white"><button type="button" aria-label="Restar cantidad" className="focus-ring flex w-8 items-center justify-center hover:bg-paper" onClick={() => onChange(Math.max(min, value - 1))}><Minus size={14} /></button><span className="flex w-8 items-center justify-center border-x border-line text-sm font-semibold">{value}</span><button type="button" aria-label="Sumar cantidad" className="focus-ring flex w-8 items-center justify-center hover:bg-paper" onClick={() => onChange(value + 1)}><Plus size={14} /></button></div>;
}
