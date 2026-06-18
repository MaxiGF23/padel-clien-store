// Typography atom: centralizes titles, subtitles and the small text styles that were
// scattered as inline class strings. Pick a `variant`; override the tag with `as`.
const variants = {
  title: "text-3xl font-extrabold md:text-4xl",
  subtitle: "text-sm text-neutral-500",
  section: "text-base font-extrabold",
  body: "text-sm",
  muted: "text-xs text-neutral-500",
  label: "text-xs font-bold text-neutral-500"
};

const defaultTag = {
  title: "h1",
  subtitle: "p",
  section: "h2",
  body: "p",
  muted: "p",
  label: "span"
};

export const Text = ({ variant = "body", as, className = "", children, ...props }) => {
  const Tag = as || defaultTag[variant] || "p";
  return (
    <Tag className={`${variants[variant]} ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
};
