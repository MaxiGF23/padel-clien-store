import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";
import cartReducer, { addToCart } from "@/features/cart/cartSlice.js";
import checkoutReducer, { submitCheckout, updateCard } from "./checkoutSlice.js";
describe("checkoutSlice", () => {
  it("builds checkout payload and stores the result", async () => {
    const store = configureStore({ reducer: { cart: cartReducer, checkout: checkoutReducer } });
    store.dispatch(
      addToCart({
        product: {
          id: 1,
          nombreProducto: "Pala Bullpadel Hack 03",
          marca: "Bullpadel",
          nombreCategoria: "Palas",
          visual: "🏓",
          precio: 32000
        },
        quantity: 1
      })
    );
    store.dispatch(updateCard({ numeroTarjeta: "4111 1111 1111 1111" }));
    const result = await store.dispatch(submitCheckout());
    expect(submitCheckout.fulfilled.match(result)).toBe(true);
    expect(store.getState().checkout.result).toMatchObject({
      aprobado: true,
      estadoPago: "APROBADO",
      ultimos4: "1111"
    });
  });
});
