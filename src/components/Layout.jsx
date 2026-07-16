import { LogOut, Search, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectIsAdmin } from "@/features/auth/authSlice.js";
import { clearCart, loadCart, selectCartCount } from "@/features/cart/cartSlice.js";
import { setSearch } from "@/features/catalog/catalogSlice.js";
import { Logo } from "@/components/Logo.jsx";

export function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartCount = useSelector(selectCartCount);
  const search = useSelector((state) => state.catalog.filters.search);
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const isAdmin = useSelector(selectIsAdmin);
  const [authNotice, setAuthNotice] = useState("");

  useEffect(() => {
    if (!authNotice) return undefined;
    const timeout = window.setTimeout(() => setAuthNotice(""), 2400);
    return () => window.clearTimeout(timeout);
  }, [authNotice]);

  // Hidrata el carrito server-side al iniciar sesión (no-op en modo mock o sin token).
  useEffect(() => {
    dispatch(loadCart());
  }, [dispatch, token]);

  function handleSearch(value) {
    dispatch(setSearch(value));
    navigate("/");
  }

  function handleLogout() {
    dispatch(logout());
    dispatch(clearCart());
    setAuthNotice("Sesion cerrada correctamente");
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="flex min-h-screen w-full flex-col bg-paper">
        <header className="sticky top-0 z-20 border-b border-line bg-white">
          <div className="grid min-h-14 w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:gap-5 md:px-8 lg:px-12">
            <Link to="/" className="flex items-center hover:opacity-90" aria-label="PadelStore">
              <Logo />
            </Link>

            <label className="mx-auto hidden w-full max-w-lg items-center gap-2 rounded border border-line bg-paper px-3 py-2 text-xs text-neutral-500 sm:flex">
              <Search size={14} />
              <input
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
                className="w-full bg-transparent outline-none"
                placeholder="Buscar para tu club: palas, pelotas, redes..."
              />
            </label>

            <nav className="flex items-center justify-end gap-3 text-xs font-semibold sm:gap-4">
              {!isAdmin && (
                <NavLink to="/pedidos" className="hidden hover:text-forest sm:inline">
                  Mis pedidos
                </NavLink>
              )}
              {isAdmin && (
                <NavLink to="/admin" className="hidden hover:text-forest sm:inline">
                  Admin
                </NavLink>
              )}
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="focus-ring inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-paper hover:text-forest"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              ) : (
                <NavLink to="/login" className="hover:text-forest">
                  Ingresar
                </NavLink>
              )}
              {!isAdmin && (
                <NavLink to="/carrito" className="relative rounded p-1 hover:bg-paper" aria-label="Carrito">
                  <ShoppingCart size={18} />
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-forest px-1 text-[10px] text-white">
                    {cartCount}
                  </span>
                </NavLink>
              )}
            </nav>
          </div>

          <div className="border-t border-line px-4 py-3 sm:hidden">
            <label className="flex w-full items-center gap-2 rounded border border-line bg-paper px-3 py-2 text-xs text-neutral-500">
              <Search size={14} />
              <input
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
                className="w-full bg-transparent outline-none"
                placeholder="Buscar para tu club: palas, pelotas, redes..."
              />
            </label>
          </div>

          {authNotice && (
            <div className="border-t border-mint bg-mint px-4 py-2 text-center text-xs font-semibold text-forest">
              {authNotice}
            </div>
          )}
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="mt-auto bg-ink px-4 py-6 text-[11px] text-white md:px-8 lg:px-12">
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-white/90">
                De la cancha al kiosco. Abastecemos clubes de pádel.
              </p>
              <span className="text-white/55">© 2026 PadelStore · Grupo 7 · UADE</span>
            </div>
            <div className="flex gap-5 text-white/70">
              <a href="#" className="hover:text-white hover:underline">
                Terminos
              </a>
              <a href="#" className="hover:text-white hover:underline">
                Privacidad
              </a>
              <a href="#" className="hover:text-white hover:underline">
                Contacto
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
