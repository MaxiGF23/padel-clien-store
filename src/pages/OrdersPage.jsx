import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "@/features/orders/ordersSlice.js";
import { formatDate, formatMoney } from "@/utils/formatters.js";
import { Button } from "@/components/Button.jsx";
const statusStyles = { EN_CAMINO: "bg-amber-100 text-amber-800", ENTREGADO: "bg-emerald-100 text-emerald-800", CANCELADO: "bg-red-100 text-red-700" };
const statusLabels = { EN_CAMINO: "En camino", ENTREGADO: "Entregado", CANCELADO: "Cancelado" };
export function OrdersPage() {
  const dispatch = useDispatch(), user = useSelector((s) => s.auth.user), { items } = useSelector((s) => s.orders);
  useEffect(() => { if (user?.id) dispatch(fetchOrders(user.id)); }, [dispatch, user]);
  return <section className="mx-auto max-w-6xl px-4 py-8 md:px-6"><h1 className="text-3xl font-extrabold">Mis pedidos</h1><p className="mt-1 text-sm text-neutral-500">Historial de compras y estado de envios</p><div className="mt-6 space-y-4">{items.map((order) => <article key={order.id} className="grid gap-4 rounded border border-line bg-white p-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="mb-2 flex flex-wrap items-center gap-2"><h2 className="font-extrabold">Pedido #{order.id}</h2><span className={`rounded px-2 py-1 text-xs font-bold ${statusStyles[order.estadoPedido]}`}>{statusLabels[order.estadoPedido]}</span></div><p className="text-sm font-semibold text-neutral-700">{order.detalles.map((i) => i.nombreProducto).join(" + ")}</p><p className="mt-1 text-xs text-neutral-500">Realizado el {formatDate(order.fechaPedido)}</p></div><div className="text-left sm:text-right"><p className="text-xl font-extrabold text-forest">{formatMoney(order.total)}</p><Button variant="secondary" className="mt-3 h-8 text-xs">Ver detalle</Button></div></article>)}</div>{items.length === 0 && <div className="mt-10 rounded border border-line bg-white p-8 text-center"><p className="mb-4 text-sm text-neutral-500">Todavia no tenes pedidos.</p><Button to="/">Comprar ahora</Button></div>}</section>;
}
