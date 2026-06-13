import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { coupons } from "@/data/mockData.js";
import { usingMocks } from "@/services/apiClient.js";
import * as cartService from "@/services/cartService.js";
import { validateCouponBackend } from "@/services/couponService.js";

const initialState = {
  id: null,
  estadoCarrito: "ABIERTO",
  detalles: [],
  couponCode: "",
  shippingCost: 1500,
  discount: 0,
  couponError: null,
  status: "idle"
};

// Calcula el descuento de un cupón sobre el subtotal (lógica compartida mock/backend).
function calcDiscount(coupon, subtotal) {
  if (coupon.tipoDescuento === "PORCENTAJE") return Math.floor(subtotal * (coupon.descuento / 100));
  if (coupon.tipoDescuento === "MONTO_FIJO") return coupon.descuento;
  return 0;
}

// Mapea un DetalleCarritoDTO del backend al shape del front. El backend trae los
// datos transaccionales (cantidad, precio, subtotal); los cosméticos (marca,
// categoría, visual) se enriquecen desde el catálogo si está cargado.
function mapDetalle(d, productsById) {
  const meta = productsById[d.idProducto] || {};
  return {
    id: d.id, // idDetalle: necesario para actualizar/quitar en el backend
    idProducto: d.idProducto,
    nombreProducto: d.nombreProducto ?? meta.nombreProducto,
    marca: meta.marca,
    nombreCategoria: meta.nombreCategoria,
    visual: meta.visual,
    cantidad: d.cantidad,
    precioReferencial: d.precioReferencial,
    subtotal: d.subtotal
  };
}

// --- Thunks de validación de cupón (rama mock o backend según el flag) ---
export const validateCoupon = createAsyncThunk(
  "cart/validateCoupon",
  async (code, { getState, rejectWithValue }) => {
    const subtotal = selectCartSubtotal(getState());

    if (!code || code.trim() === "") {
      return rejectWithValue("Ingresa un código de cupón");
    }

    if (!usingMocks()) {
      let coupon;
      try {
        coupon = await validateCouponBackend(code.toUpperCase());
      } catch {
        return rejectWithValue("Cupón no encontrado");
      }
      if (!coupon || coupon.activo === false) return rejectWithValue("Este cupón no está activo");
      if (coupon.fechaVencimiento && new Date(coupon.fechaVencimiento) < new Date()) {
        return rejectWithValue("Este cupón ha vencido");
      }
      if (coupon.usosMaximos != null && coupon.usosActuales >= coupon.usosMaximos) {
        return rejectWithValue("Este cupón ha alcanzado el máximo de usos");
      }
      return { couponCode: coupon.codigo, discount: calcDiscount(coupon, subtotal) };
    }

    // --- Rama mock ---
    const coupon = coupons.find((c) => c.codigo === code.toUpperCase());
    if (!coupon) return rejectWithValue("Cupón no encontrado");
    if (!coupon.activo) return rejectWithValue("Este cupón no está activo");
    if (new Date(coupon.fechaVencimiento) < new Date()) return rejectWithValue("Este cupón ha vencido");
    if (coupon.usosActuales >= coupon.usosMaximos) {
      return rejectWithValue("Este cupón ha alcanzado el máximo de usos");
    }
    return { couponCode: code.toUpperCase(), discount: calcDiscount(coupon, subtotal) };
  }
);

// --- Thunks de carrito: deciden entre mock (estado local) y backend (server-side) ---

// ¿El carrito debe operar localmente? Sí en modo mock o cuando no hay sesión
// iniciada (carrito de invitado, que vive solo en Redux).
function isLocalCart(state) {
  return usingMocks() || !state.auth.token;
}

// Hidrata el carrito del usuario logueado desde el backend. Si había items
// agregados como invitado, los fusiona al carrito del backend antes de cargarlo.
export const loadCart = createAsyncThunk("cart/loadCart", async (_, { getState, dispatch }) => {
  if (usingMocks() || !getState().auth.token) return;
  const guestItems = getState().cart.detalles;
  for (const item of guestItems) {
    await cartService.addItem(item.idProducto, item.cantidad);
  }
  const cart = await cartService.getMyCart();
  dispatch(setCart({ cart, products: getState().catalog.products }));
});

