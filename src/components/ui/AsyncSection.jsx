import { Alert } from "./Alert.jsx";
import { STATUS } from "@/utils/asyncStatus.js";

// Feedback unificado de carga/error para las pantallas que consumen un thunk async.
// loading  -> <Alert tone="loading">; failed -> <Alert tone="error">; resto -> children.
// Asi todas las pantallas muestran el mismo banner en lugar de <p> sueltos o nada.
export function AsyncSection({ status, error, loadingMessage = "Cargando...", size = "md", children }) {
  if (status === STATUS.LOADING) {
    return (
      <Alert tone="loading" size={size}>
        {loadingMessage}
      </Alert>
    );
  }
  if (status === STATUS.FAILED) {
    return (
      <Alert tone="error" size={size}>
        {error || "Ocurrio un error. Intenta nuevamente."}
      </Alert>
    );
  }
  return children;
}
