interface HistoriasClinicasDashboardLayoutProps {
  children: React.ReactNode;
}

export const HistoriasClinicasDashboardLayout = ({
  children,
}: HistoriasClinicasDashboardLayoutProps) => {
  return (
    <main className="h-screen overflow-hidden bg-[#faf9ff] text-[#141b2b] font-['Inter']">
      <div className="grid h-screen lg:grid-cols-[280px,1fr]">
        <aside className="hidden h-screen shrink-0 border-r border-[#c2c6d4] bg-[#f1f3ff] md:flex md:flex-col">
          <div className="px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#003f87] text-white font-bold">
                MC
              </div>

              <div>
                <h1 className="text-[20px] font-bold leading-tight text-[#003f87]">
                  MediCampus
                </h1>
                <p className="text-[12px] font-semibold text-[#424752]">
                  Historias Clínicas
                </p>
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-2 px-6 py-6">
            <a className="flex cursor-pointer items-center gap-3 rounded-lg border-l-4 border-[#003f87] bg-[#d7e2ff] px-4 py-3 text-[14px] font-semibold text-[#001a40]">
              <span className="material-symbols-outlined text-[20px] text-[#003f87]">
                clinical_notes
              </span>
              Historias Clínicas
            </a>
            <a className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-[14px] font-semibold text-[#424752] transition-all duration-200 hover:bg-[#e1e8fe]">
              <span className="material-symbols-outlined text-[20px]">
                history
              </span>
              Antecedentes
              </a>

            <a
                className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-[14px] font-semibold text-[#424752] transition-all duration-200 hover:bg-[#e1e8fe]"
            >
              <span className="material-symbols-outlined text-[20px]">
                folder_shared
              </span>
              Casos clínicos
              </a>
            <a
                className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-[14px] font-semibold text-[#424752] transition-all duration-200 hover:bg-[#e1e8fe]"
            >
              <span className="material-symbols-outlined text-[20px]">
                description
              </span>
              Documentos
              </a>

          </nav>

          <div className="mt-auto border-t border-[#c2c6d4] px-6 py-6">
            <div className="space-y-1">
              <button type="button" className="flex w-full cursor-pointer items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">help</span>
                Soporte
              </button>

              <button type="button" className="flex w-full cursor-pointer items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Cerrar sesión
              </button>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col overflow-hidden bg-[#faf9ff]">
          <header className="h-16 shrink-0 border-b border-[#c2c6d4] bg-white">
            <div className="flex h-full items-center gap-8 px-8">
              <div>
                <p className="text-[15px] font-bold leading-none text-[#003f87]">
                  MediCampus
                </p>
                <p className="text-[13px] font-bold leading-none text-[#003f87]">
                  Historias Clínicas
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-hidden px-8 py-6">
            <section className="mx-auto flex h-full w-full max-w-[1760px] flex-col gap-5">
              {children}
            </section>
          </div>

          <footer className="h-10 shrink-0 border-t border-[#c2c6d4] bg-white px-8 text-xs text-[#424752]">
            <div className="mx-auto flex h-full max-w-[1760px] items-center justify-between">
              <p>© 2026 MediCampus. Universidad Bienestar Estudiantil.</p>

              <div className="flex gap-4">
                <span>Políticas de Privacidad</span>
                <span>Soporte Técnico</span>
                <span>Términos de Uso</span>
              </div>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
};

export default HistoriasClinicasDashboardLayout;