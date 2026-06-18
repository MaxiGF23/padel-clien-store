// Tone-based pill. Pair with ORDER_STATUS from features/orders/statusConfig.js to drive
// both the tone and the label from a single source of truth.
const tones = {
  neutral: "bg-neutral-100 text-neutral-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700"
};

const sizes = {
  sm: "px-2 py-1 text-[10px]",
  md: "px-3 py-1 text-xs"
};

export const StatusBadge = ({ tone = "neutral", size = "sm", className = "", children }) => (
  <span className={`inline-flex rounded-full font-bold ${tones[tone]} ${sizes[size]} ${className}`.trim()}>
    {children}
  </span>
);
