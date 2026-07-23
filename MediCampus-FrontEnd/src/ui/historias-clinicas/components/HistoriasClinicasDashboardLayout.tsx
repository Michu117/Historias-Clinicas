import React from "react";
import { HamburgerMenuDropdown } from "../../components/HamburgerMenuDropdown";

interface HistoriasClinicasDashboardLayoutProps {
  children: React.ReactNode;
}

export const HistoriasClinicasDashboardLayout = ({
  children,
}: HistoriasClinicasDashboardLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--hc-bg)' }}>
      <header
        className="flex items-center gap-3 h-16 px-6 border-b shrink-0"
        style={{
          backgroundColor: 'var(--surface-container-lowest)',
          borderBottom: '1px solid var(--outline)',
        }}
      >
        <HamburgerMenuDropdown />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--hc-text)' }}>Historias Clínicas</h2>
      </header>
      <main className="flex-1 overflow-y-auto">
        <section className="mx-auto flex h-full w-full max-w-[1600px] flex-col gap-5 px-6 py-6">
          {children}
        </section>
      </main>
    </div>
  );
};

export default HistoriasClinicasDashboardLayout;
