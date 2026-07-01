import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "@/features/orders/ordersSlice.js";
import { orderStatusLabel, orderStatusTone } from "@/features/orders/statusConfig.js";
import { formatDate, formatMoney } from "@/utils/formatters.js";
import { Button } from "@/components/Button.jsx";
import { AsyncSection } from "@/components/ui/AsyncSection.jsx";
import { Card } from "@/components/ui/Card.jsx";
import { Container } from "@/components/ui/Container.jsx";
import { EmptyState } from "@/components/ui/EmptyState.jsx";
import { StatusBadge } from "@/components/ui/StatusBadge.jsx";
import { Text } from "@/components/ui/Text.jsx";
export function OrdersPage() {
  const dispatch = useDispatch(),
    user = useSelector((s) => s.auth.user),
    { items, status, error } = useSelector((s) => s.orders);
  useEffect(() => {
    if (user?.id) dispatch(fetchOrders(user.id));
  }, [dispatch, user]);
  // Mostramos el pedido más reciente primero (por fecha; con el id como desempate).
  const sortedItems = [...items].sort(
    (a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido) || b.id - a.id
  );
  return (
    <Container>
      <Text variant="title">Mis pedidos</Text>
      <Text variant="subtitle" className="mt-1">
        Historial de compras y estado de envios
      </Text>
      <div className="mt-6">
        <AsyncSection status={status} error={error} loadingMessage="Cargando tus pedidos...">
          <div className="space-y-4">
            {sortedItems.map((order) => (
              <Card as="article" key={order.id} className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h2 className="font-extrabold">Pedido #{order.id}</h2>
                    <StatusBadge tone={orderStatusTone(order.estadoPedido)}>
                      {orderStatusLabel(order.estadoPedido)}
                    </StatusBadge>
                  </div>
                  <p className="text-sm font-semibold text-neutral-700">
                    {order.detalles.map((i) => i.nombreProducto).join(" + ")}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">Realizado el {formatDate(order.fechaPedido)}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xl font-extrabold text-forest">{formatMoney(order.total)}</p>
                  <Button to={`/pedidos/${order.id}`} variant="secondary" size="sm" className="mt-3">
                    Ver detalle
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          {items.length === 0 && (
            <Card className="mt-4 p-8">
              <EmptyState message="Todavia no tenes pedidos." action={<Button to="/">Comprar ahora</Button>} />
            </Card>
          )}
        </AsyncSection>
      </div>
    </Container>
  );
}
