import { Outlet } from "react-router-dom";
import { Footer } from "@/components/Footer.jsx";
import { Navbar } from "@/components/Navbar.jsx";

export function Layout() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="flex min-h-screen w-full flex-col bg-paper">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
