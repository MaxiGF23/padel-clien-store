import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { checkoutWithCard } from "@/services/checkoutService.js";
import { usingMocks } from "@/services/apiClient.js";
import * as direccionService from "@/services/direccionService.js";
import * as cartService from "@/services/cartService.js";
import { setCart, selectCartTotal } from "@/features/cart/cartSlice.js";
import { STATUS, addAsyncCases } from "@/utils/asyncStatus.js";
import { selectIsAdmin } from "@/features/auth/authSlice.js";

// Resuelve el idDireccion real que necesita la pasarela: usa la primera dirección
// del usuario, o crea una a partir del formulario de checkout si no tiene ninguna.
async function resolveIdDireccion(state) {
  const idUsuario = state.auth?.user?.id;
  const direcciones = await direccionService.getAddressesByUser(idUsuario);
  if (direcciones?.length > 0) return direcciones[0].id;
  const a = state.checkout.address;
  const creada = await direccionService.createAddress({
    idUsuario,
    calle: a.calle,
    numero: a.numero,
    ciudad: a.ciudad,
    provincia: a.provincia,
    codigoPostal: a.codigoPostal,
    referencia: a.referencia || "",
    tipoDireccion: a.tipoDireccion || "CASA"
  });
  return creada.id;
}
const initialState = {
  address: {
    nombre: "",
    apellido: "",
    calle: "",
    numero: "",
    ciudad: "",
    provincia: "",
    codigoPostal: "",
    referencia: "",
    tipoDireccion: "CASA"
  },
  shippingMethod: "ENVIO_DOMICILIO",
  paymentMethod: "TARJETA_CREDITO",
  card: {
    numeroTarjeta: "",
    titularTarjeta: "",
    vencimiento: "",
    cvv: "",
    cuotas: "1"
  },
  status: STATUS.IDLE,
  result: null,
  error: null
};
export const submitCheckout = createAsyncThunk("checkout/submitCheckout", async (_, { getState, dispatch }) => {
  const state = getState();

  if (selectIsAdmin(state)) {
    throw new Error("Los administradores no pueden realizar compras");
  }

  // --- Rama mock: paga contra la pasarela simulada con el carrito local ---
  if (usingMocks()) {
    return checkoutWithCard({
      idCarrito: state.cart.id,
      idUsuario: state.auth?.user?.id,
      idDireccion: 1,
      metodoEnvio: state.checkout.shippingMethod,
      metodoPago: state.checkout.paymentMethod,
      observaciones: state.checkout.address.referencia,
      codigoCupon: state.cart.couponCode,
      descuentoAplicado: state.cart.discount,
      detalles: state.cart.detalles,
      numeroTarjeta: state.checkout.card.numeroTarjeta.replace(/\s/g, ""),
      titularTarjeta: state.checkout.card.titularTarjeta,
      vencimiento: state.checkout.card.vencimiento,
      cvv: state.checkout.card.cvv,
      total: selectCartTotal(state)
    });
  }

  // --- Rama backend: la pasarela ficticia factura desde el carrito persistido ---
  // Re-sincronizamos el carrito con el backend (fetch puro, sin fusionar) para no mandar
  // un idCarrito viejo ya vaciado por una compra anterior ni revivir items ya comprados.
  const freshCart = await cartService.getMyCart();
  dispatch(setCart({ cart: freshCart, products: getState().catalog.products }));
  const idCarrito = getState().cart.id;
  if (!idCarrito || getState().cart.detalles.length === 0) {
    throw new Error("Tu carrito está vacío");
  }

  const idDireccion = await resolveIdDireccion(getState());
  const metodoPago = state.checkout.paymentMethod;

  // El backend calcula el total desde el carrito en la BD (no se manda desde el front).
  // Los datos de tarjeta solo se envían cuando el medio de pago es con tarjeta;
  // transferencia y efectivo crean el pedido sin pasar por la validación de la pasarela.
  const payload = {
    idCarrito,
    idDireccion,
    metodoEnvio: state.checkout.shippingMethod,
    medioPago: metodoPago,
    observaciones: state.checkout.address.referencia || "",
    codigoCupon: state.cart.couponCode || undefined
  };
  if (metodoPago === "TARJETA_CREDITO") {
    payload.numeroTarjeta = state.checkout.card.numeroTarjeta.replace(/\s/g, "");
    payload.titularTarjeta = state.checkout.card.titularTarjeta;
    payload.vencimiento = state.checkout.card.vencimiento;
    payload.cvv = state.checkout.card.cvv;
  }
  return checkoutWithCard(payload);
});
const slice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    updateAddress: (state, action) => {
      state.address = { ...state.address, ...action.payload };
    },
    setShippingMethod: (state, action) => {
      state.shippingMethod = action.payload;
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    updateCard: (state, action) => {
      state.card = { ...state.card, ...action.payload };
    },
    resetCheckout: (state) => {
      Object.assign(state, initialState);
    }
  },
  extraReducers: (builder) => {
    addAsyncCases(builder, submitCheckout, {
      fulfilled: (state, action) => {
        state.result = action.payload;
      }
    });
  }
});
export const { updateAddress, setShippingMethod, setPaymentMethod, updateCard, resetCheckout } = slice.actions;
export default slice.reducer;
