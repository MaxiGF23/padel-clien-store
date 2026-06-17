// Base surface: the `rounded border border-line bg-white` block reused across every
// screen. Callers add their own spacing/extra classes via `className`.
export const Card = ({ as: Tag = "div", className = "", children, ...props }) => (
  <Tag className={`rounded border border-line bg-white ${className}`} {...props}>
    {children}
  </Tag>
);
