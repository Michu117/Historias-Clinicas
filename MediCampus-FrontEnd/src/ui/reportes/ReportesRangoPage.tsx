import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SideNavBar } from '../agendas/component/shared/SideNavBar';
import type { NavItem } from '../agendas/component/shared/SideNavBar';
import ChartConsultasRango from './component/ChartConsultasRango';
import ChartBrushNavigator from './component/ChartBrushNavigator';
import LoadingState from './component/LoadingState';
import ErrorState from './component/ErrorState';
import { useReportesRango } from './hooks/useReportesRango';
import type { ReportFilter } from './types';

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: '/seguridad/dashboard', match: '/seguridad/dashboard' },
  { label: 'Usuarios', icon: 'group', path: '/seguridad/users', match: '/seguridad/users' },
  { label: 'Auditoría', icon: 'assignment', path: '/seguridad/audit', match: '/seguridad/audit' },
  { label: 'Alertas', icon: 'notifications', path: '/seguridad/alerts', match: '/seguridad/alerts' },
  { label: 'Reportes', icon: 'reportes', path: '/reportes', match: '/reportes' },
] as const;

const VISIBLE_DAYS = 30;

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ReportesRangoPage(): JSX.Element {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [startDate, setStartDate] = useState(fmtDate(thirtyDaysAgo));
  const [endDate, setEndDate] = useState(fmtDate(today));
  const [scrollPos, setScrollPos] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filters: ReportFilter = { fecha_inicio: startDate, fecha_fin: endDate };
  const { loading, error, data } = useReportesRango(filters);

  const totalDays = data?.total_dias ?? 0;

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setScrollPos(0);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setScrollPos(0);
  };

  const handleScrollChange = useCallback(
    (dayOffset: number) => {
      if (!scrollRef.current) return;
      scrollRef.current.scrollTo({ left: dayOffset * 50, behavior: 'smooth' });
      setScrollPos(dayOffset);
    },
    [],
  );

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const pos = Math.round(scrollRef.current.scrollLeft / 50);
    setScrollPos(pos);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--hc-bg)' }}>
      <SideNavBar navItems={NAV_ITEMS} />

      <div className="flex-1 ml-60 flex flex-col h-screen overflow-hidden" style={{ backgroundColor: 'var(--hc-bg)' }}>
        <header
          className="h-16 flex items-center px-6 shrink-0"
          style={{
            backgroundColor: 'var(--surface-container-lowest)',
            borderBottom: '1px solid var(--outline)',
          }}
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--hc-text)' }}>Reportes</h2>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1400px] mx-auto">

            <div className="rounded-xl shadow-sm p-6 mb-8" style={{ backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--on-surface-variant)' }}>
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    className="rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    style={{ border: '1px solid var(--outline)', backgroundColor: 'var(--surface-container-lowest)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--on-surface-variant)' }}>
                    Fecha fin
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    className="rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    style={{ border: '1px solid var(--outline)', backgroundColor: 'var(--surface-container-lowest)' }}
                  />
                </div>
              </div>
            </div>

            {error && !loading && (
              <div className="mb-6">
                <ErrorState error={error} onRetry={() => {}} />
              </div>
            )}

            {loading && (
              <LoadingState message="Cargando consultas por rango..." />
            )}

            {!loading && !error && (
              <>
                <div
                  ref={scrollRef}
                  className="overflow-x-auto"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  <ChartConsultasRango data={data} loading={false} error={null} />
                </div>

                {totalDays > VISIBLE_DAYS && (
                  <ChartBrushNavigator
                    totalDays={totalDays}
                    visibleDays={VISIBLE_DAYS}
                    scrollPosition={scrollPos}
                    onScrollChange={handleScrollChange}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
