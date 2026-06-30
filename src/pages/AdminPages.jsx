import { Edit, Eye, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AdminButton, AdminModal, AdminTable, Field, StatusBadge } from "@/components/admin/AdminPrimitives.jsx";
import { inputClass } from "@/components/ui/Input.jsx";
import {
  cancelOrder,
  changeOrderStatus,
  changeUserRole,
  removeCategory,
  removeCoupon,
  removeProduct,
  removeUser,
  saveCategory,
  saveCoupon,
  saveProduct,
  saveUser,
  fetchAdminData
} from "@/features/admin/adminSlice.js";
import { formatDate, formatMoney } from "@/utils/formatters.js";
import { emailError, phoneError, EMAIL_PATTERN, PHONE_PATTERN } from "@/utils/validators.js";
import { showToast } from "@/features/ui/toastSlice.js";
import { STATUS } from "@/utils/asyncStatus.js";
import { orderStatusTone } from "@/features/orders/statusConfig.js";
import { Alert } from "@/components/ui/Alert.jsx";
import { Card } from "@/components/ui/Card.jsx";

const orderStatuses = ["PENDIENTE", "CONFIRMADO", "EN_PROCESO", "ENVIADO", "ENTREGADO", "CANCELADO"];
const roleOptions = ["USER", "ADMIN"];

// Despacha una accion del admin, muestra un toast segun el resultado y, si fue exitosa,
// ejecuta el callback (cerrar modal, etc.) y refresca los datos. Centraliza el feedback
// para que cada submit/accion del panel notifique al usuario.
async function withToast(dispatch, action, successMessage, onSuccess) {
  const result = await dispatch(action);
  if (result.meta.requestStatus === "fulfilled") {
    dispatch(showToast({ type: "success", message: successMessage }));
    onSuccess?.();
    dispatch(fetchAdminData());
  } else {
    dispatch(showToast({ type: "error", message: result.error?.message || "No se pudo completar la operacion" }));
  }
  return result;
}

export function AdminDashboardPage() {
  const { products, orders, users } = useSelector((state) => state.admin);
  const todayKey = new Date().toDateString();
  const todayOrders = orders.filter((order) => new Date(order.fechaPedido).toDateString() === todayKey);
  const metrics = [
    { label: "Pedidos Hoy", value: todayOrders.length, hint: "actividad del dia" },
    {
      label: "Ingresos Hoy",
      value: formatMoney(todayOrders.reduce((sum, order) => sum + Number(order.total || 0), 0)),
      hint: "ventas confirmadas"
    },
    {
      label: "Stock Bajo",
      value: products.filter((product) => Number(product.stock) <= 10).length,
      hint: "productos criticos"
    },
    { label: "Usuarios Activos", value: users.length, hint: "cuentas habilitadas" }
  ];

  return (
    <AdminPage title="Dashboard">
      <div className="grid gap-5 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card as="article" key={metric.label} className="p-5">
            <p className="text-[11px] font-extrabold uppercase text-neutral-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-extrabold">{metric.value}</p>
            <p className="mt-1 text-xs font-semibold text-emerald-700">{metric.hint}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <OrdersTable orders={orders.slice(0, 5)} compact />
      </div>
    </AdminPage>
  );
}

export function AdminProductsPage() {
  const dispatch = useDispatch();
  const { products, categories, saving } = useSelector((state) => state.admin);
  const [editing, setEditing] = useState(null);

  return (
    <AdminPage
      title="Productos"
      action={
        <AdminButton onClick={() => setEditing({})}>
          <Plus size={13} /> Crear Producto
        </AdminButton>
      }
    >
      <AdminTable title="Lista de Productos">
        <table className="min-w-[760px] w-full text-left text-xs">
          <thead className="bg-paper text-[10px] uppercase text-neutral-500">
            <tr>
              <Th>Nombre</Th>
              <Th>Categoria</Th>
              <Th>Precio</Th>
              <Th>Stock</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-line">
                <Td>
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded border border-line bg-cloud">
                      {product.imagenUrl ? (
                        <img src={product.imagenUrl} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-base" aria-hidden="true">
                          {product.visual || "🏓"}
                        </span>
                      )}
                    </span>
                    {product.nombreProducto}
                  </div>
                </Td>
                <Td>{product.nombreCategoria}</Td>
                <Td>{formatMoney(product.precio)}</Td>
                <Td>{product.stock}</Td>
                <Td>
                  <StatusBadge tone={Number(product.stock) <= 10 ? "warning" : "success"}>
                    {Number(product.stock) <= 10 ? "Stock Bajo" : "Activo"}
                  </StatusBadge>
                </Td>
                <Td>
                  <RowActions onEdit={() => setEditing(product)} onDelete={() => withToast(dispatch, removeProduct(product.id), "Producto eliminado")} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTable>
      {editing && (
        <ProductForm
          product={editing}
          categories={categories}
          saving={saving}
          onClose={() => setEditing(null)}
          onSubmit={(payload) =>
            withToast(
              dispatch,
              saveProduct({ id: editing.id, payload }),
              editing.id ? "Producto actualizado" : "Producto creado",
              () => setEditing(null)
            )
          }
        />
      )}
    </AdminPage>
  );
}

