import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCatalog, setCategory, setSort, toggleBrand } from "@/features/catalog/catalogSlice.js";
import { Button } from "@/components/Button.jsx";
import { ProductCard } from "@/components/ProductCard.jsx";
import { AsyncSection } from "@/components/ui/AsyncSection.jsx";
import { Card } from "@/components/ui/Card.jsx";
import { Container } from "@/components/ui/Container.jsx";
import { Text } from "@/components/ui/Text.jsx";
const brands = ["Bullpadel", "Head", "Dunlop", "Wilson", "Adidas"];
export function HomePage() {
  const dispatch = useDispatch();
  const { products, categories, filters, status, error } = useSelector((s) => s.catalog);

  // Refetch al montar y cada vez que cambian los filtros (sincroniza con cambios del admin).
  useEffect(() => {
    dispatch(fetchCatalog());
  }, [dispatch, filters.category, filters.brands, filters.sort, filters.search]);
  return (
    <>
      <section className="bg-forest px-6 py-14 text-center text-white">
        <Text variant="title">Tu juego, tu equipamiento</Text>
        <p className="mt-2 text-sm text-white/80">Las mejores marcas de padel · Envio a todo el pais</p>
        <Button variant="secondary" className="mt-6 h-9 bg-white text-forest">
          Ver catalogo completo
        </Button>
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
              <h2 className="text-xl font-extrabold">Todos los productos</h2>
              <p className="text-xs text-neutral-500">{products.length} productos encontrados</p>
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
