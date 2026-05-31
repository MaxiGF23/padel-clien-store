import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCategories, getProductById, getProducts } from "@/services/catalogService.js";

const initialState = {
  products: [],
  categories: [],
  selectedProduct: null,
  filters: { search: "", category: "Todos los productos", brands: [], sort: "featured" },
  status: "idle",
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
    setSearch: (s, a) => {
      s.filters.search = a.payload;
    },
    setCategory: (s, a) => {
      s.filters.category = a.payload;
    },
    setSort: (s, a) => {
      s.filters.sort = a.payload;
    },
    toggleBrand: (s, a) => {
      s.filters.brands = s.filters.brands.includes(a.payload)
        ? s.filters.brands.filter((b) => b !== a.payload)
        : [...s.filters.brands, a.payload];
    }
  },
  extraReducers: (b) =>
    b
      .addCase(fetchCatalog.pending, (s) => {
        s.status = "loading";
      })
      .addCase(fetchCatalog.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.products = a.payload.products;
        s.categories = a.payload.categories;
      })
      .addCase(fetchCatalog.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.error.message;
      })
      .addCase(fetchProduct.fulfilled, (s, a) => {
        s.selectedProduct = a.payload;
      })
});
export const { setSearch, setCategory, setSort, toggleBrand } = slice.actions;
export default slice.reducer;
