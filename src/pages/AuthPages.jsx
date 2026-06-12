import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "@/features/auth/authSlice.js";
import { showToast } from "@/features/ui/toastSlice.js";
import { Button } from "@/components/Button.jsx";

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

        <Input label="Email o usuario" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
        <Input
          label="Contrasena"
          type="password"
          value={form.password}
          onChange={(value) => setForm({ ...form, password: value })}
        />

        <Link to="/registro" className="block text-right text-xs font-bold text-forest">
          Olvidaste tu contrasena?
        </Link>

        {status === "loading" && (
          <p className="rounded bg-mint px-3 py-2 text-xs font-semibold text-forest">Validando credenciales...</p>
        )}
        {status === "failed" && (
          <p className="rounded bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            No pudimos iniciar sesion. {error}
          </p>
        )}

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
      dispatch(
        showToast({ type: "success", message: `Cuenta creada con exito. Bienvenido, ${result.payload.nombre}!` })
      );
      navigate("/");
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
          <Input
            key={field}
            label={field}
            type={field === "password" ? "password" : "text"}
            value={form[field]}
            onChange={(value) => setForm({ ...form, [field]: value })}
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

        {status === "loading" && (
          <p className="rounded bg-mint px-3 py-2 text-xs font-semibold text-forest">Creando cuenta...</p>
        )}
        {status === "failed" && (
          <p className="rounded bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            No pudimos crear la cuenta. {error}
          </p>
        )}

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
      <div className="w-full max-w-sm rounded border border-line bg-white p-7 shadow-soft">{children}</div>
    </section>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold capitalize text-neutral-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring h-10 w-full rounded border border-line px-3 text-sm"
      />
    </label>
  );
}
