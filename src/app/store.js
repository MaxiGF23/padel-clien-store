import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice.js";
import cartReducer from "@/features/cart/cartSlice.js";
import catalogReducer from "@/features/catalog/catalogSlice.js";
import checkoutReducer from "@/features/checkout/checkoutSlice.js";
import ordersReducer from "@/features/orders/ordersSlice.js";

export const store = configureStore({ reducer: { auth: authReducer, cart: cartReducer, catalog: catalogReducer, checkout: checkoutReducer, orders: ordersReducer } });
