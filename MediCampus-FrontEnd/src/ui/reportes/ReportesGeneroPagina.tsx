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

  // Memoización optimizada del gráfico
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reportes por Género</h1>
          <p className="mt-2 text-gray-600">
            Análisis epidemiológico de consultas distribuidas por género del paciente
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
        {loading && <LoadingState message="Cargando estadísticas por género..." />}

        {/* Charts and Statistics */}
        {!loading && !error && genderData && memoizedChartData && (
          <div className="space-y-8">
            {/* Chart Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                title="Distribución de Consultas por Género (Pastel)"
                type="pie"
                data={memoizedChartData}
                showLegend={true}
                height={300}
              />

              {/* Statistics Table */}
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas Detalladas</h3>
                <div className="space-y-3">
                  {genderData &&
                    Object.entries(genderData).map(([key, value]: [string, any]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{getGenderLabel(key)}</p>
                          <p className="text-sm text-gray-600">
                            {value.count} consulta{value.count !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{value.percent}%</p>
                          <p className="text-xs text-gray-500">del total</p>
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
          <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-600">Selecciona un rango de fechas para ver estadísticas por género</p>
          </div>
        )}

        {!loading && !error && !genderData && !filters && (
          <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-600">Selecciona un rango de fechas para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}



