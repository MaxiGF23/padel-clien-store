# PadelStore — Frontend

E-commerce de productos de pádel desarrollado para Aplicaciones Interactivas (UADE), 1.º Cuatrimestre 2026, Grupo 7.

Este repositorio es el **frontend**, hecho con React + Vite. Consume una API REST (Spring Boot) haciendo peticiones asincrónicas con `fetch()` dentro de `useEffect()`. Los datos llegan en formato JSON y se renderizan en pantalla, con estados de carga y un mensaje de error cuando el backend no está disponible.

El backend vive en un repositorio aparte (`TPO-G7/PadelStore`). Sus instrucciones de ejecución están en el README de esa carpeta; este README cubre el frontend.

---

## Orden de ejecución (prioridad)

El orden de arranque importa. El frontend es el último paso: se levanta después de que el backend esté funcionando.

| Prioridad | Componente | Dónde | Comando |
|-----------|------------|-------|---------|
| 1.º | MySQL | `localhost:3306` (base `padelstore`) | iniciar el servicio de MySQL |
| 2.º | Backend (Spring Boot) | `http://localhost:4040` | `.\mvnw.cmd spring-boot:run` (ver README del backend) |
| 3.º | Frontend (este repo) | `http://localhost:5173` | `npm run dev` |

Si levantás el frontend sin el backend, vas a ver un mensaje de error de conexión: es el comportamiento esperado. Para la demo completa, levantá primero el backend.

---

## Índice

