import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProduct } from "@/features/catalog/catalogSlice.js";
import { selectIsAdmin } from "@/features/auth/authSlice.js";
import { useAddToCart } from "@/hooks/useAddToCart.js";
import { formatMoney } from "@/utils/formatters.js";
import { Button } from "@/components/Button.jsx";
import { ProductVisual } from "@/components/ProductVisual.jsx";
import { QuantityStepper } from "@/components/QuantityStepper.jsx";
import { Alert } from "@/components/ui/Alert.jsx";
import { Card } from "@/components/ui/Card.jsx";
import { Container } from "@/components/ui/Container.jsx";
import { Text } from "@/components/ui/Text.jsx";
export function ProductDetailPage() {
  const { id } = useParams(),
    dispatch = useDispatch(),
    navigate = useNavigate();
  const product = useSelector((s) => s.catalog.selectedProduct);
  const isAdmin = useSelector(selectIsAdmin);
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [prevId, setPrevId] = useState(id);
  // Reset selection when navigating to another product
  if (prevId !== id) {
    setPrevId(id);
    setActiveImage(0);
    setQuantity(1);
  }
  useEffect(() => {
    dispatch(fetchProduct(id));
  }, [dispatch, id]);
  if (!product) {
    return (
      <Container>
        <Alert tone="loading" size="md">
          Cargando producto...
        </Alert>
      </Container>
    );
  }
  // Galería: si el producto tiene imagen real cargada, se muestra ella sola; si no,
  // caemos a los placeholders de emojis con el carrusel completo. Cada item es un
  // "descriptor" que ProductVisual sabe renderizar (imagenUrl o visual).
  const gallery = product.imagenUrl
    ? [{ imagenUrl: product.imagenUrl, nombreProducto: product.nombreProducto }]
    : [product.visual || "🏓", "🟡", "📐", "🎯"].map((visual) => ({ visual }));
  const hasCarousel = gallery.length > 1;
  const activeIndex = Math.min(activeImage, gallery.length - 1);
  const goTo = (index) => setActiveImage((index + gallery.length) % gallery.length);
  async function handleBuyNow() {
    if (await addToCart(product, quantity)) navigate("/carrito");
  }
  return (
    <Container>
      <div className="mb-5 text-xs text-neutral-500">
        <Link to="/">Inicio</Link> · {product.nombreCategoria} · <b>{product.nombreProducto}</b>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Card className="relative p-6">
            <ProductVisual product={gallery[activeIndex]} size="lg" />
            {hasCarousel && (
              <>
                <button
                  type="button"
                  aria-label="Imagen anterior"
                  className="focus-ring absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-line bg-white p-2 text-neutral-600 shadow-soft hover:text-forest"
                  onClick={() => goTo(activeIndex - 1)}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Imagen siguiente"
                  className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-line bg-white p-2 text-neutral-600 shadow-soft hover:text-forest"
                  onClick={() => goTo(activeIndex + 1)}
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {gallery.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${i === activeIndex ? "bg-forest" : "bg-neutral-300"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </Card>
          {hasCarousel && (
            <div className="mt-4 grid grid-cols-4 gap-3 sm:w-80">
              {gallery.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Ver imagen ${i + 1}`}
                  className={`focus-ring rounded border bg-white p-2 ${i === activeIndex ? "border-forest" : "border-line hover:border-neutral-300"}`}
                  onClick={() => setActiveImage(i)}
                >
                  <ProductVisual product={item} size="sm" />
                </button>
              ))}
            </div>
          )}
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
                <Button onClick={() => addToCart(product, quantity)}>Agregar al carrito</Button>
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
