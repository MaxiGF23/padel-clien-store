import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as authService from "@/services/authService.js";

const storedToken = window.localStorage.getItem("padelstore_token");
const storedUser = window.localStorage.getItem("padelstore_user");
const initialState = { token: storedToken, user: storedUser ? JSON.parse(storedUser) : null, status: "idle", error: null };
export const loginUser = createAsyncThunk("auth/loginUser", (credentials) => authService.login(credentials));
export const registerUser = createAsyncThunk("auth/registerUser", (payload) => authService.register(payload));
const slice = createSlice({
  name: "auth",
  initialState,
  reducers: { logout: (s) => { s.token = null; s.user = null; window.localStorage.removeItem("padelstore_token"); window.localStorage.removeItem("padelstore_user"); } },
  extraReducers: (b) => b
    .addCase(loginUser.pending, (s) => { s.status = "loading"; s.error = null; })
    .addCase(loginUser.fulfilled, (s, a) => { s.status = "succeeded"; s.token = a.payload.token; s.user = a.payload.usuario; window.localStorage.setItem("padelstore_token", a.payload.token); window.localStorage.setItem("padelstore_user", JSON.stringify(a.payload.usuario)); })
    .addCase(loginUser.rejected, (s, a) => { s.status = "failed"; s.error = a.error.message; })
    .addCase(registerUser.fulfilled, (s, a) => { s.status = "registered"; s.user = a.payload; })
});
export const { logout } = slice.actions;
export default slice.reducer;
