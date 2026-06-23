import React, { useState } from 'react';
import ReportFilterBar from './component/ReportFilterBar';
import LoadingState from './component/LoadingState';
import ErrorState from './component/ErrorState';
import KPIsGrid from './component/KPIsGrid';
import DataTable from './component/DataTable';
import { useReportesGenerales } from './hooks/useReportesGenerales';
import type { ReportFilter } from './types';

const TABLE_COLUMNS = [
  { key: 'fecha', label: 'Fecha', align: 'left' as const },
  { key: 'servicio', label: 'Servicio', align: 'left' as const },
  { key: 'total_consultas', label: 'Consultas', align: 'center' as const }
];

export default function GenerarReportesGenerales(): JSX.Element {
  const [filters, setFilters] = useState<ReportFilter | null>(null);
  const {
    loading,
    error,
    kpis,
    data
  } = useReportesGenerales(filters);

  const handleApplyFilters = (newFilters: { fecha_inicio: string; fecha_fin: string }) => {
    setFilters(newFilters as ReportFilter);
  };

  const handleRetry = () => {
    if (filters) {
      setFilters({ ...filters });
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--hc-bg)' }}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--on-surface)' }}>Reportes Generales</h1>
          <p className="mt-2" style={{ color: 'var(--on-surface-variant)' }}>Estadisticas de consultas medicas y servicios</p>
        </div>

        {/* Filter Bar */}
        <div className="mb-8">
          <ReportFilterBar onApply={handleApplyFilters} />
        </div>

        {/* Error State */}
        {error && !loading && (
          <div className="mb-6">
            <ErrorState error={error} onRetry={handleRetry} />
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingState message="Cargando estadisticas..." />}

        {/* KPIs Grid + Data Table */}
        {kpis && !loading && !error && (
          <div className="space-y-8">
            <KPIsGrid
              title="Metricas Principales (KPIs)"
              metrics={[
                { value: kpis.totalConsultas, label: 'Total Consultas', trend: 'up', delta: 12 },
                { value: kpis.consultasPromedioDia, label: 'Prom. Consultas/Dia', trend: 'neutral' },
                { value: kpis.diagnosticosFrecuentes.length, label: 'Diagnosticos Unicos', trend: 'up', delta: 5 },
                { value: kpis.serviciosMasUsados.length, label: 'Servicios Activos', trend: 'neutral' },
              ]}
            />
            <DataTable
              title="Datos Detallados"
              columns={TABLE_COLUMNS}
              rows={data?.rows?.slice(0, 10) || []}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !kpis && (
          <div className="rounded-lg border border-dashed p-12 text-center" style={{ borderColor: 'var(--outline)' }}>
            <p style={{ color: 'var(--on-surface-variant)' }}>Selecciona un rango de fechas para ver estadisticas</p>
          </div>
        )}
      </div>
    </div>
  );
}
