import React, { useState } from 'react';
import ReportFilterBar from './component/ReportFilterBar';
import ReportDataTable from './component/ReportDataTable';
import LoadingState from './component/LoadingState';
import ErrorState from './component/ErrorState';
import { useReportesServicio } from './hooks/useReportesServicio';
import { useRolePermissions } from './hooks/useRolePermissions';
import type { ReportFilter } from './types';

interface ReportesServicioPageProps {
  servicioId: string;
  filters: ReportFilter | null;
  userRole?: 'IsAdmin' | 'IsMedico' | 'IsPaciente' | 'IsEnfermera';
}

const TABLE_COLUMNS = [
  { key: 'fecha', label: 'Fecha', sortable: true, align: 'left' as const },
  { key: 'servicio', label: 'Servicio', align: 'left' as const },
  { key: 'profesional', label: 'Profesional', align: 'left' as const },
  { key: 'consultas', label: 'Consultas', sortable: true, align: 'center' as const }
];

export default function ReportesServicioPage({
  servicioId,
  filters: initialFilters,
  userRole = 'IsMedico'
}: ReportesServicioPageProps): JSX.Element {
  const [filters, setFilters] = useState<ReportFilter | null>(initialFilters);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);

  const permissions = useRolePermissions(userRole);
  const { loading, error, filteredData, pagination } = useReportesServicio(
    servicioId,
    filters,
    page,
    10
  );

  if (!permissions.canViewReports) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700 font-medium">No tienes permiso para ver los reportes</p>
        </div>
      </div>
    );
  }

  const handleApplyFilters = (newFilters: { fecha_inicio: string; fecha_fin: string }) => {
    setFilters(newFilters as ReportFilter);
    setPage(1);
  };

  const handleRetry = () => {
    if (filters) {
      setFilters({ ...filters });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reporte por Servicio</h1>
          <p className="mt-2 text-gray-600">Servicios ID: {servicioId}</p>
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
        {loading && <LoadingState message="Cargando datos del servicio..." />}

        {/* Data Table */}
        {!loading && !error && filteredData && pagination && (
          <div className="space-y-6">
            <ReportDataTable
              title={`Datos del Servicio (${filteredData.length} registros)`}
              columns={TABLE_COLUMNS}
              data={filteredData}
              pagination={pagination}
              onPageChange={handlePageChange}
              onSort={handleSort}
              allowExport={permissions.canExportReports}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !filteredData?.length && filters && (
          <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-600">No hay datos para este servicio en el período seleccionado</p>
          </div>
        )}
      </div>
    </div>
  );
}


