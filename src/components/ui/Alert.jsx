// Inline status banner (loading / error / info). Replaces the ad-hoc colored <p> blocks
// that were re-implemented with inconsistent spacing across the auth, admin and checkout
// screens.
const tones = {
  info: "bg-mint text-forest",
  loading: "bg-mint text-forest",
  success: "bg-mint text-forest",
  error: "bg-red-50 text-red-700",
  neutral: "border border-line bg-white text-ink"
};

const sizes = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-3 text-sm"
};

export const Alert = ({ tone = "info", size = "sm", className = "", children, ...props }) => (
  <p className={`rounded font-semibold ${tones[tone]} ${sizes[size]} ${className}`.trim()} {...props}>
    {children}
  </p>
);