1. [Tecnologías](#tecnologías)
2. [Arquitectura de la integración](#arquitectura-de-la-integración)
3. [Endpoints principales de la API](#endpoints-principales-de-la-api)
4. [Requisitos previos](#requisitos-previos)
5. [Estructura del proyecto](#estructura-del-proyecto)
6. [Cómo ejecutar el frontend](#cómo-ejecutar-el-frontend)
7. [Usuarios de prueba](#usuarios-de-prueba)
8. [Qué probar](#qué-probar)
9. [Variables de entorno](#variables-de-entorno)
10. [Scripts útiles](#scripts-útiles)
11. [Solución de problemas](#solución-de-problemas)

---

## Tecnologías

### Frontend (este repositorio)

| Tecnología | Uso |
|---|---|
| React 18 | Librería de UI (componentes, hooks `useState` / `useEffect`) |
| Vite 6 | Bundler y servidor de desarrollo |
| Redux Toolkit | Manejo de estado global (carrito, auth, catálogo, pedidos) |
| React Router 6 | Ruteo de páginas (`App.jsx`) |
| Tailwind CSS | Estilos |
| Vitest | Tests unitarios |
| ESLint + Prettier | Linter y formateo |
| lucide-react | Íconos |

### Backend (repositorio aparte, `TPO-G7/PadelStore`)

| Tecnología | Uso |
|---|---|
| Spring Boot 4.0.3 | Framework del servidor REST |
| Java 25 | Lenguaje |
| Spring Web MVC | Controllers / endpoints REST |
| Spring Data JPA (Hibernate) | Capa de persistencia |
| MySQL | Base de datos (con opción a H2 en memoria) |
| Spring Security + JWT (jjwt) | Autenticación con tokens |
| Springdoc OpenAPI (Swagger UI) | Documentación interactiva de la API |
| Maven | Build y dependencias |

---

## Arquitectura de la integración

```
┌─────────────────────────┐         HTTP / JSON          ┌──────────────────────────┐
│   FRONTEND (React)       │    fetch() + JWT (Bearer)    │   BACKEND (Spring Boot)   │
│   http://localhost:5173  │ ───────────────────────────▶ │   http://localhost:4040   │
│                          │ ◀─────────────────────────── │                          │
│  Componentes / Páginas   │         respuesta JSON       │  Controllers (/api/...)   │
│        │                 │                              │        │                  │
│  Redux (slices)          │                              │  Services                 │
│        │                 │                              │        │                  │
│  Servicios (fetch)       │                              │  Repositories (JPA)       │
└─────────────────────────┘                              │        │                  │
                                                          │   MySQL (padelstore)      │
                                                          └──────────────────────────┘
```

Cómo viaja un dato:

1. Las páginas despachan acciones o thunks de Redux.
2. Los thunks llaman a funciones de `src/services/`.
3. Los servicios deciden entre datos mock y llamadas HTTP reales según `VITE_USE_MOCKS`.
4. La capa de servicios hace `fetch()` a la API, adjuntando el token JWT (`Authorization: Bearer <token>`) cuando hay sesión.
5. Los slices de Redux guardan el estado (catálogo, auth, carrito, checkout, pedidos) y los componentes lo leen con `useSelector`.

El frontend nunca habla directo con la base de datos: siempre pasa por la API REST. Si el backend está apagado, la interfaz muestra un mensaje de error de conexión en lugar de romperse.

---

## Endpoints principales de la API

| Método | Endpoint | Descripción | ¿Requiere token? |
|---|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión (devuelve el JWT) | No |
| `POST` | `/api/usuarios` | Registrar usuario | No |
| `GET` | `/api/productos` | Listar productos | No (público) |
| `GET` | `/api/productos/{id}` | Detalle de producto | No (público) |
| `GET` | `/api/categorias` | Listar categorías | No (público) |
| `GET` | `/api/carritos/mi` | Carrito del usuario logueado | Sí |
| `POST` | `/api/carritos/mi/items` | Agregar ítem al carrito | Sí |
| `PUT` | `/api/carritos/mi/items/{idDetalle}` | Actualizar cantidad | Sí |
| `DELETE` | `/api/carritos/mi/items/{idDetalle}` | Quitar ítem | Sí |
| `POST` | `/api/pagos/pasarela-ficticia/checkout` | Pagar con tarjeta (pasarela ficticia) | Sí |
| `GET` | `/api/pedidos/usuario/{idUsuario}` | Pedidos del usuario | Sí |

La documentación interactiva completa está en Swagger UI: <http://localhost:4040/swagger-ui.html>.

---

## Requisitos previos

| Herramienta | Versión recomendada | Para |
|---|---|---|
| Node.js | 18 o superior | Frontend |
| npm | 9 o superior | Frontend |
| JDK (Java) | 17 o superior (el proyecto usa 25) | Backend |
| MySQL | 8.x | Base de datos del backend |

El backend incluye el Maven Wrapper (`mvnw`), así que no hace falta instalar Maven aparte.

---

## Estructura del proyecto

```
padel-clien-store/
├── public/
├── src/
│   ├── app/                 # Configuración del store de Redux
│   ├── components/          # Componentes reutilizables (ProductCard, Layout, etc.)
│   ├── data/                # Datos mock (modo sin backend)
│   ├── features/            # Slices de Redux (cart, auth, catalog, checkout, orders...)
│   ├── pages/               # Páginas / vistas (Home, Cart, Checkout, Auth, etc.)
│   ├── services/            # Capa de acceso a la API REST (fetch)
│   ├── utils/               # Utilidades (formatters)
│   ├── App.jsx              # Definición de rutas
│   └── main.jsx             # Punto de entrada
├── .env                     # Configuración de la API (URL base, modo)
└── package.json
```

---

## Cómo ejecutar el frontend

### Antes de empezar: el backend tiene que estar corriendo

El frontend consume la API en `http://localhost:4040`, así que primero asegurate de tener levantados MySQL y el backend (pasos 1 y 2 del [orden de prioridad](#orden-de-ejecución-prioridad)). Las instrucciones detalladas del backend están en el README de su carpeta (`TPO-G7/PadelStore`).

Para verificar que el backend está listo, abrí <http://localhost:4040/api/productos> en el navegador: deberías ver una lista de productos en JSON.

Podés saltear este requisito si vas a usar el modo mock (ver [Variables de entorno](#variables-de-entorno)): en ese caso el frontend funciona sin backend.

### Ejecutar el frontend

1. Abrí una terminal en la carpeta del frontend (`padel-clien-store`).
2. Instalá las dependencias (solo la primera vez):
   ```bash
   npm install
   ```
3. Iniciá el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abrí <http://localhost:5173> en el navegador.
5. Para frenarlo, `Ctrl + C` en la terminal.

En VS Code conviene abrir directamente la carpeta `padel-clien-store` (File → Open Folder), así la terminal integrada queda parada en el lugar correcto y `npm run dev` funciona sin tener que hacer `cd`.

---

## Usuarios de prueba

El backend siembra estos usuarios automáticamente. Iniciá sesión con el email, no con el nombre de usuario.

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@example.com` | `password` |
| Cliente | `messi@example.com` | `barcelona` |

También podés crear una cuenta nueva desde Registrarse (usá un email y usuario que no existan). Al registrarte, se inicia sesión automáticamente.

## Variables de entorno

El frontend se configura con el archivo `.env` en la raíz:

```env
# URL base de la API REST del backend
VITE_API_BASE_URL=http://localhost:4040/api

# false = la app consume el backend real
# true  = usa datos mock (sin necesidad de backend)
VITE_USE_MOCKS=false
```

Si querés mostrar el frontend sin levantar el backend, poné `VITE_USE_MOCKS=true` y reiniciá `npm run dev`: la app funciona con datos de ejemplo.

---

## Scripts útiles

Frontend (`npm run ...`):

| Script | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo (Vite) |
| `npm run build` | Genera el build de producción |
| `npm run preview` | Sirve el build de producción |
| `npm test` | Corre los tests (Vitest) |
| `npm run lint` | Ejecuta el linter (ESLint) |
| `npm run format` | Formatea el código (Prettier) |

Backend (`mvnw`):

| Comando | Descripción |
|---|---|
| `.\mvnw.cmd spring-boot:run` | Levanta el servidor |
| `.\mvnw.cmd compile` | Compila el proyecto |
| `.\mvnw.cmd test` | Corre los tests |

---

## Solución de problemas

| Problema | Causa / Solución |
|---|---|
| `npm error ENOENT ... package.json` | Estás en la carpeta equivocada. Entrá a `padel-clien-store` (donde está el `package.json`) antes de correr `npm`. |
| `Port already in use: 10000` al iniciar el backend | Hay otra instancia del backend corriendo (el dashboard de VS Code la lanza con JMX en el puerto 10000). Detené la instancia anterior desde VS Code, o corré el backend desde la terminal con `.\mvnw.cmd spring-boot:run`. |
| El front muestra "error de conexión" | El backend no está levantado o no está en `localhost:4040`. Levantalo primero. |
| Errores de CORS en la consola del navegador | El backend habilita CORS para `http://localhost:5173`. Asegurate de abrir el front en ese puerto exacto. |
| No puedo iniciar sesión | Usá el email completo (no el username) y una contraseña válida. El email tiene que tener formato válido. |
| "Tu carrito está vacío" al pagar | Tiene que haber sesión iniciada (con token) y productos en el carrito. |
| El pago se rechaza | El número de tarjeta tiene que ser válido por Luhn. Usá `4111 1111 1111 1111`. |
| No conecta a MySQL | Verificá que MySQL esté corriendo, que exista la base `padelstore` y que las credenciales coincidan con `application.properties`. Como alternativa, el backend puede usar H2 en memoria (ver comentarios en `application.properties`). |

---

Grupo 7 — UADE — Aplicaciones Interactivas — 2026
