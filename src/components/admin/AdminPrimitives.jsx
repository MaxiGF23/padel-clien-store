import { X } from "lucide-react";

export function AdminButton({ variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-forest text-white hover:bg-[#0b2f24]",
    secondary: "border border-line bg-white text-ink hover:border-forest",
    danger: "bg-red-50 text-red-700 hover:bg-red-100"
  };
  return <button type="button" className={`focus-ring inline-flex h-8 items-center justify-center rounded px-3 text-xs font-bold transition disabled:opacity-60 ${variants[variant]} ${className}`} {...props} />;
}

export function AdminTable({ title, children }) {
  return (
    <section className="overflow-hidden rounded border border-line bg-white">
      <div className="border-b border-line px-4 py-3 text-xs font-extrabold">{title}</div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

export function StatusBadge({ tone = "neutral", children }) {
  const tones = {
    neutral: "bg-neutral-100 text-neutral-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700"
  };
  return <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${tones[tone]}`}>{children}</span>;
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

export const inputClass = "focus-ring h-10 w-full rounded border border-line bg-white px-3 text-sm";

export function AdminModal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded border border-line bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-extrabold">{title}</h2>
          <button type="button" onClick={onClose} className="focus-ring rounded p-1 hover:bg-paper" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
