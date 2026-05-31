# Arquitectura del Frontend PadelStore

Este documento resume como esta armado el cliente React de PadelStore y como fluye la informacion entre pantallas, estado global y API.

## Stack principal

- **Vite + React**: base del frontend y servidor de desarrollo.
- **React Router**: define las rutas publicas, privadas y de administracion.
- **Redux Toolkit + React Redux**: maneja el estado global de la app.
- **Tailwind CSS**: estilos y layout.
- **Vitest**: tests unitarios.
- **ESLint**: linter para detectar errores comunes y mantener consistencia.

Importante: el proyecto **no usa Zustand**. Usa **Redux Toolkit**. Si alguien menciona "store de Zustand", en este codigo el equivalente conceptual es el `store` de Redux configurado en `src/app/store.js`.

## Estructura del proyecto

```text
src/
  app/store.js              Configuracion del store global de Redux
  components/               Componentes compartidos
  components/admin/         Layout y piezas reutilizables del admin
  data/mockData.js          Datos mock para trabajar sin backend
  features/                 Slices de Redux por dominio
  pages/                    Pantallas principales por ruta
  services/                 Capa de acceso a API/mock
  utils/                    Helpers de formato y normalizacion
```

## Que es un slice

Un **slice** es una porcion del estado global administrada por Redux Toolkit.

Cada slice suele definir:

- `initialState`: estado inicial de ese dominio.
- `reducers`: acciones sincronas que modifican ese estado.
- `createAsyncThunk`: acciones asincronas para llamar servicios/API.
- `extraReducers`: como cambia el estado cuando un thunk esta cargando, termina bien o falla.

Ejemplo conceptual:

```js
const initialState = { products: [], status: "idle", error: null };
```

En este proyecto hay slices para:

- `auth`: usuario logueado, token, login, registro y logout.
- `catalog`: productos, categorias y filtros del catalogo.
- `cart`: carrito y cantidades.
- `checkout`: datos y envio del checkout.
- `orders`: pedidos del usuario.
- `admin`: productos, categorias, cupones, pedidos y usuarios del panel admin.

El store une todos esos slices:

```js
export const store = configureStore({
  reducer: {
    admin,
    auth,
    cart,
    catalog,
    checkout,
    orders
  }
});
```

## Flujo de datos

El flujo general es:

1. Una pagina React renderiza datos con `useSelector`.
2. El usuario interactua con la UI.
3. La pagina ejecuta `dispatch(...)`.
4. Si la accion es asincrona, un thunk llama a un servicio en `src/services`.
5. El servicio decide si usar mocks o HTTP real.
6. El slice guarda el resultado en Redux.
7. React vuelve a renderizar con el nuevo estado.

Ejemplo:

```text
AdminProductsPage
  dispatch(saveProduct(...))
    -> adminSlice thunk
      -> adminService.createProduct/updateProduct
        -> mockData o request("/productos")
      -> adminSlice actualiza state.admin.products
  React re-renderiza la tabla
```

## Capa de servicios

Los servicios son la frontera entre UI y backend. La UI no llama `fetch` directamente.

- `apiClient.js` arma la URL base, agrega `Authorization: Bearer <token>` si existe, y procesa errores HTTP.
- `catalogService.js`, `ordersService.js`, `checkoutService.js`, `authService.js` y `adminService.js` exponen funciones del dominio.
- `VITE_USE_MOCKS=false` hace que los servicios llamen al backend Java.
- En modo mock, los servicios usan `src/data/mockData.js`.

Variables utiles:

```bash
VITE_USE_MOCKS=true
VITE_API_BASE_URL=http://localhost:4040/api
```

## Rutas y permisos

Las rutas estan en `src/App.jsx`.

Rutas storefront:

- `/`
- `/productos/:id`
- `/carrito`
- `/checkout`
- `/login`
- `/registro`
- `/pedidos`

Rutas admin:

- `/admin`
- `/admin/productos`
- `/admin/categorias`
- `/admin/cupones`
- `/admin/pedidos`
- `/admin/usuarios`

Protecciones:

- `RequireAuth` exige que exista un usuario logueado.
- `RequireAdmin` exige usuario logueado y `user.rol === "ADMIN"`.

## Panel admin

El admin usa:

- `AdminLayout`: sidebar, topbar, footer y contenedor full-width.
- `AdminPrimitives`: botones, tablas, badges, campos y modales.
- `AdminPages.jsx`: pantallas de dashboard y CRUD.
- `adminSlice`: estado global del panel.
- `adminService`: contratos con el backend Java.

Contratos principales:

- Productos: `GET/POST/PUT/DELETE /api/productos`
- Categorias: `GET/POST/PUT/DELETE /api/categorias`
- Cupones: `GET/POST/DELETE /api/cupones`
- Pedidos: `GET /api/pedidos`, `PATCH /api/pedidos/:id/estado`, `DELETE /api/pedidos/:id`
- Usuarios: `GET/POST/PUT/DELETE /api/usuarios`, `PATCH /api/usuarios/:id/rol`

## Como correr el proyecto

Modo mock:

```bash
pnpm dev
```

Modo backend real:

```bash
VITE_USE_MOCKS=false VITE_API_BASE_URL=http://localhost:4040/api pnpm dev
```

Checks:

```bash
pnpm lint
pnpm test
pnpm build
```

## Backend esperado

El frontend espera el backend Spring Boot en:

```text
http://localhost:4040/api
```

Usuarios seed:

```text
admin@example.com / password
messi@example.com / barcelona
```

## Convenciones para seguir trabajando

- Mantener las llamadas HTTP dentro de `src/services`.
- Agregar estado global en un slice solo si varias pantallas lo necesitan.
- Para estado local de formularios o modales, usar `useState` dentro de la pagina.
- Mantener los DTOs con nombres similares al backend: `nombreProducto`, `idCategoria`, `estadoPedido`, etc.
- Antes de entregar cambios, correr `pnpm lint`, `pnpm test` y `pnpm build`.
