import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as authService from "@/services/authService.js";
import { STATUS, addAsyncCases } from "@/utils/asyncStatus.js";

const storedToken = window.localStorage.getItem("padelstore_token");
const storedUser = window.localStorage.getItem("padelstore_user");
const initialState = {
  token: storedToken,
  user: storedUser ? JSON.parse(storedUser) : null,
  status: STATUS.IDLE,
  error: null
};

export const loginUser = createAsyncThunk("auth/loginUser", (credentials) => authService.login(credentials));
export const registerUser = createAsyncThunk("auth/registerUser", (payload) => authService.register(payload));

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.status = STATUS.IDLE;
      state.error = null;
      window.localStorage.removeItem("padelstore_token");
      window.localStorage.removeItem("padelstore_user");
    }
  },
  extraReducers: (builder) => {
    addAsyncCases(builder, loginUser, {
      fulfilled: (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.usuario;
        window.localStorage.setItem("padelstore_token", action.payload.token);
        window.localStorage.setItem("padelstore_user", JSON.stringify(action.payload.usuario));
      }
    });
    // El registro NO inicia sesion por si solo (no devuelve token). El login automatico
    // que dispara RegisterPage es el que establece user + token.
    addAsyncCases(builder, registerUser);
  }
});

export const selectIsAdmin = (state) => state.auth?.user?.rol === "ADMIN";
export const { logout } = slice.actions;
export default slice.reducer;
