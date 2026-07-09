import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as adminService from "@/services/adminService.js";
import { STATUS } from "@/utils/asyncStatus.js";

const initialState = {
  products: [],
  categories: [],
  coupons: [],
  orders: [],
  users: [],
  status: STATUS.IDLE,
  saving: STATUS.IDLE,
  error: null
};

// Fetch por entidad: cada pantalla del panel pide solo lo que necesita (no todo el admin).
export const fetchAdminProducts = createAsyncThunk("admin/fetchProducts", () => adminService.getAdminProducts());
export const fetchAdminCategories = createAsyncThunk("admin/fetchCategories", () => adminService.getAdminCategories());
export const fetchAdminCoupons = createAsyncThunk("admin/fetchCoupons", () => adminService.getAdminCoupons());
export const fetchAdminOrders = createAsyncThunk("admin/fetchOrders", () => adminService.getAdminOrders());
export const fetchAdminUsers = createAsyncThunk("admin/fetchUsers", () => adminService.getAdminUsers());
export const saveProduct = createAsyncThunk("admin/saveProduct", ({ id, payload }) =>
  id ? adminService.updateProduct(id, payload) : adminService.createProduct(payload)
);
export const removeProduct = createAsyncThunk("admin/removeProduct", (id) =>
  adminService.deleteProduct(id).then(() => id)
);
export const saveCategory = createAsyncThunk("admin/saveCategory", ({ id, payload }) =>
  id ? adminService.updateCategory(id, payload) : adminService.createCategory(payload)
);
export const removeCategory = createAsyncThunk("admin/removeCategory", (id) =>
  adminService.deleteCategory(id).then(() => id)
);
export const saveCoupon = createAsyncThunk("admin/saveCoupon", (payload) => adminService.createCoupon(payload));
export const removeCoupon = createAsyncThunk("admin/removeCoupon", (id) =>
  adminService.deleteCoupon(id).then(() => id)
);
export const changeOrderStatus = createAsyncThunk("admin/changeOrderStatus", ({ id, estadoPedido }) =>
  adminService.updateOrderStatus(id, estadoPedido)
);
export const cancelOrder = createAsyncThunk("admin/cancelOrder", (id) => adminService.cancelOrder(id).then(() => id));
export const saveUser = createAsyncThunk("admin/saveUser", ({ id, payload }) =>
  id ? adminService.updateUser(id, payload) : adminService.createUser(payload)
);
export const changeUserRole = createAsyncThunk("admin/changeUserRole", ({ id, rol }) =>
  adminService.updateUserRole(id, rol)
);
export const removeUser = createAsyncThunk("admin/removeUser", (id) => adminService.deleteUser(id).then(() => id));

const upsert = (items, item) => {
  const exists = items.some((entry) => entry.id === item.id);
  return exists ? items.map((entry) => (entry.id === item.id ? item : entry)) : [item, ...items];
};

const slice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.products = action.payload;
      })
      .addCase(fetchAdminCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchAdminCoupons.fulfilled, (state, action) => {
        state.coupons = action.payload;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(saveProduct.fulfilled, (state, action) => {
        state.products = upsert(state.products, action.payload);
      })
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((item) => item.id !== Number(action.payload));
      })
      .addCase(saveCategory.fulfilled, (state, action) => {
        state.categories = upsert(state.categories, action.payload);
      })
      .addCase(removeCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((item) => item.id !== Number(action.payload));
      })
      .addCase(saveCoupon.fulfilled, (state, action) => {
        state.coupons = upsert(state.coupons, action.payload);
      })
      .addCase(removeCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter((item) => item.id !== Number(action.payload));
      })
      .addCase(changeOrderStatus.fulfilled, (state, action) => {
        state.orders = upsert(state.orders, action.payload);
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.orders = state.orders.map((item) =>
          item.id === Number(action.payload) ? { ...item, estadoPedido: "CANCELADO" } : item
        );
      })
      .addCase(saveUser.fulfilled, (state, action) => {
        state.users = upsert(state.users, action.payload);
      })
      .addCase(changeUserRole.fulfilled, (state, action) => {
        state.users = upsert(state.users, action.payload);
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.users = state.users.filter((item) => item.id !== Number(action.payload));
      })
      // Estado de carga de los fetch (por entidad): controlan `status`.
      .addMatcher(
        (action) => action.type.startsWith("admin/fetch") && action.type.endsWith("/pending"),
        (state) => {
          state.status = STATUS.LOADING;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("admin/fetch") && action.type.endsWith("/fulfilled"),
        (state) => {
          state.status = STATUS.SUCCEEDED;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("admin/fetch") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.status = STATUS.FAILED;
          state.error = action.error.message;
        }
      )
      // Estado de las mutaciones (crear/editar/borrar): controlan `saving`.
      .addMatcher(
        (action) =>
          action.type.startsWith("admin/") &&
          !action.type.startsWith("admin/fetch") &&
          action.type.endsWith("/pending"),
        (state) => {
          state.saving = STATUS.LOADING;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("admin/") &&
          !action.type.startsWith("admin/fetch") &&
          action.type.endsWith("/rejected"),
        (state, action) => {
          state.saving = STATUS.FAILED;
          state.error = action.error.message;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("admin/") &&
          !action.type.startsWith("admin/fetch") &&
          action.type.endsWith("/fulfilled"),
        (state) => {
          state.saving = STATUS.IDLE;
          state.error = null;
        }
      )
});

export default slice.reducer;