export function AdminCategoriesPage() {
  const dispatch = useDispatch();
  const { categories, products, saving } = useSelector((state) => state.admin);
  const [editing, setEditing] = useState(null);
  const productCounts = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => [
          category.id,
          products.filter((product) => product.idCategoria === category.id).length
        ])
      ),
    [categories, products]
  );

  return (
    <AdminPage
      title="Categorias"
      action={
        <AdminButton onClick={() => setEditing({})}>
          <Plus size={13} /> Crear Categoria
        </AdminButton>
      }
    >
      <AdminTable title="Lista de Categorias">
        <table className="min-w-[720px] w-full text-left text-xs">
          <thead className="bg-paper text-[10px] uppercase text-neutral-500">
            <tr>
              <Th>Nombre</Th>
              <Th>Descripcion</Th>
              <Th>Productos</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-line">
                <Td>{category.nombreCategoria}</Td>
                <Td>{category.descripcion}</Td>
                <Td>{productCounts[category.id] || 0}</Td>
                <Td>
                  <StatusBadge tone="success">Activo</StatusBadge>
                </Td>
                <Td>
                  <RowActions
                    onEdit={() => setEditing(category)}
                    onDelete={() => withToast(dispatch, removeCategory(category.id), "Categoria eliminada")}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTable>
      {editing && (
        <CategoryForm
          category={editing}
          saving={saving}
          onClose={() => setEditing(null)}
          onSubmit={(payload) =>
            withToast(
              dispatch,
              saveCategory({ id: editing.id, payload }),
              editing.id ? "Categoria actualizada" : "Categoria creada",
              () => setEditing(null)
            )
          }
        />
      )}
    </AdminPage>
  );
}

