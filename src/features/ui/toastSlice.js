import { createSlice, nanoid } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "toasts",
  initialState: { items: [] },
  reducers: {
    showToast: {
      reducer: (s, a) => {
        s.items.push(a.payload);
      },
      prepare: ({ message, type = "info", duration = 3000 }) => ({
        payload: { id: nanoid(), message, type, duration }
      })
    },
    dismissToast: (s, a) => {
      s.items = s.items.filter((t) => t.id !== a.payload);
    }
  }
});

export const { showToast, dismissToast } = slice.actions;
export default slice.reducer;
