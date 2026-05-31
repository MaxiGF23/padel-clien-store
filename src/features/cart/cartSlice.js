import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  id: 1,
  idUsuario: 2,
  estadoCarrito: "ABIERTO",
  detalles: [],
  couponCode: "",
  shippingCost: 1500,
  discount: 0
};
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
    }
  }
});
export const selectCartSubtotal = (state) => state.cart.detalles.reduce((t, i) => t + i.subtotal, 0);
export const selectCartCount = (state) => state.cart.detalles.reduce((t, i) => t + i.cantidad, 0);
export const selectCartTotal = (state) => selectCartSubtotal(state) + state.cart.shippingCost - state.cart.discount;
export const { addToCart, updateQuantity, removeFromCart, setCouponCode, setShippingCost, clearCart } = slice.actions;
export default slice.reducer;
