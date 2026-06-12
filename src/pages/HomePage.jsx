import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCatalog, setCategory, setSort, toggleBrand } from "@/features/catalog/catalogSlice.js";
import { Button } from "@/components/Button.jsx";
import { ProductCard } from "@/components/ProductCard.jsx";
const brands = ["Bullpadel", "Head", "Dunlop", "Wilson", "Adidas"];
export function HomePage() {
  const dispatch = useDispatch();
  const { products, categories, filters, status } = useSelector((s) => s.catalog);
  
  // Refetch al montar para sincronizar con cambios del admin
  useEffect(() => {
    dispatch(fetchCatalog());
  }, [dispatch]);
  
  // Refetch cuando cambian los filtros
  useEffect(() => {
    dispatch(fetchCatalog());
  }, [dispatch, filters.category, filters.brands, filters.sort, filters.search]);
  return (
    <>
      <section className="bg-forest px-6 py-14 text-center text-white">
        <h1 className="text-3xl font-extrabold md:text-4xl">Tu juego, tu equipamiento</h1>
        <p className="mt-2 text-sm text-white/80">Las mejores marcas de padel · Envio a todo el pais</p>
        <Button variant="secondary" className="mt-6 h-9 bg-white text-forest">
          Ver catalogo completo
        </Button>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[210px_1fr] md:px-6">
        <aside className="self-start rounded border border-line bg-white p-4">
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
        </aside>
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
          {status === "loading" ? (
            <p>Cargando productos...</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
