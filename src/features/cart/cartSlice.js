import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { coupons } from "@/data/mockData.js";
import { usingMocks } from "@/services/apiClient.js";
import * as cartService from "@/services/cartService.js";
import { validateCouponBackend } from "@/services/couponService.js";
import { selectIsAdmin } from "@/features/auth/authSlice.js";

const initialState = {
  id: null,
  estadoCarrito: "ABIERTO",
  detalles: [],
  couponCode: "",
  // Cupón aplicado ({ tipoDescuento, descuento }) para poder recalcular el descuento
  // cada vez que cambia el carrito; null cuando no hay ninguno.
  appliedCoupon: null,
  shippingCost: 1500,
  discount: 0,
  couponError: null
};

// Calcula el descuento de un cupón sobre el subtotal (lógica compartida mock/backend).
function calcDiscount(coupon, subtotal) {
  if (coupon.tipoDescuento === "PORCENTAJE") return Math.floor(subtotal * (coupon.descuento / 100));
  if (coupon.tipoDescuento === "MONTO_FIJO") return coupon.descuento;
  return 0;
}

const subtotalOf = (detalles) => detalles.reduce((t, i) => t + i.subtotal, 0);

// Recalcula el descuento contra el subtotal actual. Se llama después de cualquier cambio
// en los items para que el descuento (sobre todo el porcentual) y el total siempre
// coincidan. El descuento nunca supera el subtotal (así el total no queda negativo).
function recalcDiscount(state) {
  if (!state.appliedCoupon) {
    state.discount = 0;
    return;
  }
  const subtotal = subtotalOf(state.detalles);
  state.discount = Math.min(calcDiscount(state.appliedCoupon, subtotal), subtotal);
}

// Reglas de negocio de un cupón (activo / vigente / con usos disponibles). Compartidas
// entre la rama mock y la de backend; devuelve el mensaje de error o null si es válido.
function couponRuleError(coupon) {
  if (!coupon || coupon.activo === false) return "Este cupón no está activo";
  if (coupon.fechaVencimiento && new Date(coupon.fechaVencimiento) < new Date()) return "Este cupón ha vencido";
  if (coupon.usosMaximos != null && coupon.usosActuales >= coupon.usosMaximos) {
    return "Este cupón ha alcanzado el máximo de usos";
  }
  return null;
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
    imagenUrl: meta.imagenUrl,
    cantidad: d.cantidad,
    precioReferencial: d.precioReferencial,
    subtotal: d.subtotal
  };
}

// --- Thunks de validación de cupón (rama mock o backend según el flag) ---
export const validateCoupon = createAsyncThunk(
  "cart/validateCoupon",
  async (code, { rejectWithValue }) => {
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
      const ruleError = couponRuleError(coupon);
      if (ruleError) return rejectWithValue(ruleError);
      return { couponCode: coupon.codigo, coupon: { tipoDescuento: coupon.tipoDescuento, descuento: coupon.descuento } };
    }

    // --- Rama mock ---
    const coupon = coupons.find((c) => c.codigo === code.toUpperCase());
    if (!coupon) return rejectWithValue("Cupón no encontrado");
    const ruleError = couponRuleError(coupon);
    if (ruleError) return rejectWithValue(ruleError);
    return { couponCode: code.toUpperCase(), coupon: { tipoDescuento: coupon.tipoDescuento, descuento: coupon.descuento } };
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
    if (selectIsAdmin(getState())) {
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
  imagenUrl: product.imagenUrl,
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
    setCart: (state, action) => {
      const { cart, products = [] } = action.payload;
      const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
      state.id = cart.id;
      state.estadoCarrito = cart.estadoCarrito;
      state.detalles = (cart.detalles || []).map((d) => mapDetalle(d, productsById));
      recalcDiscount(state);
    },
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const item = state.detalles.find((d) => d.idProducto === product.id);
      if (item) {
        item.cantidad += quantity;
        item.subtotal = item.cantidad * item.precioReferencial;
      } else state.detalles.push(line(product, quantity));
      recalcDiscount(state);
    },
    updateQuantity: (state, action) => {
      const item = state.detalles.find((d) => d.idProducto === action.payload.idProducto);
      if (item) {
        item.cantidad = Math.max(1, action.payload.quantity);
        item.subtotal = item.cantidad * item.precioReferencial;
      }
      recalcDiscount(state);
    },
    removeFromCart: (state, action) => {
      state.detalles = state.detalles.filter((d) => d.idProducto !== action.payload);
      recalcDiscount(state);
    },
    setCouponCode: (state, action) => {
      state.couponCode = action.payload;
    },
    setShippingCost: (state, action) => {
      state.shippingCost = action.payload;
    },
    clearCart: (state) => {
      state.id = null;
      state.detalles = [];
      state.couponCode = "";
      state.appliedCoupon = null;
      state.discount = 0;
      state.shippingCost = 1500;
      state.couponError = null;
    },
    setDiscount: (state, action) => {
      state.discount = action.payload;
      state.couponError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.couponCode = action.payload.couponCode;
        state.appliedCoupon = action.payload.coupon;
        recalcDiscount(state);
        state.couponError = null;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.couponError = action.payload;
        state.appliedCoupon = null;
        state.discount = 0;
        state.couponCode = "";
      });
  }
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
