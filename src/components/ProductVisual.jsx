export function ProductVisual({ product, size = "md" }) {
  const sizes = { sm: "h-16 text-3xl", md: "h-36 text-6xl", lg: "h-full min-h-80 text-8xl" };
  // Si el producto tiene una imagen cargada (data URL o URL), la mostramos; si no,
  // caemos al emoji `visual` como placeholder.
  if (product?.imagenUrl) {
    return (
      <div className={`flex w-full items-center justify-center overflow-hidden rounded bg-cloud ${sizes[size]}`}>
        <img src={product.imagenUrl} alt={product?.nombreProducto || ""} className="h-full w-full object-contain" />
      </div>
    );
  }
  return (
    <div className={`flex w-full items-center justify-center rounded bg-cloud ${sizes[size]}`}>
      <span aria-hidden="true">{product?.visual || "🏓"}</span>
    </div>
  );
}
