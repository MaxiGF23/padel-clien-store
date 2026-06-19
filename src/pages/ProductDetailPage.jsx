import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addItemToCart } from "@/features/cart/cartSlice.js";
import { fetchProduct } from "@/features/catalog/catalogSlice.js";
import { showToast } from "@/features/ui/toastSlice.js";
import { formatMoney } from "@/utils/formatters.js";
import { getProductImagesDataUrls, usingMocks } from "@/services/apiClient.js";
import { Button } from "@/components/Button.jsx";
import { ProductVisual } from "@/components/ProductVisual.jsx";
import { QuantityStepper } from "@/components/QuantityStepper.jsx";
import { Card } from "@/components/ui/Card.jsx";
import { Container } from "@/components/ui/Container.jsx";
import { Text } from "@/components/ui/Text.jsx";
export function ProductDetailPage() {
  const { id } = useParams(),
    dispatch = useDispatch(),
    navigate = useNavigate();
  const product = useSelector((s) => s.catalog.selectedProduct);
  const isAdmin = useSelector((s) => s.auth.user?.rol === "ADMIN");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [fetchedImages, setFetchedImages] = useState([]);
  const [prevId, setPrevId] = useState(id);
  // Reset selection when navigating to another product
  if (prevId !== id) {
    setPrevId(id);
    setActiveImage(0);
    setQuantity(1);
    setFetchedImages([]);
  }
  useEffect(() => {
    dispatch(fetchProduct(id));
  }, [dispatch, id]);
  // Galeria real desde el backend (Base64). En mock se deriva en render mas abajo.
  useEffect(() => {
    if (usingMocks() || !product?.id || String(product.id) !== String(id)) return;
    let cancelled = false;
    getProductImagesDataUrls(product.id).then((list) => {
      if (!cancelled) setFetchedImages(list.map((img) => img.src));
    });
    return () => {
      cancelled = true;
    };
  }, [product?.id, id]);
  // En mock las imagenes vienen en el propio producto; con backend, del effect de arriba.
  const images = usingMocks() ? (product?.imagenes || []).map((img) => img.src) : fetchedImages;
  if (!product) return <div className="mx-auto max-w-6xl px-6 py-10">Cargando producto...</div>;
  // Si el producto tiene imagenes reales las usamos; si no, caemos a los visuales mock (emojis).
  const hasImages = images.length > 0;
  const gallery = hasImages ? images : [product.visual || "🏓", "🟡", "📐", "🎯"];
  const visualProduct = (entry) =>
    hasImages ? { imagenDataUrl: entry, nombreProducto: product.nombreProducto } : { visual: entry };
  const goTo = (index) => setActiveImage((index + gallery.length) % gallery.length);
  async function handleAddToCart() {
    try {
      await dispatch(addItemToCart({ product, quantity })).unwrap();
      dispatch(showToast({ type: "success", message: `${product.nombreProducto} agregado al carrito` }));
      return true;
    } catch (err) {
      dispatch(showToast({ type: "error", message: err.message || "No se pudo agregar al carrito" }));
      return false;
    }
  }
  async function handleBuyNow() {
    if (await handleAddToCart()) navigate("/carrito");
  }
  return (
    <Container>
      <div className="mb-5 text-xs text-neutral-500">
        <Link to="/">Inicio</Link> · {product.nombreCategoria} · <b>{product.nombreProducto}</b>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Card className="relative p-6">
            <ProductVisual product={visualProduct(gallery[activeImage])} size="lg" />
            <button
              type="button"
              aria-label="Imagen anterior"
              className="focus-ring absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-line bg-white p-2 text-neutral-600 shadow-soft hover:text-forest"
              onClick={() => goTo(activeImage - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Imagen siguiente"
              className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-line bg-white p-2 text-neutral-600 shadow-soft hover:text-forest"
              onClick={() => goTo(activeImage + 1)}
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {gallery.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${i === activeImage ? "bg-forest" : "bg-neutral-300"}`}
                />
              ))}
            </div>
          </Card>
          <div className="mt-4 grid grid-cols-4 gap-3 sm:w-80">
            {gallery.map((visual, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ver imagen ${i + 1}`}
                className={`focus-ring rounded border bg-white p-2 ${i === activeImage ? "border-forest" : "border-line hover:border-neutral-300"}`}
                onClick={() => setActiveImage(i)}
              >
                <ProductVisual product={visualProduct(visual)} size="sm" />
              </button>
            ))}
          </div>
        </div>
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase text-neutral-500">
            {product.marca} · {product.nombreCategoria}
          </p>
          <Text variant="title" className="mt-2">
            {product.nombreProducto}
          </Text>
          <p className="mt-3 inline-flex rounded bg-mint px-2 py-1 text-xs font-bold text-forest">
            En stock · {product.stock} disponibles
          </p>
          <p className="mt-6 text-3xl font-extrabold text-forest">{formatMoney(product.precio)}</p>
          <p className="mt-1 text-xs text-neutral-500">Hasta 6 cuotas sin interes con tarjeta de credito</p>
          <h2 className="mt-8 text-sm font-bold">Descripcion</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">{product.descripcion}</p>
          {!isAdmin && (
            <>
              <div className="mt-6 flex items-center gap-4">
                <span className="text-sm font-semibold">Cantidad</span>
                <QuantityStepper value={quantity} onChange={setQuantity} />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button onClick={handleAddToCart}>Agregar al carrito</Button>
                <Button variant="secondary" onClick={handleBuyNow}>
                  Comprar ahora
                </Button>
              </div>
            </>
          )}
          <h2 className="mb-4 mt-8 text-sm font-bold">Caracteristicas</h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            {Object.entries(product.atributos || {}).map(([k, v]) => (
              <div className="contents" key={k}>
                <dt className="capitalize text-neutral-500">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Container>
  );
}
