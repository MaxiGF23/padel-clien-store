import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCatalog, selectFilteredProducts, setCategory, setSort, toggleBrand } from "@/features/catalog/catalogSlice.js";
import { Button } from "@/components/Button.jsx";
import { ProductCard } from "@/components/ProductCard.jsx";
import { AsyncSection } from "@/components/ui/AsyncSection.jsx";
import { Card } from "@/components/ui/Card.jsx";
import { Container } from "@/components/ui/Container.jsx";
import { Text } from "@/components/ui/Text.jsx";
import heroPadel from "@/assets/hero-padel.png";

const brands = ["Bullpadel", "Head", "Dunlop", "Wilson", "Adidas"];

const supplyJourney = [
  { step: "01", title: "La cancha", line: "El proyecto grande: infraestructura para abrir el club." },
  { step: "02", title: "El equipamiento", line: "Palas, redes, vestuarios — todo lo que hace jugar al club." },
  { step: "03", title: "El kiosco", line: "Pelotas, grips y consumibles. Todos los meses, sin fricción." }
];

export function HomePage() {
  const dispatch = useDispatch();
  const { categories, filters, status, error } = useSelector((s) => s.catalog);
  // La lista visible se deriva en el cliente (búsqueda/categoría/marca/orden) sin refetch.
  const products = useSelector(selectFilteredProducts);

  // Traemos el catálogo solo al montar la página (no en cada cambio de filtro).
  useEffect(() => {
    dispatch(fetchCatalog());
  }, [dispatch]);

  return (
    <>
      <section
        className="relative overflow-hidden bg-forest bg-cover bg-center px-6 py-24 text-white md:py-28"
        style={{ backgroundImage: `url(${heroPadel})` }}
      >
        <div className="absolute inset-0 bg-forest/60" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl text-center">
          <Text variant="title" className="text-balance">
            Proveedor integral para clubes de pádel
          </Text>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/85 md:text-base">
            Desde la cancha hasta la última pelota. Armamos y abastecemos clubes — no vendemos un grip a un jugador.
          </p>
          {filters.category !== "Todos los productos" && (
            <Button
              variant="secondary"
              className="mt-8 h-10 bg-white text-forest"
              onClick={() => dispatch(setCategory("Todos los productos"))}
            >
              Explorar catálogo para clubes
            </Button>
          )}
        </div>
      </section>

      <section className=" bg-white px-6 py-8">
       
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3 md:gap-6">
          {supplyJourney.map((item, index) => (
            <div key={item.step} className="relative text-center md:text-left">
              <span className="text-[11px] font-bold tracking-widest text-forest/50">{item.step}</span>
              <h3 className="mt-2 text-base font-extrabold text-ink">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500 md:text-sm">{item.line}</p>
              {index < supplyJourney.length - 1 && (
                <span
                  className="pointer-events-none absolute right-0 top-6 hidden h-px w-8 translate-x-1/2 bg-line md:block"
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <Container className="grid gap-6 md:grid-cols-[210px_1fr]">
        <Card as="aside" className="self-start p-4">
          <h2 className="mb-3 text-xs font-bold text-neutral-500">Categorias</h2>
          <div className="space-y-1">
            {["Todos los productos", ...categories.map((c) => c.nombreCategoria)].map((c) => (
              <button
                key={c}
                className={`focus-ring block w-full rounded px-3 py-2 text-left text-xs font-semibold ${filters.category === c ? "bg-mint text-forest" : "hover:bg-paper"}`}
                onClick={() => dispatch(setCategory(c))}
              >
                {c}
              </button>
            ))}
          </div>
          <h2 className="mb-3 mt-6 text-xs font-bold text-neutral-500">Marca</h2>
          <div className="space-y-2">
            {brands.map((b) => (
              <label key={b} className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(b)}
                  onChange={() => dispatch(toggleBrand(b))}
                  className="h-3.5 w-3.5 accent-forest"
                />
                {b}
              </label>
            ))}
          </div>
        </Card>
        <div>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold">Catálogo para clubes</h2>
              <p className="text-xs text-neutral-500">
                {products.length} productos · equipamiento y abastecimiento continuo
              </p>
            </div>
            <select
              className="focus-ring h-9 rounded border border-line bg-white px-3 text-xs"
              value={filters.sort}
              onChange={(e) => dispatch(setSort(e.target.value))}
            >
              <option value="featured">Ordenar: Mas relevantes</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
            </select>
          </div>
          <AsyncSection status={status} error={error} loadingMessage="Cargando productos...">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </AsyncSection>
        </div>
      </Container>
    </>
  );
}
