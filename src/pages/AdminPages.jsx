import { Edit, Eye, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AdminButton,
  AdminModal,
  AdminTable,
  Field,
  StatusBadge,
  inputClass
} from "@/components/admin/AdminPrimitives.jsx";
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
  saveUser
} from "@/features/admin/adminSlice.js";
import { formatDate, formatMoney } from "@/utils/formatters.js";

const orderStatuses = ["PENDIENTE", "CONFIRMADO", "EN_PROCESO", "ENVIADO", "ENTREGADO", "CANCELADO"];
const roleOptions = ["USER", "ADMIN"];

const statusTone = {
  ACTIVO: "success",
  BAJO: "warning",
  VENCIDO: "warning",
  PENDIENTE: "warning",
  CONFIRMADO: "success",
  EN_PROCESO: "info",
  ENVIADO: "info",
  ENTREGADO: "success",
  CANCELADO: "danger",
  USER: "neutral",
  ADMIN: "info"
};

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
          <article key={metric.label} className="rounded border border-line bg-white p-5">
            <p className="text-[11px] font-extrabold uppercase text-neutral-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-extrabold">{metric.value}</p>
            <p className="mt-1 text-xs font-semibold text-emerald-700">{metric.hint}</p>
          </article>
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
                <Td>{product.nombreProducto}</Td>
                <Td>{product.nombreCategoria}</Td>
                <Td>{formatMoney(product.precio)}</Td>
                <Td>{product.stock}</Td>
                <Td>
                  <StatusBadge tone={Number(product.stock) <= 10 ? "warning" : "success"}>
                    {Number(product.stock) <= 10 ? "Stock Bajo" : "Activo"}
                  </StatusBadge>
                </Td>
                <Td>
                  <RowActions onEdit={() => setEditing(product)} onDelete={() => dispatch(removeProduct(product.id))} />
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
          onSubmit={(payload) => dispatch(saveProduct({ id: editing.id, payload })).then(() => setEditing(null))}
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
                    onDelete={() => dispatch(removeCategory(category.id))}
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
          onSubmit={(payload) => dispatch(saveCategory({ id: editing.id, payload })).then(() => setEditing(null))}
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
                    <AdminButton variant="danger" onClick={() => dispatch(removeCoupon(coupon.id))}>
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
          onSubmit={(payload) => dispatch(saveCoupon(payload)).then(() => setCreating(false))}
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
        onStatus={(id, estadoPedido) => dispatch(changeOrderStatus({ id, estadoPedido }))}
        onCancel={(id) => dispatch(cancelOrder(id))}
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
                    onChange={(event) => dispatch(changeUserRole({ id: user.id, rol: event.target.value }))}
                  >
                    {roleOptions.map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </select>
                </Td>
                <Td>{formatDate(user.createdAt)}</Td>
                <Td>
                  <RowActions onEdit={() => setEditing(user)} onDelete={() => dispatch(removeUser(user.id))} />
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
          onSubmit={(payload) => dispatch(saveUser({ id: editing.id, payload })).then(() => setEditing(null))}
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
      {status === "loading" && (
        <p className="rounded border border-line bg-white px-4 py-3 text-sm font-semibold">Cargando datos...</p>
      )}
      {error && <p className="mb-4 rounded bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
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
                  <StatusBadge tone={statusTone[order.estadoPedido]}>{order.estadoPedido}</StatusBadge>
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

function ProductForm({ product, categories, saving, onClose, onSubmit }) {
  const [form, setForm] = useState({
    nombreProducto: product.nombreProducto || "",
    descripcion: product.descripcion || "",
    marca: product.marca || "",
    precio: product.precio || "",
    stock: product.stock || 0,
    idCategoria: product.idCategoria || categories[0]?.id || ""
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
  const payload =
    user.id && !form.password ? Object.fromEntries(Object.entries(form).filter(([key]) => key !== "password")) : form;
  return (
    <AdminModal title={user.id ? "Editar Usuario" : "Crear Usuario"} onClose={onClose}>
      <FormGrid onSubmit={() => onSubmit(payload)} saving={saving}>
        {input("Usuario", "username", form, setForm)}
        {input("Email", "email", form, setForm, "email")}
        {input("Nombre", "nombre", form, setForm)}
        {input("Apellido", "apellido", form, setForm)}
        {input("Telefono", "telefono", form, setForm)}
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

function input(label, key, form, setForm, type = "text") {
  return (
    <Field label={label}>
      <input
        className={inputClass}
        required
        type={type}
        value={form[key]}
        onChange={(event) => setForm({ ...form, [key]: event.target.value })}
      />
    </Field>
  );
}

function Th({ children }) {
  return <th className="px-4 py-3 font-extrabold">{children}</th>;
}

function Td({ children }) {
  return <td className="px-4 py-3 align-middle font-medium">{children}</td>;
}
