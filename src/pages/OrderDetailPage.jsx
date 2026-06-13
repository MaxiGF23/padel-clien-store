import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatDate, formatMoney } from "@/utils/formatters.js";
import { Button } from "@/components/Button.jsx";
import { ProductVisual } from "@/components/ProductVisual.jsx";
import { SummaryRows } from "@/components/SummaryRows.jsx";

const statusStyles = {
  CONFIRMADO: "bg-blue-100 text-blue-800",
  EN_CAMINO: "bg-amber-100 text-amber-800",
  ENTREGADO: "bg-emerald-100 text-emerald-800",
  CANCELADO: "bg-red-100 text-red-700"
};
const statusLabels = {
  CONFIRMADO: "Confirmado",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado"
};

export function OrderDetailPage() {
  const { id } = useParams();
  const { items } = useSelector((s) => s.orders);

  const order = items.find((o) => o.id === Number(id));

  if (!order) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="rounded border border-line bg-white p-8 text-center">
          <p className="mb-4 text-sm text-neutral-500">Pedido no encontrado</p>
          <Button to="/pedidos">Volver a mis pedidos</Button>
        </div>
      </section>
    );
  }

  const subtotal = order.detalles.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = order.descuentoAplicado || 0;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Pedido #{order.id}</h1>
          <p className="mt-1 text-sm text-neutral-500">Realizado el {formatDate(order.fechaPedido)}</p>
        </div>
        <span className={`rounded px-3 py-1 text-sm font-bold ${statusStyles[order.estadoPedido]}`}>
          {statusLabels[order.estadoPedido]}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded border border-line bg-white p-5">
            <h2 className="mb-4 text-lg font-extrabold">Productos</h2>
            <div className="space-y-4">
              {order.detalles.map((item) => (
                <div key={item.id} className="grid grid-cols-[48px_1fr_auto] gap-3 border-b border-line pb-4 last:border-b-0">
                  <ProductVisual product={item} size="sm" />
                  <div>
                    <p className="text-sm font-bold">{item.nombreProducto}</p>
                    <p className="text-xs text-neutral-500">Cantidad: {item.cantidad}</p>
                    <p className="text-xs text-neutral-500">Precio unitario: {formatMoney(item.precioUnitario)}</p>
                  </div>
                  <p className="text-sm font-bold">{formatMoney(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded border border-line bg-white p-5">
            <h2 className="mb-4 text-lg font-extrabold">Detalles de envío</h2>
            <div className="grid gap-4 text-sm">
              <div>
                <p className="font-semibold text-neutral-600">Método de envío</p>
                <p className="text-neutral-700">
                  {order.metodoEnvio === "ENVIO_DOMICILIO"
                    ? "Envío estándar (3-5 días hábiles)"
                    : order.metodoEnvio === "ENVIO_EXPRES"
                    ? "Envío express (24-48 horas)"
                    : "Retiro en sucursal"}
                </p>
              </div>
              {order.observaciones && (
                <div>
                  <p className="font-semibold text-neutral-600">Observaciones</p>
                  <p className="text-neutral-700">{order.observaciones}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="rounded border border-line bg-white p-5">
          <h2 className="mb-5 font-extrabold">Resumen del pedido</h2>
          <SummaryRows
            subtotal={subtotal}
            shipping={order.metodoEnvio === "RETIRO_TIENDA" ? 0 : 1500}
            discount={discount}
            total={order.total}
          />

          {order.codigoCupon && (
            <div className="mt-4 rounded bg-mint p-3 text-xs">
              <p className="font-semibold text-forest">Cupón aplicado: {order.codigoCupon}</p>
            </div>
          )}

          <Button className="mt-6 w-full" to="/pedidos">
            Volver a mis pedidos
          </Button>
        </aside>
      </div>
    </section>
  );
}
