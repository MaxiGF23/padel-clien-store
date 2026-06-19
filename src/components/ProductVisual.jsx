import { useEffect, useState } from "react";
import { getProductImageDataUrl, usingMocks } from "@/services/apiClient.js";

function useProductImage(product) {
  // En mock el data URL viene directo en el producto. Con backend lo pedimos por id.
  const direct = product?.imagenDataUrl || null;
  const id = product?.id;
  const shouldFetch = !direct && !usingMocks() && Boolean(product?.tieneImagen) && Boolean(id);
  // Guardamos la imagen junto al id al que corresponde, para no mostrar una imagen vieja
  // si cambia el producto, y para reflejar la principal actual al re-montar (post-reorden).
  const [loaded, setLoaded] = useState({ id: null, src: null });

  useEffect(() => {
    if (!shouldFetch) return;
    let cancelled = false;
    getProductImageDataUrl(id).then((dataUrl) => {
      if (!cancelled) setLoaded({ id, src: dataUrl });
    });
    return () => {
      cancelled = true;
    };
  }, [shouldFetch, id]);

  if (direct) return direct;
  if (!shouldFetch) return null;
  return loaded.id === id ? loaded.src : null;
}

export function ProductVisual({ product, size = "md" }) {
  const sizes = { sm: "h-16 text-3xl", md: "h-36 text-6xl", lg: "h-full min-h-80 text-8xl" };
  const src = useProductImage(product);
  return (
    <div className={`flex w-full items-center justify-center overflow-hidden rounded bg-cloud ${sizes[size]}`}>
      {src ? (
        <img src={src} alt={product?.nombreProducto || "Producto"} className="h-full w-full object-contain" />
      ) : (
        <span aria-hidden="true">{product?.visual || "🏓"}</span>
      )}
    </div>
  );
}
