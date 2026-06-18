// Standard centered page shell: max width + the responsive horizontal/vertical padding
// repeated by every public page.
export const Container = ({ as: Tag = "section", className = "", children, ...props }) => (
  <Tag className={`mx-auto max-w-6xl px-4 py-8 md:px-6 ${className}`.trim()} {...props}>
    {children}
  </Tag>
);
