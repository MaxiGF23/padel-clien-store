// Single source of truth for the text-input look. `inputClass` is exported on its own so
// <select>/<textarea> elements can share the exact same styling.
export const inputClass = "focus-ring h-10 w-full rounded border border-line bg-white px-3 text-sm";

export const Input = ({ className = "", ...props }) => (
  <input className={`${inputClass} ${className}`} {...props} />
);
