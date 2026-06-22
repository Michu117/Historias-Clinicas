import { useNavigate } from 'react-router-dom';
import React from "react";

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
          <div className="mt-auto">
        <button
          onClick={() => { localStorage.clear(); window.location.href = '/'; }}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm transition-all shadow-none outline-none ring-0"
          style={{ color: 'var(--primary)', backgroundColor: 'transparent' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-tertiary-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Cerrar Sesi&oacute;n</span>
        </button>
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