import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/features/cart/cartSlice.js";
import { fetchProduct } from "@/features/catalog/catalogSlice.js";
import { formatMoney } from "@/utils/formatters.js";
import { Button } from "@/components/Button.jsx";
import { ProductVisual } from "@/components/ProductVisual.jsx";
import { QuantityStepper } from "@/components/QuantityStepper.jsx";
export function ProductDetailPage() {
  const { id } = useParams(), dispatch = useDispatch();
  const product = useSelector((s) => s.catalog.selectedProduct);
  const [quantity, setQuantity] = useState(1);
  useEffect(() => { dispatch(fetchProduct(id)); }, [dispatch, id]);
  if (!product) return <div className="mx-auto max-w-6xl px-6 py-10">Cargando producto...</div>;
  return <section className="mx-auto max-w-6xl px-4 py-8 md:px-6"><div className="mb-5 text-xs text-neutral-500"><Link to="/">Inicio</Link> · {product.nombreCategoria} · <b>{product.nombreProducto}</b></div><div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"><div><div className="rounded border border-line bg-white p-6"><ProductVisual product={product} size="lg" /></div><div className="mt-4 grid grid-cols-4 gap-3 sm:w-80">{[product, { visual: "🟡" }, { visual: "📐" }, { visual: "🎯" }].map((item, i) => <button key={i} className={`rounded border bg-white p-2 ${i === 0 ? "border-forest" : "border-line"}`}><ProductVisual product={item} size="sm" /></button>)}</div></div><div className="max-w-xl"><p className="text-xs font-bold uppercase text-neutral-500">{product.marca} · {product.nombreCategoria}</p><h1 className="mt-2 text-3xl font-extrabold">{product.nombreProducto}</h1><p className="mt-3 inline-flex rounded bg-mint px-2 py-1 text-xs font-bold text-forest">En stock · {product.stock} disponibles</p><p className="mt-6 text-3xl font-extrabold text-forest">{formatMoney(product.precio)}</p><p className="mt-1 text-xs text-neutral-500">Hasta 6 cuotas sin interes con tarjeta de credito</p><h2 className="mt-8 text-sm font-bold">Descripcion</h2><p className="mt-2 text-sm leading-6 text-neutral-600">{product.descripcion}</p><div className="mt-6 flex items-center gap-4"><span className="text-sm font-semibold">Cantidad</span><QuantityStepper value={quantity} onChange={setQuantity} /></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><Button onClick={() => dispatch(addToCart({ product, quantity }))}>Agregar al carrito</Button><Button variant="secondary" onClick={() => dispatch(addToCart({ product, quantity }))}>Comprar ahora</Button></div><h2 className="mb-4 mt-8 text-sm font-bold">Caracteristicas</h2><dl className="grid grid-cols-2 gap-y-2 text-sm">{Object.entries(product.atributos || {}).map(([k, v]) => <div className="contents" key={k}><dt className="capitalize text-neutral-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl></div></div></section>;
}
