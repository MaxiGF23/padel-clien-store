import { Text } from "./Text.jsx";
import { Input } from "./Input.jsx";

// Label + control wrapper. Renders its `children` (e.g. a <select> or <textarea>) when
// provided, otherwise a default <Input> built from the remaining props. `capitalize`
// uppercases lowercase field-name labels (used by the auth/register forms).
export const FormField = ({ label, capitalize = false, className = "", children, ...inputProps }) => (
  <label className={`block ${className}`.trim()}>
    <Text as="span" variant="label" className={`mb-1 block ${capitalize ? "capitalize" : ""}`.trim()}>
      {label}
    </Text>
    {children ?? <Input {...inputProps} />}
  </label>
);
