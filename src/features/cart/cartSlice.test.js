import { describe, expect, it } from "vitest";
import reducer, {
  addToCart,
  removeFromCart,
  selectCartSubtotal,
  selectCartTotal,
  updateQuantity
} from "./cartSlice.js";
const product = {
  id: 1,
  nombreProducto: "Pala Bullpadel Hack 03",
  marca: "Bullpadel",
  nombreCategoria: "Palas",
  visual: "🏓",
  precio: 32000
};
describe("cartSlice", () => {
  it("adds products and recalculates quantities", () => {
    let state = reducer(undefined, addToCart({ product, quantity: 1 }));
    state = reducer(state, addToCart({ product, quantity: 2 }));
    expect(state.detalles).toHaveLength(1);
    expect(state.detalles[0].cantidad).toBe(3);
    expect(state.detalles[0].subtotal).toBe(96000);
  });
  it("updates quantity with a minimum of one", () => {
    let state = reducer(undefined, addToCart({ product, quantity: 2 }));
    state = reducer(state, updateQuantity({ idProducto: 1, quantity: 0 }));
    expect(state.detalles[0].cantidad).toBe(1);
  });
  it("selects totals and removes items", () => {
    let cart = reducer(undefined, addToCart({ product, quantity: 1 }));
    expect(selectCartSubtotal({ cart })).toBe(32000);
    expect(selectCartTotal({ cart })).toBe(33500);
    cart = reducer(cart, removeFromCart(1));
    expect(cart.detalles).toHaveLength(0);
  });
});
