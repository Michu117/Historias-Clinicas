import React, { useState } from 'react';
import ReportFilterBar from './component/ReportFilterBar';
import ChartContainer from './component/ChartContainer';
import AuditInfo from './component/AuditInfo';
import LoadingState from './component/LoadingState';
import ErrorState from './component/ErrorState';
import { useReportesGenero } from './hooks/useReportesGenero';
import { useMemoizedChartData } from './hooks/useMemoizedChartData';
import type { ReportFilter } from './types';

interface ReportesGeneroPaginaProps {
  filters?: ReportFilter | null;
}

export default function ReportesGeneroPagina({
  filters: initialFilters
}: ReportesGeneroPaginaProps): JSX.Element {
  const [filters, setFilters] = useState<ReportFilter | null>(initialFilters || null);
  const { loading, error, genderData, chartData, timestamp, queryDuration } = useReportesGenero(filters);

  // Memoizacion optimizada del grafico
  const memoizedChartData = useMemoizedChartData(genderData, 'gender', [genderData]);

  const handleApplyFilters = (newFilters: { fecha_inicio: string; fecha_fin: string }) => {
    setFilters(newFilters as ReportFilter);
  };

  const handleRetry = () => {
    if (filters) {
      setFilters({ ...filters });
    }
  };

  const getGenderLabel = (key: string): string => {
    const labels: Record<string, string> = {
      male: 'Hombres',
      female: 'Mujeres',
      other: 'Otro'
    };
    return labels[key] || key;
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--hc-bg)' }}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--on-surface)' }}>Reportes por Genero</h1>
          <p className="mt-2" style={{ color: 'var(--on-surface-variant)' }}>
            Analisis epidemiologico de consultas distribuidas por genero del paciente
          </p>
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
        {loading && <LoadingState message="Cargando estadisticas por genero..." />}

        {/* Charts and Statistics */}
        {!loading && !error && genderData && memoizedChartData && (
          <div className="space-y-8">
            {/* Chart Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                title="Distribucion de Consultas por Genero (Pastel)"
                type="pie"
                data={memoizedChartData}
                showLegend={true}
                height={300}
              />

              {/* Statistics Table */}
              <div className="rounded-lg shadow-sm p-6" style={{ border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-lowest)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>Estadisticas Detalladas</h3>
                <div className="space-y-3">
                  {genderData &&
                    Object.entries(genderData).map(([key, value]: [string, any]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 rounded-lg transition-colors"
                        style={{ backgroundColor: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)' }}
                      >
                        <div className="flex-1">
                          <p className="font-medium" style={{ color: 'var(--on-surface)' }}>{getGenderLabel(key)}</p>
                          <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>
                            {value.count} consulta{value.count !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{value.percent}%</p>
                          <p className="text-xs" style={{ color: 'var(--card-text-muted)' }}>del total</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Audit Info Card */}
            <AuditInfo
              timestamp={timestamp}
              queryDuration={queryDuration}
              resultCount={genderData ? Object.keys(genderData).length : 0}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !genderData && filters && (
          <div className="rounded-lg border border-dashed p-12 text-center" style={{ borderColor: 'var(--outline)' }}>
            <p style={{ color: 'var(--on-surface-variant)' }}>Selecciona un rango de fechas para ver estadisticas por genero</p>
          </div>
        )}

        {!loading && !error && !genderData && !filters && (
          <div className="rounded-lg border border-dashed p-12 text-center" style={{ borderColor: 'var(--outline)' }}>
            <p style={{ color: 'var(--on-surface-variant)' }}>Selecciona un rango de fechas para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}
