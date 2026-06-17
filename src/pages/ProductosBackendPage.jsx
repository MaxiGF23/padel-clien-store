import { useEffect, useState } from "react";
import { getProductos } from "@/services/productosService.js";
import { Alert } from "@/components/ui/Alert.jsx";
import { Card } from "@/components/ui/Card.jsx";

// Página demo de integración Front-Back:
// realiza una petición asincrónica al backend con fetch dentro de useEffect,
// guarda el resultado en el estado local con useState y lo renderiza.
export function ProductosBackendPage() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProductos()
      .then((data) => setProductos(data))
      .catch((err) => {
        console.error("Error al conectar con el backend:", err);
        setError(
          "No se pudo conectar con el servidor. Verifica que el backend este corriendo en http://localhost:4040"
        );
      })
      .finally(() => setCargando(false));
  }, []);

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-1 text-2xl font-extrabold">Productos (desde el backend)</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Datos obtenidos de <code>GET http://localhost:4040/api/productos</code>
      </p>

      {cargando && <p>Cargando productos...</p>}

      {error && (
        <Alert tone="error" size="md">
          {error}
        </Alert>
      )}

      {!cargando && !error && productos.length === 0 && (
        <p className="text-sm text-neutral-500">No hay productos cargados en el backend.</p>
      )}

      {!cargando && !error && productos.length > 0 && (
        <Card as="ul" className="divide-y divide-line">
          {productos.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-semibold">{p.nombreProducto}</p>
                <p className="text-xs text-neutral-500">
                  {p.marca} · {p.nombreCategoria}
                </p>
              </div>
              <span className="font-bold text-forest">
                ${p.precio?.toLocaleString("es-AR")}
              </span>
            </li>
          ))}
        </Card>
      )}
    </section>
  );
}
