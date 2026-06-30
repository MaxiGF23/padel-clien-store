// Vocabulario unico para el estado de las operaciones asincronicas. Antes cada slice y
// cada pantalla repetia los strings "idle"/"loading"/"succeeded"/"failed" a mano.
export const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCEEDED: "succeeded",
  FAILED: "failed"
};

// Conecta el trio pending/fulfilled/rejected de un thunk a un slice con la convencion
// estandar { status, error }. Evita repetir los tres addCase en cada slice.
// - onFulfilled(state, action): logica especifica al resolver (guardar payload, etc.).
// - El error toma action.payload (rejectWithValue) o, si no hay, action.error.message.
export function addAsyncCases(builder, thunk, { fulfilled, pending, rejected } = {}) {
  builder
    .addCase(thunk.pending, (state, action) => {
      state.status = STATUS.LOADING;
      state.error = null;
      pending?.(state, action);
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state.status = STATUS.SUCCEEDED;
      fulfilled?.(state, action);
    })
    .addCase(thunk.rejected, (state, action) => {
      state.status = STATUS.FAILED;
      state.error = action.payload ?? action.error?.message ?? "Ocurrio un error";
      rejected?.(state, action);
    });
}
