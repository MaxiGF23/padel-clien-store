import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getOrdersByUser } from "@/services/ordersService.js";
import { STATUS, addAsyncCases } from "@/utils/asyncStatus.js";

const initialState = { items: [], status: STATUS.IDLE, error: null };

export const fetchOrders = createAsyncThunk("orders/fetchOrders", (idUsuario) => getOrdersByUser(idUsuario));

const slice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    addAsyncCases(builder, fetchOrders, {
      fulfilled: (state, action) => {
        state.items = action.payload;
      }
    });
  }
});

export default slice.reducer;
