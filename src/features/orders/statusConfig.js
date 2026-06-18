// Single source of truth for order-status presentation: the badge `tone` and the
// customer-facing `label`. Replaces the per-page status→color/label maps that had drifted
// out of sync (e.g. CONFIRMADO was blue in one screen and green in another).
export const ORDER_STATUS = {
  PENDIENTE: { tone: "warning", label: "Pendiente" },
  CONFIRMADO: { tone: "info", label: "Confirmado" },
  EN_PROCESO: { tone: "info", label: "En proceso" },
  EN_CAMINO: { tone: "warning", label: "En camino" },
  ENVIADO: { tone: "info", label: "Enviado" },
  ENTREGADO: { tone: "success", label: "Entregado" },
  CANCELADO: { tone: "danger", label: "Cancelado" }
};

export const orderStatusTone = (code) => ORDER_STATUS[code]?.tone || "neutral";
export const orderStatusLabel = (code) => ORDER_STATUS[code]?.label || code;
