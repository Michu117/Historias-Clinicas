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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reportes Generales</h1>
          <p className="mt-2 text-gray-600">Estadísticas de consultas médicas y servicios</p>
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
        {loading && <LoadingState message="Cargando estadísticas..." />}

        {/* KPIs Grid + Data Table */}
        {kpis && !loading && !error && (
          <div className="space-y-8">
            <KPIsGrid
              title="Métricas Principales (KPIs)"
              metrics={[
                { value: kpis.totalConsultas, label: 'Total Consultas', trend: 'up', delta: 12 },
                { value: kpis.consultasPromedioDia, label: 'Prom. Consultas/Día', trend: 'neutral' },
                { value: kpis.diagnosticosFrecuentes.length, label: 'Diagnósticos Únicos', trend: 'up', delta: 5 },
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
          <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-600">Selecciona un rango de fechas para ver estadísticas</p>
          </div>
        )}
      </div>
    </div>
  );
}

