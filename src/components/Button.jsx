import { Link } from "react-router-dom";

const variants = {
  primary: "bg-forest text-white hover:bg-forest-dark",
  secondary: "border border-line bg-white text-ink hover:border-forest",
  ghost: "text-forest hover:bg-mint",
  danger: "bg-red-50 text-red-700 hover:bg-red-100"
};

const sizes = {
  md: "h-10 px-4 text-sm font-semibold",
  sm: "h-8 px-3 text-xs font-bold"
};

export const Button = ({ variant = "primary", size = "md", className = "", to, ...props }) => {
  const cls = `focus-ring inline-flex items-center justify-center rounded transition disabled:cursor-not-allowed disabled:opacity-60 ${sizes[size]} ${variants[variant]} ${className}`;
  return to ? <Link to={to} className={cls} {...props} /> : <button className={cls} {...props} />;
};
