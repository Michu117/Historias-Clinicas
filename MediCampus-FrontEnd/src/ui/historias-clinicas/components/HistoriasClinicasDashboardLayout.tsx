import React from "react";
import { SideNavBar } from "../../agendas/component/shared/SideNavBar";

interface HistoriasClinicasDashboardLayoutProps {
  children: React.ReactNode;
}

export const HistoriasClinicasDashboardLayout = ({
  children,
}: HistoriasClinicasDashboardLayoutProps) => {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--hc-bg)' }}>
      <SideNavBar />
      <main className="flex-1 ml-60 h-screen overflow-y-auto">
        <section className="mx-auto flex h-full w-full max-w-[1600px] flex-col gap-5 px-6 py-6">
          {children}
        </section>
      </main>
    </div>
  );
};

export default HistoriasClinicasDashboardLayout;
