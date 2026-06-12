import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dismissToast } from "@/features/ui/toastSlice.js";

const styles = {
  success: { icon: CheckCircle2, accent: "border-forest text-forest", bg: "bg-mint" },
  error: { icon: XCircle, accent: "border-red-600 text-red-600", bg: "bg-red-50" },
  info: { icon: Info, accent: "border-line text-ink", bg: "bg-white" }
};

function Toast({ toast }) {
  const dispatch = useDispatch();
  useEffect(() => {
    const timeout = window.setTimeout(() => dispatch(dismissToast(toast.id)), toast.duration);
    return () => window.clearTimeout(timeout);
  }, [dispatch, toast.id, toast.duration]);
  const { icon: Icon, accent, bg } = styles[toast.type] || styles.info;
  return (
    <div
      role="status"
      className={`pointer-events-auto flex w-80 items-start gap-3 rounded border-l-4 p-3 shadow-lg ${accent} ${bg} animate-toast-in`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1 text-sm font-semibold text-ink">{toast.message}</p>
      <button
        type="button"
        aria-label="Cerrar"
        className="focus-ring rounded text-neutral-400 hover:text-ink"
        onClick={() => dispatch(dismissToast(toast.id))}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useSelector((s) => s.toasts.items);
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
