import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { coupons } from "@/data/mockData.js";

const initialState = {
  id: 1,
  idUsuario: 2,
  estadoCarrito: "ABIERTO",
  detalles: [],
  couponCode: "",
  shippingCost: 1500,
  discount: 0,
  couponError: null
};

export const validateCoupon = createAsyncThunk(
  "cart/validateCoupon",
  (code, { getState, rejectWithValue }) => {
    const subtotal = selectCartSubtotal(getState());
    
    if (!code || code.trim() === "") {
      return rejectWithValue("Ingresa un código de cupón");
    }

    const coupon = coupons.find((c) => c.codigo === code.toUpperCase());
    
    if (!coupon) {
      return rejectWithValue("Cupón no encontrado");
    }

    if (!coupon.activo) {
      return rejectWithValue("Este cupón no está activo");
    }

    const now = new Date();
    const expireDate = new Date(coupon.fechaVencimiento);
    if (expireDate < now) {
      return rejectWithValue("Este cupón ha vencido");
    }

    if (coupon.usosActuales >= coupon.usosMaximos) {
      return rejectWithValue("Este cupón ha alcanzado el máximo de usos");
    }

    let discountAmount = 0;
    if (coupon.tipoDescuento === "PORCENTAJE") {
      discountAmount = Math.floor(subtotal * (coupon.descuento / 100));
    } else if (coupon.tipoDescuento === "MONTO_FIJO") {
      discountAmount = coupon.descuento;
    }

    return {
      couponCode: code.toUpperCase(),
      discount: discountAmount
    };
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
export const { addToCart, updateQuantity, removeFromCart, setCouponCode, setShippingCost, clearCart, setDiscount } = slice.actions;
export default slice.reducer;
