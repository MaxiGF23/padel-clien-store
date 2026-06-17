import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "@/features/auth/authSlice.js";
import { showToast } from "@/features/ui/toastSlice.js";
import { Button } from "@/components/Button.jsx";
import { Alert } from "@/components/ui/Alert.jsx";
import { Card } from "@/components/ui/Card.jsx";
import { FormField } from "@/components/ui/FormField.jsx";

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: "admin@example.com", password: "password" });

  async function handleSubmit(event) {
    event.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      navigate(location.state?.from || "/");
    }
  }

  return (
    <AuthShell>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <h1 className="text-2xl font-extrabold">Inicia sesion</h1>
          <p className="mt-2 text-sm text-neutral-500">Ingresa a tu cuenta para seguir comprando</p>
        </div>

        <FormField
          label="Email o usuario"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <FormField
          label="Contrasena"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <Link to="/registro" className="block text-right text-xs font-bold text-forest">
          Olvidaste tu contrasena?
        </Link>

        {status === "loading" && <Alert tone="loading">Validando credenciales...</Alert>}
        {status === "failed" && <Alert tone="error">No pudimos iniciar sesion. {error}</Alert>}

        <Button className="w-full" disabled={status === "loading"}>
          {status === "loading" ? "Ingresando..." : "Ingresar"}
        </Button>
        <p className="text-center text-sm text-neutral-500">
          No tenes cuenta?{" "}
          <Link className="font-bold text-forest" to="/registro">
            Registrate
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [accepted, setAccepted] = useState(false);
  const [form, setForm] = useState({
    username: "messi",
    email: "messi@example.com",
    telefono: "1199999999",
    password: "",
    nombre: "Lionel",
    apellido: "Messi"
  });

  async function handleSubmit(event) {
    event.preventDefault();
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      // El registro no devuelve token: iniciamos sesión automáticamente para obtenerlo
      // (sin token, el carrito y el checkout no pueden operar contra el backend).
      const loginResult = await dispatch(loginUser({ email: form.email, password: form.password }));
      if (loginUser.fulfilled.match(loginResult)) {
        dispatch(
          showToast({ type: "success", message: `Cuenta creada con exito. Bienvenido, ${result.payload.nombre}!` })
        );
        navigate("/");
      } else {
        dispatch(showToast({ type: "success", message: "Cuenta creada. Inicia sesion para continuar." }));
        navigate("/login");
      }
    }
  }

  return (
    <AuthShell>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <h1 className="text-2xl font-extrabold">Crear cuenta</h1>
          <p className="mt-2 text-sm text-neutral-500">Sumate a la comunidad PadelStore</p>
        </div>

        {["username", "email", "telefono", "password"].map((field) => (
          <FormField
            key={field}
            capitalize
            label={field}
            type={field === "password" ? "password" : "text"}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          />
        ))}

        <label className="flex items-center gap-2 text-xs text-neutral-600">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            className="accent-forest"
          />
          Acepto los terminos y condiciones
        </label>

        {status === "loading" && <Alert tone="loading">Creando cuenta...</Alert>}
        {status === "failed" && <Alert tone="error">No pudimos crear la cuenta. {error}</Alert>}

        <Button className="w-full" disabled={!accepted || status === "loading"}>
          {status === "loading" ? "Creando..." : "Crear cuenta"}
        </Button>
      </form>
    </AuthShell>
  );
}

function AuthShell({ children }) {
  return (
    <section className="flex min-h-[calc(100vh-112px)] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm p-7 shadow-soft">{children}</Card>
    </section>
  );
}
