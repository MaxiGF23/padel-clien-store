# PadelStore Client

React storefront client for the PadelStore Spring Boot API.

## Tech Stack

- Vite + React
- Redux Toolkit + React Redux
- React Router
- Tailwind CSS
- Vitest
- Mock-backed service layer that can be switched to the real Java API

## Requirements

- Node.js 18 or newer
- npm
- Optional for real API mode: PadelStore backend running on `http://localhost:4040`

## Install

```bash
cd /Users/christian/Desktop/padelstore-client-clean
npm install
```

## Run With Mock Data

Mock mode is the default. It does not require the Java server.

```bash
npm run dev
```

Open `http://localhost:5173/`.

## Run With The Real Server

Start the backend first:

```bash
cd /Users/christian/Desktop/PadelStore
./mvnw spring-boot:run
```

Then run the frontend with mocks disabled:

```bash
cd /Users/christian/Desktop/padelstore-client-clean
VITE_USE_MOCKS=false VITE_API_BASE_URL=http://localhost:4040/api npm run dev
```

Backend seed users:

```text
admin@example.com / password
messi@example.com / barcelona
```

## Environment Variables

Create `.env.local` for persistent settings:

```bash
VITE_USE_MOCKS=true
VITE_API_BASE_URL=http://localhost:4040/api
```

Use `VITE_USE_MOCKS=false` to call the real API.

## Useful Commands

```bash
npm run dev      # Start local dev server
npm run build    # Build production assets into dist/
npm run preview  # Preview the production build
npm run test     # Run Vitest tests
```

## Project Architecture

```text
src/
  app/store.js              Redux store setup
  components/               Shared layout, cards, buttons, controls
  data/mockData.js          Mock products, categories, user, orders
  features/auth/            Login/register Redux state
  features/cart/            Cart lines, quantities, totals
  features/catalog/         Products, categories, filters
  features/checkout/        Address, shipping, payment, submit flow
  features/orders/          User order history
  pages/                    Route-level screens
  services/                 API boundary and mock/real switch
  utils/                    Money, dates, text normalization
```

## Data Flow

1. Pages dispatch Redux actions or thunks.
2. Thunks call functions in `src/services`.
3. Services decide between mock data and real HTTP calls using `VITE_USE_MOCKS`.
4. Redux slices store UI state for catalog, auth, cart, checkout, and orders.
5. Components read state with `useSelector` and dispatch user actions.

## Backend Contract

- `POST /api/auth/login`
- `POST /api/usuarios`
- `GET /api/productos`
- `GET /api/productos/:id`
- `GET /api/categorias`
- `GET /api/carritos/mi`
- `POST /api/carritos/mi/items`
- `PUT /api/carritos/mi/items/:idDetalle`
- `DELETE /api/carritos/mi/items/:idDetalle`
- `POST /api/pagos/pasarela-ficticia/checkout`
- `GET /api/pedidos/usuario/:idUsuario`

DTO names intentionally stay close to the backend: `nombreProducto`, `idCategoria`, `detalles`, `idCarrito`, `idDireccion`, `metodoEnvio`, and `codigoCupon`.

## Notes

- The current UI uses mock visual placeholders for product images.
- Backend product images can later be loaded from `GET /api/productos/{id}/imagen` and rendered as `data:<contentType>;base64,<imageBase64>`.
