export function Footer() {
  return (
    <footer className="mt-auto bg-ink px-4 py-4 text-[11px] text-white md:px-8 lg:px-12">
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 PadelStore · Grupo 7 · UADE</span>
        <div className="flex gap-5">
          <a href="#" className="hover:underline">
            Terminos
          </a>
          <a href="#" className="hover:underline">
            Privacidad
          </a>
          <a href="#" className="hover:underline">
            Contacto
          </a>
        </div>
      </div>
    </footer>
  );
}
