import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "@/features/auth/authSlice.js";
import { Button } from "@/components/Button.jsx";
export function LoginPage() {
  const dispatch = useDispatch(), navigate = useNavigate(), location = useLocation(), status = useSelector((s) => s.auth.status);
  const [form, setForm] = useState({ email: "messi@example.com", password: "barcelona" });
  async function handleSubmit(e) { e.preventDefault(); const result = await dispatch(loginUser(form)); if (loginUser.fulfilled.match(result)) navigate(location.state?.from || "/"); }
  return <AuthShell><form className="space-y-5" onSubmit={handleSubmit}><div><h1 className="text-2xl font-extrabold">Inicia sesion</h1><p className="mt-2 text-sm text-neutral-500">Ingresa a tu cuenta para seguir comprando</p></div><Input label="Email o usuario" value={form.email} onChange={(v) => setForm({ ...form, email: v })} /><Input label="Contrasena" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} /><Link to="/registro" className="block text-right text-xs font-bold text-forest">Olvidaste tu contrasena?</Link><Button className="w-full" disabled={status === "loading"}>{status === "loading" ? "Ingresando..." : "Ingresar"}</Button><p className="text-center text-sm text-neutral-500">No tenes cuenta? <Link className="font-bold text-forest" to="/registro">Registrate</Link></p></form></AuthShell>;
}
export function RegisterPage() {
  const dispatch = useDispatch(), navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [form, setForm] = useState({ username: "messi", email: "messi@example.com", telefono: "1199999999", password: "", nombre: "Lionel", apellido: "Messi" });
  async function handleSubmit(e) { e.preventDefault(); const result = await dispatch(registerUser(form)); if (registerUser.fulfilled.match(result)) navigate("/login"); }
  return <AuthShell><form className="space-y-4" onSubmit={handleSubmit}><div><h1 className="text-2xl font-extrabold">Crear cuenta</h1><p className="mt-2 text-sm text-neutral-500">Sumate a la comunidad PadelStore</p></div>{["username","email","telefono","password"].map((field) => <Input key={field} label={field} type={field === "password" ? "password" : "text"} value={form[field]} onChange={(v) => setForm({ ...form, [field]: v })} />)}<label className="flex items-center gap-2 text-xs text-neutral-600"><input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="accent-forest" />Acepto los terminos y condiciones</label><Button className="w-full" disabled={!accepted}>Crear cuenta</Button></form></AuthShell>;
}
function AuthShell({ children }) { return <section className="flex min-h-[520px] items-center justify-center px-4 py-10"><div className="w-full max-w-sm rounded border border-line bg-white p-7 shadow-soft">{children}</div></section>; }
function Input({ label, value, onChange, type = "text" }) { return <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-500">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="focus-ring h-10 w-full rounded border border-line px-3 text-sm" /></label>; }
