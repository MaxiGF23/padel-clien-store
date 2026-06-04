import { SearchX } from "lucide-react";
import { Button } from "@/components/Button.jsx";
export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <div className="mx-auto max-w-md rounded border border-line bg-white p-10 text-center">
        <SearchX className="mx-auto h-12 w-12 text-neutral-400" />
        <h1 className="mt-4 text-3xl font-extrabold">404</h1>
        <p className="mt-1 font-semibold text-neutral-700">Pagina no encontrada</p>
        <p className="mt-2 text-sm text-neutral-500">La pagina que buscas no existe o fue movida.</p>
        <Button to="/" className="mt-6">
          Volver al inicio
        </Button>
      </div>
    </section>
  );
}
