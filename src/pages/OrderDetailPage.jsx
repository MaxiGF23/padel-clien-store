import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "@/features/orders/ordersSlice.js";
import { STATUS } from "@/utils/asyncStatus.js";
import { orderStatusLabel, orderStatusTone } from "@/features/orders/statusConfig.js";
import { formatDate, formatMoney } from "@/utils/formatters.js";
import { Button } from "@/components/Button.jsx";
import { ProductVisual } from "@/components/ProductVisual.jsx";
import { SummaryRows } from "@/components/SummaryRows.jsx";
import { Card } from "@/components/ui/Card.jsx";
import { Container } from "@/components/ui/Container.jsx";
import { EmptyState } from "@/components/ui/EmptyState.jsx";
import { StatusBadge } from "@/components/ui/StatusBadge.jsx";
import { Text } from "@/components/ui/Text.jsx";

export function OrderDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { items, status } = useSelector((s) => s.orders);

  // Al recargar la página directa (F5) el store arranca vacío: si todavía no se
  // cargaron los pedidos, los pedimos acá para no mostrar "no encontrado" de más.
  useEffect(() => {
    if (user?.id && status === STATUS.IDLE) dispatch(fetchOrders(user.id));
  }, [dispatch, user, status]);

  const order = items.find((o) => o.id === Number(id));

  if (!order) {
    const loading = status === STATUS.IDLE || status === STATUS.LOADING;
    return (
      <Container>
        <Card className="p-8">
          {loading ? (
            <EmptyState message="Cargando pedido..." />
          ) : (
            <EmptyState message="Pedido no encontrado" action={<Button to="/pedidos">Volver a mis pedidos</Button>} />
          )}
        </Card>
      </Container>
    );
  }

  const subtotal = order.detalles.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = order.descuentoAplicado || 0;
  // El pedido sólo persiste el total final, no el costo de envío. Lo derivamos del total
  // para que el resumen siempre cuadre (subtotal + envío − descuento = total), sin importar
  // el método elegido (estándar 1500, express 3200, retiro 0).
  const shipping = Math.max(0, order.total - subtotal + discount);

  return (
    <Container>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Text variant="title">Pedido #{order.id}</Text>
          <Text variant="subtitle" className="mt-1">
            Realizado el {formatDate(order.fechaPedido)}
          </Text>
        </div>
        <StatusBadge tone={orderStatusTone(order.estadoPedido)} size="md">
          {orderStatusLabel(order.estadoPedido)}
        </StatusBadge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
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
          </Card>

          <Card className="p-5">
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
          </Card>
        </div>

        <Card as="aside" className="p-5">
          <Text variant="section" className="mb-5">
            Resumen del pedido
          </Text>
          <SummaryRows subtotal={subtotal} shipping={shipping} discount={discount} total={order.total} />

          {order.codigoCupon && (
            <div className="mt-4 rounded bg-mint p-3 text-xs">
              <p className="font-semibold text-forest">Cupón aplicado: {order.codigoCupon}</p>
            </div>
          )}

          <Button className="mt-6 w-full" to="/pedidos">
            Volver a mis pedidos
          </Button>
        </Card>
      </div>
    </Container>
  );
}
