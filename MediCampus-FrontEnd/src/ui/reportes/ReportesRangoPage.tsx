import React, { useState, useRef, useCallback, useEffect } from 'react';
import ChartConsultasRango from './component/ChartConsultasRango';
import ChartBrushNavigator from './component/ChartBrushNavigator';
import LoadingState from './component/LoadingState';
import ErrorState from './component/ErrorState';
import { useReportesRango } from './hooks/useReportesRango';
import type { ReportFilter } from './types';

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
    <div style={{ backgroundColor: 'var(--hc-bg)', color: 'var(--hc-text)' }} className="min-h-screen w-full font-['Inter']">
      <div className="max-w-[1400px] mx-auto p-6 md:p-8">
        <div className="mb-8">
          <h2 className="text-[32px] font-bold mb-2" style={{ color: 'var(--hc-text)' }}>
            Consultas por Rango de Fechas
          </h2>
          <p className="text-[16px]" style={{ color: 'var(--on-surface-variant)' }}>
            Visualizacion detallada de consultas apiladas por servicio.
          </p>
        </div>

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
    </div>
  );
}
