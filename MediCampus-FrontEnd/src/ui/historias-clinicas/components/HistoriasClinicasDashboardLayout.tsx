import { useNavigate } from 'react-router-dom';

interface HistoriasClinicasDashboardLayoutProps {
  children: React.ReactNode;
}

export const HistoriasClinicasDashboardLayout = ({
  children,
}: HistoriasClinicasDashboardLayoutProps) => {
  const navigate = useNavigate();
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
            <a onClick={() => navigate('/historias')} className="flex cursor-pointer items-center gap-3 rounded-lg border-l-4 border-[#003f87] bg-[#d7e2ff] px-4 py-3 text-[14px] font-semibold text-[#001a40]">
              <span className="material-symbols-outlined text-[20px] text-[#003f87]">
                clinical_notes
              </span>
              Historias Clínicas
            </a>
          </nav>

          <div className="mt-auto border-t border-[#c2c6d4] px-6 pt-5 pb-3">
            <div className="flex flex-col gap-0.5">
              <button type="button" onClick={() => navigate('/')} className="flex w-full items-center gap-3 bg-transparent p-0 text-[16px] font-bold text-red-600 hover:text-red-700">
                <span className="material-symbols-outlined text-[22px] text-red-600">logout</span>
                Cerrar sesión
              </button>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col overflow-hidden bg-[#faf9ff]">

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <section className="mx-auto flex h-full w-full max-w-[1600px] flex-col gap-5">
              {children}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
};

export default HistoriasClinicasDashboardLayout;