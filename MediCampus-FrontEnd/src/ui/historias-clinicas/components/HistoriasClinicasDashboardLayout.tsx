import { useNavigate } from 'react-router-dom';

interface HistoriasClinicasDashboardLayoutProps {
  children: React.ReactNode;
}

export const HistoriasClinicasDashboardLayout = ({
  children,
}: HistoriasClinicasDashboardLayoutProps) => {
  const navigate = useNavigate();
  return (
    <main className="h-screen overflow-hidden" style={{ backgroundColor: 'var(--hc-bg)', color: 'var(--hc-text)' }}>
      <div className="grid h-screen lg:grid-cols-[280px,1fr]">
        <aside
          className="hidden h-screen shrink-0 md:flex md:flex-col"
          style={{
            borderRight: '1px solid var(--outline)',
            backgroundColor: 'var(--surface-container-low)',
          }}
        >
          <div className="px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg text-white font-bold" style={{ backgroundColor: 'var(--primary)' }}>
                MC
              </div>
              <div>
                <h1 className="text-[20px] font-bold leading-tight" style={{ color: 'var(--on-primary-container)' }}>
                  MediCampus
                </h1>
                <p className="text-[12px] font-semibold" style={{ color: 'var(--on-surface-variant)' }}>
                  Historias Clínicas
                </p>
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-2 px-6 py-6">
            <a
              onClick={() => navigate('/historias')}
              className="flex cursor-pointer items-center gap-3 rounded-lg border-l-4 px-4 py-3 text-[14px] font-semibold"
              style={{
                borderColor: 'var(--primary)',
                backgroundColor: 'var(--primary-container)',
                color: 'var(--on-primary-container)',
              }}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--primary)' }}>
                clinical_notes
              </span>
              Historias Clínicas
            </a>
          </nav>

          <div className="mt-auto px-6 pt-5 pb-3" style={{ borderTop: '1px solid var(--outline)' }}>
            <div className="flex flex-col gap-0.5">
              <button type="button" onClick={() => navigate('/')} className="flex w-full items-center gap-3 bg-transparent p-0 text-[16px] font-bold text-red-600 hover:text-red-700">
                <span className="material-symbols-outlined text-[22px] text-red-600">logout</span>
                Cerrar sesión
              </button>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col overflow-hidden" style={{ backgroundColor: 'var(--hc-bg)' }}>
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
