import { Link } from "react-router-dom";
export function Button({ variant = "primary", className = "", to, ...props }) {
  const variants = { primary: "bg-forest text-white hover:bg-[#0b2f24]", secondary: "border border-line bg-white text-ink hover:border-forest", ghost: "text-forest hover:bg-mint" };
  const cls = `focus-ring inline-flex h-10 items-center justify-center rounded px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`;
  return to ? <Link to={to} className={cls} {...props} /> : <button className={cls} {...props} />;
}
