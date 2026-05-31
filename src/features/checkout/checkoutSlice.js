import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { checkoutWithCard } from "@/services/checkoutService.js";
import { selectCartTotal } from "@/features/cart/cartSlice.js";
const initialState = {
  address: {
    nombre: "Lionel",
    apellido: "Messi",
    calle: "Av. Corrientes",
    numero: "1234",
    ciudad: "Buenos Aires",
    provincia: "CABA",
    codigoPostal: "1414",
    referencia: "",
    tipoDireccion: "CASA"
  },
  shippingMethod: "ENVIO_DOMICILIO",
  paymentMethod: "TARJETA_CREDITO",
  card: {
    numeroTarjeta: "1234 5678 9012 3456",
    titularTarjeta: "Lionel Messi",
    vencimiento: "12/28",
    cvv: "123",
    cuotas: "1"
  },
  status: "idle",
  result: null,
  error: null
};
export const submitCheckout = createAsyncThunk("checkout/submitCheckout", (_, { getState }) => {
  const state = getState();
  return checkoutWithCard({
    idCarrito: state.cart.id,
    idDireccion: 1,
    metodoEnvio: state.checkout.shippingMethod,
    observaciones: state.checkout.address.referencia,
    codigoCupon: state.cart.couponCode,
    numeroTarjeta: state.checkout.card.numeroTarjeta.replace(/\s/g, ""),
    titularTarjeta: state.checkout.card.titularTarjeta,
    vencimiento: state.checkout.card.vencimiento,
    cvv: state.checkout.card.cvv,
    total: selectCartTotal(state)
  });
});
const slice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    updateAddress: (s, a) => {
      s.address = { ...s.address, ...a.payload };
    },
    setShippingMethod: (s, a) => {
      s.shippingMethod = a.payload;
    },
    setPaymentMethod: (s, a) => {
      s.paymentMethod = a.payload;
    },
    updateCard: (s, a) => {
      s.card = { ...s.card, ...a.payload };
    }
  },
  extraReducers: (b) =>
    b
      .addCase(submitCheckout.pending, (s) => {
        s.status = "loading";
      })
      .addCase(submitCheckout.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.result = a.payload;
      })
      .addCase(submitCheckout.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.error.message;
      })
});
export const { updateAddress, setShippingMethod, setPaymentMethod, updateCard } = slice.actions;
export default slice.reducer;
