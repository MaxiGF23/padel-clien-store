// Single source of truth for the text-input look. `inputClass` is exported on its own so
// <select>/<textarea> elements can share the exact same styling.
export const inputClass = "focus-ring h-10 w-full rounded border border-line bg-white px-3 text-sm";

// Subrayado rojo cuando el campo no pasa la validación. Mantiene el borde gris del box y
// solo engrosa/colorea el borde inferior, para que el error se lea como un "underline".
export const inputErrorClass = "border-b-2 border-b-red-500";

export const Input = ({ className = "", error = false, ...props }) => (
  <input
    className={`${inputClass} ${error ? inputErrorClass : ""} ${className}`.trim()}
    aria-invalid={error || undefined}
    {...props}
  />
);
