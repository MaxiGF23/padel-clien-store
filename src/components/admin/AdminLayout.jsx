import { BarChart3, Boxes, FolderTree, LogOut, PackageCheck, Tags, Users } from "lucide-react";
import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/features/auth/authSlice.js";
import { fetchAdminData } from "@/features/admin/adminSlice.js";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: BarChart3, end: true },
  { to: "/admin/productos", label: "Productos", icon: Boxes },
  { to: "/admin/categorias", label: "Categorias", icon: FolderTree },
  { to: "/admin/cupones", label: "Cupones", icon: Tags },
  { to: "/admin/pedidos", label: "Pedidos", icon: PackageCheck },
  { to: "/admin/usuarios", label: "Usuarios", icon: Users }
];

export function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchAdminData());
  }, [dispatch]);

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#f4f4f3] text-ink">
      <div className="flex min-h-screen w-full">
        <aside className="hidden w-[184px] shrink-0 bg-[#214a35] px-4 py-7 text-white md:block">
          <NavLink to="/admin" className="block text-sm font-extrabold">
            PadelStore
          </NavLink>
          <nav className="mt-8 space-y-2">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex h-9 items-center gap-2 rounded px-3 text-xs font-semibold transition ${isActive ? "bg-[#4b9b61] text-white" : "text-white/80 hover:bg-white/10"}`
                }
              >
                <Icon size={14} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-line bg-white">
            <div className="flex min-h-14 items-center justify-between px-4 md:px-8">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest text-[10px] font-extrabold text-white">
                  PS
                </span>
                <span className="text-sm font-extrabold">Panel de Control</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint font-bold text-forest">
                  {user?.nombre?.[0] || "A"}
                  {user?.apellido?.[0] || "D"}
                </span>
                <span className="hidden font-semibold sm:inline">
                  {user?.nombre || "Admin"} {user?.apellido || "User"}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="focus-ring inline-flex h-8 items-center gap-1 rounded border border-line bg-white px-3 font-semibold hover:border-forest"
                >
                  <LogOut size={13} />
                  <span className="hidden sm:inline">Cerrar Sesion</span>
                </button>
              </div>
            </div>

            <nav className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2 md:hidden">
              {navItems.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `shrink-0 rounded px-3 py-2 text-xs font-semibold ${isActive ? "bg-[#214a35] text-white" : "bg-paper"}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </header>

          <main className="flex-1 px-4 py-8 md:px-10">
            <Outlet />
          </main>

          <footer className="bg-ink px-4 py-4 text-[11px] text-white/70 md:px-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>© 2026 PadelStore. Todos los derechos reservados.</span>
              <div className="flex gap-5">
                <a href="#" className="hover:text-white">
                  Terminos de Servicio
                </a>
                <a href="#" className="hover:text-white">
                  Politica de Privacidad
                </a>
                <a href="#" className="hover:text-white">
                  Contacto
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
