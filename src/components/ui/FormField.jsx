import { Text } from "./Text.jsx";
import { Input } from "./Input.jsx";

// Label + control wrapper. Renders its `children` (e.g. a <select> or <textarea>) when
// provided, otherwise a default <Input> built from the remaining props. `capitalize`
// uppercases lowercase field-name labels (used by the auth/register forms). `error`
// renders an inline validation message below the control when present.
export const FormField = ({ label, capitalize = false, className = "", error, children, ...inputProps }) => (
  <label className={`block ${className}`.trim()}>
    <Text as="span" variant="label" className={`mb-1 block ${capitalize ? "capitalize" : ""}`.trim()}>
      {label}
    </Text>
    {children ?? <Input error={!!error} {...inputProps} />}
    {error && <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span>}
  </label>
);
