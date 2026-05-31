import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getOrdersByUser } from "@/services/ordersService.js";
const initialState = { items: [], status: "idle", error: null };
export const fetchOrders = createAsyncThunk("orders/fetchOrders", (idUsuario) => getOrdersByUser(idUsuario));
const slice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (b) =>
    b
      .addCase(fetchOrders.pending, (s) => {
        s.status = "loading";
      })
      .addCase(fetchOrders.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.items = a.payload;
      })
      .addCase(fetchOrders.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.error.message;
      })
});
export default slice.reducer;