export function AdminCouponsPage() {
  const dispatch = useDispatch();
  const { coupons, saving } = useSelector((state) => state.admin);
  const [creating, setCreating] = useState(false);

  return (
    <AdminPage
      title="Cupones"
      action={
        <AdminButton onClick={() => setCreating(true)}>
          <Plus size={13} /> Crear Cupon
        </AdminButton>
      }
    >
      <AdminTable title="Lista de Cupones">
        <table className="min-w-[760px] w-full text-left text-xs">
          <thead className="bg-paper text-[10px] uppercase text-neutral-500">
            <tr>
              <Th>Codigo</Th>
              <Th>Tipo</Th>
              <Th>Valor</Th>
              <Th>Usos</Th>
              <Th>Vencimiento</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => {
              const expired = coupon.fechaVencimiento && new Date(coupon.fechaVencimiento) < new Date();
              return (
                <tr key={coupon.id} className="border-t border-line">
                  <Td>{coupon.codigo}</Td>
                  <Td>{coupon.tipoDescuento}</Td>
                  <Td>
                    {coupon.tipoDescuento === "PORCENTAJE" ? `${coupon.descuento}%` : formatMoney(coupon.descuento)}
                  </Td>
                  <Td>
                    {coupon.usosActuales || 0}/{coupon.usosMaximos || "-"}
                  </Td>
                  <Td>{coupon.fechaVencimiento ? formatDate(coupon.fechaVencimiento) : "-"}</Td>
                  <Td>
                    <StatusBadge tone={expired ? "warning" : "success"}>{expired ? "Vencido" : "Activo"}</StatusBadge>
                  </Td>
                  <Td>
                    <AdminButton variant="danger" onClick={() => withToast(dispatch, removeCoupon(coupon.id), "Cupon eliminado")}>
                      <Trash2 size={13} /> Eliminar
                    </AdminButton>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </AdminTable>
      {creating && (
        <CouponForm
          saving={saving}
          onClose={() => setCreating(false)}
          onSubmit={(payload) => withToast(dispatch, saveCoupon(payload), "Cupon creado", () => setCreating(false))}
        />
      )}
    </AdminPage>
  );
}

export function AdminOrdersPage() {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.admin);
  const [viewing, setViewing] = useState(null);

  return (
    <AdminPage title="Pedidos">
      <OrdersTable
        orders={orders}
        onView={setViewing}
        onStatus={(id, estadoPedido) => withToast(dispatch, changeOrderStatus({ id, estadoPedido }), "Estado del pedido actualizado")}
        onCancel={(id) => withToast(dispatch, cancelOrder(id), "Pedido cancelado")}
      />
      {viewing && <OrderDetail order={viewing} onClose={() => setViewing(null)} />}
    </AdminPage>
  );
}

export function AdminUsersPage() {
  const dispatch = useDispatch();
  const { users, saving } = useSelector((state) => state.admin);
  const [editing, setEditing] = useState(null);

  return (
    <AdminPage
      title="Usuarios"
      action={
        <AdminButton onClick={() => setEditing({})}>
          <Plus size={13} /> Crear Usuario
        </AdminButton>
      }
    >
      <AdminTable title="Lista de Usuarios">
        <table className="min-w-[840px] w-full text-left text-xs">
          <thead className="bg-paper text-[10px] uppercase text-neutral-500">
            <tr>
              <Th>Nombre</Th>
              <Th>Email</Th>
              <Th>Telefono</Th>
              <Th>Rol</Th>
              <Th>Registro</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-line">
                <Td>
                  {user.nombre} {user.apellido}
                </Td>
                <Td>{user.email}</Td>
                <Td>{user.telefono}</Td>
                <Td>
                  <select
                    className="focus-ring h-8 rounded border border-line bg-white px-2 text-xs"
                    value={user.rol}
                    onChange={(event) => withToast(dispatch, changeUserRole({ id: user.id, rol: event.target.value }), "Rol actualizado")}
                  >
                    {roleOptions.map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </select>
                </Td>
                <Td>{formatDate(user.createdAt)}</Td>
                <Td>
                  <RowActions onEdit={() => setEditing(user)} onDelete={() => withToast(dispatch, removeUser(user.id), "Usuario eliminado")} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTable>
      {editing && (
        <UserForm
          user={editing}
          saving={saving}
          onClose={() => setEditing(null)}
          onSubmit={(payload) =>
            withToast(
              dispatch,
              saveUser({ id: editing.id, payload }),
              editing.id ? "Usuario actualizado" : "Usuario creado",
              () => setEditing(null)
            )
          }
        />
      )}
    </AdminPage>
  );
}

function AdminPage({ title, action, children }) {
  const { status, error } = useSelector((state) => state.admin);
  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-extrabold">{title}</h1>
        {action}
      </div>
      {status === STATUS.LOADING && (
        <Alert tone="neutral" size="md">
          Cargando datos...
        </Alert>
      )}
      {error && (
        <Alert tone="error" size="md" className="mb-4">
          {error}
        </Alert>
      )}
      {children}
    </section>
  );
}

function OrdersTable({ orders, compact = false, onView, onStatus, onCancel }) {
  return (
    <AdminTable title={compact ? "Ultimos Pedidos" : "Lista de Pedidos"}>
      <table className="min-w-[760px] w-full text-left text-xs">
        <thead className="bg-paper text-[10px] uppercase text-neutral-500">
          <tr>
            <Th>ID</Th>
            <Th>Cliente</Th>
            <Th>Monto</Th>
            <Th>Estado</Th>
            <Th>Fecha</Th>
            <Th>Acciones</Th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-line">
              <Td>#{order.id}</Td>
              <Td>Usuario #{order.idUsuario}</Td>
              <Td>{formatMoney(order.total)}</Td>
              <Td>
                {onStatus ? (
                  <select
                    className="focus-ring h-8 rounded border border-line bg-white px-2 text-xs"
                    value={order.estadoPedido}
                    onChange={(event) => onStatus(order.id, event.target.value)}
                  >
                    {orderStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge tone={orderStatusTone(order.estadoPedido)}>{order.estadoPedido}</StatusBadge>
                )}
              </Td>
              <Td>{formatDate(order.fechaPedido)}</Td>
              <Td>
                <div className="flex gap-2">
                  {onView && (
                    <AdminButton onClick={() => onView(order)}>
                      <Eye size={13} /> Ver
                    </AdminButton>
                  )}
                  {onCancel && order.estadoPedido !== "CANCELADO" && (
                    <AdminButton variant="danger" onClick={() => onCancel(order.id)}>
                      Cancelar
                    </AdminButton>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTable>
  );
}

function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex gap-2">
      <AdminButton onClick={onEdit}>
        <Edit size={13} /> Editar
      </AdminButton>
      <AdminButton variant="danger" onClick={onDelete}>
        <Trash2 size={13} /> Eliminar
      </AdminButton>
    </div>
  );
}

// Carga de imagen del producto. Lee el archivo como data URL (sin backend de storage),
// lo guarda en el form y muestra una vista previa. Valida tipo y tamaño.
function ImageUploadField({ previewUrl, onSelect, onClear }) {
  const [error, setError] = useState("");
  function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen no debe superar los 2 MB");
      return;
    }
    setError("");
    // Guardamos el File (para subirlo al backend) y una data URL para la vista previa.
    const reader = new FileReader();
    reader.onload = () => onSelect(file, reader.result);
    reader.readAsDataURL(file);
  }
  return (
    <Field label="Imagen del producto" className="sm:col-span-2" error={error}>
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded border border-line bg-cloud">
          {previewUrl ? (
            <img src={previewUrl} alt="Vista previa" className="h-full w-full object-contain" />
          ) : (
            <span className="text-2xl" aria-hidden="true">
              🏓
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="text-xs text-neutral-500 file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-forest file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
          />
          {previewUrl && (
            <button type="button" onClick={onClear} className="text-left text-xs font-semibold text-red-600">
              Quitar imagen
            </button>
          )}
        </div>
      </div>
    </Field>
  );
}

function ProductForm({ product, categories, saving, onClose, onSubmit }) {
  const [form, setForm] = useState({
    nombreProducto: product.nombreProducto || "",
    descripcion: product.descripcion || "",
    marca: product.marca || "",
    precio: product.precio || "",
    stock: product.stock || 0,
    idCategoria: product.idCategoria || categories[0]?.id || "",
    imagenUrl: product.imagenUrl || "", // vista previa (data URL)
    imagenFile: null, // archivo nuevo a subir (si el usuario elige uno)
    imagenRemoved: false // marca que se quitó una imagen existente
  });
  return (
    <AdminModal title={product.id ? "Editar Producto" : "Crear Producto"} onClose={onClose}>
      <FormGrid
        onSubmit={() =>
          onSubmit({
            ...form,
            precio: Number(form.precio),
            stock: Number(form.stock),
            idCategoria: Number(form.idCategoria)
          })
        }
        saving={saving}
      >
        {input("Nombre", "nombreProducto", form, setForm)}
        {input("Marca", "marca", form, setForm)}
        {input("Precio", "precio", form, setForm, "number")}
        {input("Stock", "stock", form, setForm, "number")}
        <ImageUploadField
          previewUrl={form.imagenUrl}
          onSelect={(imagenFile, imagenUrl) => setForm({ ...form, imagenFile, imagenUrl, imagenRemoved: false })}
          onClear={() => setForm({ ...form, imagenFile: null, imagenUrl: "", imagenRemoved: true })}
        />
        <Field label="Categoria">
          <select
            className={inputClass}
            value={form.idCategoria}
            onChange={(event) => setForm({ ...form, idCategoria: event.target.value })}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nombreCategoria}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Descripcion">
          <textarea
            className={`${inputClass} h-24 py-2`}
            value={form.descripcion}
            onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
          />
        </Field>
      </FormGrid>
    </AdminModal>
  );
}

function CategoryForm({ category, saving, onClose, onSubmit }) {
  const [form, setForm] = useState({
    nombreCategoria: category.nombreCategoria || "",
    descripcion: category.descripcion || ""
  });
  return (
    <AdminModal title={category.id ? "Editar Categoria" : "Crear Categoria"} onClose={onClose}>
      <FormGrid onSubmit={() => onSubmit(form)} saving={saving}>
        {input("Nombre", "nombreCategoria", form, setForm)}
        {input("Descripcion", "descripcion", form, setForm)}
      </FormGrid>
    </AdminModal>
  );
}

function CouponForm({ saving, onClose, onSubmit }) {
  const [form, setForm] = useState({
    codigo: "",
    descuento: "",
    tipoDescuento: "PORCENTAJE",
    fechaVencimiento: "",
    usosMaximos: ""
  });
  const payload = {
    ...form,
    descuento: Number(form.descuento),
    fechaVencimiento: form.fechaVencimiento || null,
    usosMaximos: form.usosMaximos ? Number(form.usosMaximos) : null
  };
  return (
    <AdminModal title="Crear Cupon" onClose={onClose}>
      <FormGrid onSubmit={() => onSubmit(payload)} saving={saving}>
        {input("Codigo", "codigo", form, setForm)}
        {input("Descuento", "descuento", form, setForm, "number")}
        <Field label="Tipo">
          <select
            className={inputClass}
            value={form.tipoDescuento}
            onChange={(event) => setForm({ ...form, tipoDescuento: event.target.value })}
          >
            <option value="PORCENTAJE">PORCENTAJE</option>
            <option value="MONTO_FIJO">MONTO_FIJO</option>
          </select>
        </Field>
        {input("Vencimiento", "fechaVencimiento", form, setForm, "date")}
        {input("Usos Maximos", "usosMaximos", form, setForm, "number")}
      </FormGrid>
    </AdminModal>
  );
}

function UserForm({ user, saving, onClose, onSubmit }) {
  const [form, setForm] = useState({
    username: user.username || "",
    email: user.email || "",
    password: "",
    nombre: user.nombre || "",
    apellido: user.apellido || "",
    telefono: user.telefono || ""
  });
  const [errors, setErrors] = useState({});
  const payload =
    user.id && !form.password ? Object.fromEntries(Object.entries(form).filter(([key]) => key !== "password")) : form;

  function handleSubmit() {
    const fieldErrors = {
      email: emailError(form.email),
      telefono: phoneError(form.telefono)
    };
    const activeErrors = Object.fromEntries(Object.entries(fieldErrors).filter(([, message]) => message));
    setErrors(activeErrors);
    if (Object.keys(activeErrors).length > 0) return;
    onSubmit(payload);
  }

  return (
    <AdminModal title={user.id ? "Editar Usuario" : "Crear Usuario"} onClose={onClose}>
      <FormGrid onSubmit={handleSubmit} saving={saving}>
        {input("Usuario", "username", form, setForm)}
        {input("Email", "email", form, setForm, "email", errors.email, EMAIL_PATTERN)}
        {input("Nombre", "nombre", form, setForm)}
        {input("Apellido", "apellido", form, setForm)}
        {input("Telefono", "telefono", form, setForm, "text", errors.telefono, PHONE_PATTERN)}
        {input(user.id ? "Nueva Contrasena" : "Contrasena", "password", form, setForm, "password")}
      </FormGrid>
    </AdminModal>
  );
}

function OrderDetail({ order, onClose }) {
  return (
    <AdminModal title={`Pedido #${order.id}`} onClose={onClose}>
      <div className="space-y-3 text-sm">
        <p>
          <strong>Metodo:</strong> {order.metodoEnvio}
        </p>
        <p>
          <strong>Total:</strong> {formatMoney(order.total)}
        </p>
        <p>
          <strong>Cupon:</strong> {order.codigoCupon || "-"}
        </p>
        <div className="rounded border border-line">
          <table className="w-full text-left text-xs">
            <thead className="bg-paper">
              <tr>
                <Th>Producto</Th>
                <Th>Cantidad</Th>
                <Th>Subtotal</Th>
              </tr>
            </thead>
            <tbody>
              {order.detalles?.map((item) => (
                <tr key={item.id} className="border-t border-line">
                  <Td>{item.nombreProducto}</Td>
                  <Td>{item.cantidad}</Td>
                  <Td>{formatMoney(item.subtotal)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminModal>
  );
}

function FormGrid({ children, saving, onSubmit }) {
  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {children}
      <div className="flex justify-end gap-2 sm:col-span-2">
        <AdminButton type="submit" className="h-10" disabled={saving === "loading"}>
          {saving === "loading" ? "Guardando..." : "Guardar"}
        </AdminButton>
      </div>
    </form>
  );
}

function input(label, key, form, setForm, type = "text", error, pattern) {
  return (
    <Field
      label={label}
      error={error}
      required
      type={type}
      pattern={pattern}
      value={form[key]}
      onChange={(event) => setForm({ ...form, [key]: event.target.value })}
    />
  );
}

function Th({ children }) {
  return <th className="px-4 py-3 font-extrabold">{children}</th>;
}

function Td({ children }) {
  return <td className="px-4 py-3 align-middle font-medium">{children}</td>;
}
