import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCategories, getProductById, getProducts } from "@/services/catalogService.js";
import { STATUS, addAsyncCases } from "@/utils/asyncStatus.js";

const initialState = {
  products: [],
  categories: [],
  selectedProduct: null,
  filters: { search: "", category: "Todos los productos", brands: [], sort: "featured" },
  status: STATUS.IDLE,
  error: null
};
export const fetchCatalog = createAsyncThunk("catalog/fetchCatalog", async (_, { getState }) => {
  const { filters } = getState().catalog;
  const [products, categories] = await Promise.all([getProducts(filters), getCategories()]);
  return { products, categories };
});
export const fetchProduct = createAsyncThunk("catalog/fetchProduct", (id) => getProductById(id));
const slice = createSlice({
  name: "catalog",
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.filters.search = action.payload;
    },
    setCategory: (state, action) => {
      state.filters.category = action.payload;
    },
    setSort: (state, action) => {
      state.filters.sort = action.payload;
    },
    toggleBrand: (state, action) => {
      const brand = action.payload;
      state.filters.brands = state.filters.brands.includes(brand)
        ? state.filters.brands.filter((b) => b !== brand)
        : [...state.filters.brands, brand];
    }
  },
  extraReducers: (builder) => {
    addAsyncCases(builder, fetchCatalog, {
      fulfilled: (state, action) => {
        state.products = action.payload.products;
        state.categories = action.payload.categories;
      }
    });
    builder.addCase(fetchProduct.fulfilled, (state, action) => {
      state.selectedProduct = action.payload;
    });
  }
});
export const { setSearch, setCategory, setSort, toggleBrand } = slice.actions;
export default slice.reducer;
