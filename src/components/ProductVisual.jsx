export function ProductVisual({ product, size = "md" }) {
  const sizes = { sm: "h-16 text-3xl", md: "h-36 text-6xl", lg: "h-full min-h-80 text-8xl" };
  return (
    <div className={`flex w-full items-center justify-center rounded bg-cloud ${sizes[size]}`}>
      <span aria-hidden="true">{product?.visual || "🏓"}</span>
    </div>
  );
}