export const addItemToCart = createAsyncThunk(
  "cart/addItemToCart",
  async ({ product, quantity = 1 }, { getState, dispatch }) => {
    if (getState().auth.user?.rol === "ADMIN") {
      throw new Error("Los administradores no pueden realizar compras");
    }
    if (isLocalCart(getState())) {
      dispatch(addToCart({ product, quantity }));
      return;
    }
    const cart = await cartService.addItem(product.id, quantity);
    dispatch(setCart({ cart, products: getState().catalog.products }));
  }
);

export const changeQuantity = createAsyncThunk(
  "cart/changeQuantity",
  async ({ idProducto, quantity }, { getState, dispatch }) => {
    if (isLocalCart(getState())) {
      dispatch(updateQuantity({ idProducto, quantity }));
      return;
    }
    const item = getState().cart.detalles.find((d) => d.idProducto === idProducto);
    if (!item) return;
    const cart = await cartService.updateItem(item.id, idProducto, Math.max(1, quantity));
    dispatch(setCart({ cart, products: getState().catalog.products }));
  }
);

export const removeItem = createAsyncThunk(
  "cart/removeItem",
  async (idProducto, { getState, dispatch }) => {
    if (isLocalCart(getState())) {
      dispatch(removeFromCart(idProducto));
      return;
    }
    const item = getState().cart.detalles.find((d) => d.idProducto === idProducto);
    if (!item) return;
    const cart = await cartService.removeItem(item.id);
    dispatch(setCart({ cart, products: getState().catalog.products }));
  }
);

const line = (product, quantity) => ({
  id: product.id,
  idProducto: product.id,
  nombreProducto: product.nombreProducto,
  marca: product.marca,
  nombreCategoria: product.nombreCategoria,
  visual: product.visual,
  cantidad: quantity,
  precioReferencial: product.precio,
  subtotal: product.precio * quantity,
  estadoCarrito: "ABIERTO"
});
const slice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Reemplaza el carrito completo con la respuesta del backend.
    setCart: (s, a) => {
      const { cart, products = [] } = a.payload;
      const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
      s.id = cart.id;
      s.estadoCarrito = cart.estadoCarrito;
      s.detalles = (cart.detalles || []).map((d) => mapDetalle(d, productsById));
    },
    addToCart: (s, a) => {
      const { product, quantity = 1 } = a.payload;
      const item = s.detalles.find((d) => d.idProducto === product.id);
      if (item) {
        item.cantidad += quantity;
        item.subtotal = item.cantidad * item.precioReferencial;
      } else s.detalles.push(line(product, quantity));
    },
    updateQuantity: (s, a) => {
      const item = s.detalles.find((d) => d.idProducto === a.payload.idProducto);
      if (item) {
        item.cantidad = Math.max(1, a.payload.quantity);
        item.subtotal = item.cantidad * item.precioReferencial;
      }
    },
    removeFromCart: (s, a) => {
      s.detalles = s.detalles.filter((d) => d.idProducto !== a.payload);
    },
    setCouponCode: (s, a) => {
      s.couponCode = a.payload;
    },
    setShippingCost: (s, a) => {
      s.shippingCost = a.payload;
    },
    clearCart: (s) => {
      s.id = null;
      s.detalles = [];
      s.couponCode = "";
      s.discount = 0;
      s.shippingCost = 1500;
      s.couponError = null;
    },
    setDiscount: (s, a) => {
      s.discount = a.payload;
      s.couponError = null;
    }
  },
  extraReducers: (b) =>
    b
      .addCase(validateCoupon.fulfilled, (s, a) => {
        s.couponCode = a.payload.couponCode;
        s.discount = a.payload.discount;
        s.couponError = null;
      })
      .addCase(validateCoupon.rejected, (s, a) => {
        s.couponError = a.payload;
        s.discount = 0;
        s.couponCode = "";
      })
});
export const selectCartSubtotal = (state) => state.cart.detalles.reduce((t, i) => t + i.subtotal, 0);
export const selectCartCount = (state) => state.cart.detalles.reduce((t, i) => t + i.cantidad, 0);
export const selectCartTotal = (state) => selectCartSubtotal(state) + state.cart.shippingCost - state.cart.discount;
export const {
  setCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  setCouponCode,
  setShippingCost,
  clearCart,
  setDiscount
} = slice.actions;
export default slice.reducer;
