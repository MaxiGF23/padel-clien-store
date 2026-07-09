import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { getCategories, getProductById, getProducts } from "@/services/catalogService.js";
import { STATUS, addAsyncCases } from "@/utils/asyncStatus.js";
import { normalizeText } from "@/utils/formatters.js";

const initialState = {
  products: [],
  categories: [],
  selectedProduct: null,
  filters: { search: "", category: "Todos los productos", brands: [], sort: "featured" },
  status: STATUS.IDLE,
  error: null
};
export const fetchCatalog = createAsyncThunk("catalog/fetchCatalog", async () => {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
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

// Deriva la lista visible (búsqueda + categoría + marcas + orden) sobre el catálogo
// ya cargado, en el cliente. Al ser memoizado, solo recalcula cuando cambian los
// productos o los filtros — sin volver a pegarle al backend en cada cambio.
export const selectFilteredProducts = createSelector(
  [(state) => state.catalog.products, (state) => state.catalog.filters],
  (products, filters) => {
    const search = normalizeText(filters.search);
    return products
      .filter((p) => !search || normalizeText(`${p.nombreProducto} ${p.marca}`).includes(search))
      .filter(
        (p) => filters.category === "Todos los productos" || !filters.category || p.nombreCategoria === filters.category
      )
      .filter((p) => !filters.brands?.length || filters.brands.includes(p.marca))
      .sort((a, b) =>
        filters.sort === "price-asc"
          ? a.precio - b.precio
          : filters.sort === "price-desc"
            ? b.precio - a.precio
            : a.id - b.id
      );
  }
);

export default slice.reducer;
