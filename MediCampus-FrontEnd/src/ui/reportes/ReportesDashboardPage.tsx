import React, { useState } from 'react';
import ReportFilterBar from './component/ReportFilterBar';
import LoadingState from './component/LoadingState';
import ErrorState from './component/ErrorState';
import KPIsGrid, { MetricDef } from './component/KPIsGrid';
import ChartConsultasFecha from './component/ChartConsultasFecha';
import ChartConsultasGenero from './component/ChartConsultasGenero';
import DataTable from './component/DataTable';
import { useReportesDashboard } from './hooks/useReportesDashboard';
import reportService from './service/reportService';
import type { ReportFilter, DateRangePreset } from './types';

function defaultDateRange(): { fecha_inicio: string; fecha_fin: string } {
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);
  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  return { fecha_inicio: fmt(ayer), fecha_fin: fmt(hoy) };
}

const TABLE_COLUMNS = [
  { key: 'servicio', label: 'Servicio', align: 'left' as const },
  { key: 'total_consultas', label: 'Consultas', align: 'center' as const },
  { key: 'fecha', label: 'Periodo', align: 'left' as const },
];

export default function ReportesDashboardPage(): JSX.Element {
  const [filters, setFilters] = useState<ReportFilter>(() => {
    const { fecha_inicio, fecha_fin } = defaultDateRange();
    return { fecha_inicio, fecha_fin, dateRange: 'year' };
  });
  const [isExporting, setIsExporting] = useState<'idle' | 'csv' | 'pdf' | 'done' | 'error'>('idle');
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  const {
    loading,
    error,
    kpis,
    byGenderData,
    tableData,
    serviciosData,
  } = useReportesDashboard(filters);

  const tableRows = tableData?.rows ?? [];

  const handleApplyFilters = (newFilters: {
    fecha_inicio: string;
    fecha_fin: string;
    dateRange: DateRangePreset;
    servicioId: string;
  }) => {
    setFilters({
      fecha_inicio: newFilters.fecha_inicio,
      fecha_fin: newFilters.fecha_fin,
      dateRange: newFilters.dateRange,
      servicioId: newFilters.servicioId || null,
    });
  };

  const handleRetry = () => {
    if (filters) {
      setFilters({ ...filters });
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!filters) return;
    setIsExporting(format);
    setExportMsg(null);

    try {
      const payload = {
        tipo: 'general',
        fecha_inicio: filters.fecha_inicio,
        fecha_fin: filters.fecha_fin,
        servicio: filters.servicioId || undefined,
        format,
      };

      const res = await reportService.downloadExport(payload);

      if (!res || !res.success) {
        setIsExporting('error');
        setExportMsg(res?.message || 'Error al exportar');
        return;
      }

      setIsExporting('done');
      setExportMsg(format === 'csv' ? 'CSV descargado' : 'PDF descargado');
    } catch (err: any) {
      setIsExporting('error');
      setExportMsg(err?.message || 'Error de red al exportar');
    }
  };

  // --- Constructor Dinamico de Metricas para el KPIsGrid ---
const buildDynamicMetrics = (): MetricDef[] => {
  if (!kpis) return [];

  const totalConsultasGlobal = kpis.totalConsultas ?? 0;

  // 1. Si hay filtro de servicio, retornamos SOLO la tarjeta del servicio resaltada
  if (filters.servicioId) {
    const servicioSeleccionado = tableRows[0];
    console.log('Consultas: ' + (servicioSeleccionado?.total_consultas ?? 0));
    return [
      {
        value: servicioSeleccionado ? (servicioSeleccionado.total_consultas ?? servicioSeleccionado.cantidad ?? 0) : 0,
        label: `Total de consultas`,
        trend: 'neutral',
        highlight: true
      }
    ];
  }

  // 2. Si NO hay filtro, retornamos la vista por defecto (Global + Lista de servicios)
  const baseMetrics: MetricDef[] = [
    { value: totalConsultasGlobal, label: 'Consultas Totales', trend: 'up' }
  ];

  const tarjetasServicios = tableRows.map((row: any): MetricDef => ({
    value: row.total_consultas ?? row.cantidad ?? 0,
    label: `Consulta ${row.servicio}`,
    trend: 'neutral'
  }));

  return [...baseMetrics, ...tarjetasServicios];
};

  return (
    <div style={{ backgroundColor: 'var(--hc-bg)', color: 'var(--hc-text)' }} className="h-screen flex overflow-hidden w-full font-['Inter']">

      {/* --- SIDENAVBAR (Panel Izquierdo Fijo) --- */}
      <aside className="hidden md:flex flex-col h-screen w-[280px] p-6 space-y-2 shrink-0" style={{ backgroundColor: '#f1f3ff', borderRight: '1px solid #c2c6d4' }}>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#003f87] flex items-center justify-center text-white font-bold">MC</div>
          <div>
            <h1 className="text-[20px] font-bold text-[#003f87] leading-tight">MediCampus</h1>
            <p className="text-[12px] font-semibold" style={{ color: '#424752' }}>Dashboard Clinico</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <a className="flex items-center gap-3 px-4 py-3 transition-all rounded-lg cursor-pointer duration-200" style={{ color: '#424752' }}>
            <span className="material-symbols-outlined">calendar_today</span>
            <span className="text-[14px] font-semibold">Agenda</span>
          </a>
          <a className="flex items-center gap-3 rounded-lg px-4 py-3 border-l-4 border-[#003f87] cursor-pointer duration-200" style={{ backgroundColor: '#d7e2ff', color: '#001a40' }}>
            <span className="material-symbols-outlined text-[#003f87]">analytics</span>
            <span className="text-[14px] font-semibold">Reportes</span>
          </a>
        </nav>

        <div className="mt-auto pt-6 space-y-1" style={{ borderTop: '1px solid #c2c6d4' }}>
          <a className="flex items-center gap-3 text-red-600 px-4 py-3 hover:bg-red-50 transition-all rounded-lg cursor-pointer duration-200">
            <span className="material-symbols-outlined text-red-600">logout</span>
            <span className="text-[16px] font-bold">Cerrar Sesion</span>
          </a>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA (Area con scroll) --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden" style={{ backgroundColor: 'var(--hc-bg)' }}>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1400px] mx-auto">

            {/* TITULO Y ACCIONES DE EXPORTACION */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
              <div>
                <h2 className="text-[32px] font-bold mb-2" style={{ color: 'var(--hc-text)' }}>Reportes Dashboard</h2>
                <p className="text-[16px]" style={{ color: '#424752' }}>Panorama estadistico de las operaciones clinicas.</p>
              </div>

              {filters && !loading && !error && (
                <div className="flex items-center gap-3 p-2 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--surface-container-lowest)', border: '1px solid #c2c6d4' }}>
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={isExporting === 'csv'}
                    className="bg-transparent font-semibold text-[14px] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    style={{ border: '1px solid #0056b3', color: '#0056b3' }}
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    {isExporting === 'csv' ? 'Exportando...' : 'Exportar CSV'}
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting === 'pdf'}
                    className="text-white font-semibold text-[14px] px-4 py-2 rounded-lg flex items-center gap-2 transition-opacity shadow-sm disabled:opacity-50"
                    style={{ backgroundColor: '#0056b3' }}
                  >
                    <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                    {isExporting === 'pdf' ? 'Exportando...' : 'Exportar PDF'}
                  </button>
                  {exportMsg && (
                    <span className={`text-sm font-medium px-2 ${isExporting === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                      {exportMsg}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* BARRA DE FILTROS (Fecha Inicio, Fin, Servicio) */}
            <div className="mb-8">
              <ReportFilterBar onApply={handleApplyFilters} />
            </div>

            {/* ===== BENTO GRID CANVAS (12 columnas) ===== */}
            <div className="grid grid-cols-12 gap-6">

              {/* --- Estado de Error --- */}
              {error && !loading && (
                <div className="col-span-12">
                  <ErrorState error={error} onRetry={handleRetry} />
                </div>
              )}

              {/* --- Estado de Carga --- */}
              {loading && (
                <div className="col-span-12">
                  <LoadingState message="Cargando datos del dashboard..." />
                </div>
              )}

              {/* --- KPIs Metricas Principales (Ancho completo dinamico) --- */}
              {kpis && !loading && !error && (
                <div className="col-span-12">
                  <KPIsGrid
                    title="Metricas Principales"
                    metrics={buildDynamicMetrics()}
                  />
                </div>
              )}

              {/* --- Grafico de Genero (Ocupa ancho completo o media pantalla segun prefieras) --- */}
              {!loading && !error && (
                <div className="col-span-12 lg:col-span-6">
                  <ChartConsultasGenero
                    data={byGenderData}
                    loading={loading}
                    error={error}
                  />
                </div>
              )}

              {/* El grafico de fechas se queda abajo en col-span-12 o col-span-6 si quieres balancearlo con Genero */}

              {/* --- Grafico de Consultas por Servicio --- */}
              {!loading && !error && (
                <div className="col-span-12">
                  <ChartConsultasFecha
                    data={serviciosData}
                    loading={loading}
                    error={error}
                  />
                </div>
              )}

              {/* --- Tabla de detalle de Atenciones (Ancho Completo) --- */}
              {!loading && !error && tableRows.length > 0 && (
                <div className="col-span-12">
                  <DataTable
                    title="Detalle de Atenciones"
                    columns={TABLE_COLUMNS}
                    rows={tableRows}
                  />
                </div>
              )}

              {/* --- Estado Vacio --- */}
              {!loading && !error && !kpis && !filters && (
                <div className="col-span-12">
                  <div className="rounded-xl p-12 text-center" style={{ backgroundColor: 'var(--surface-container-lowest)', border: '1px dashed #c2c6d4' }}>
                    <p style={{ color: '#424752' }}>Selecciona un rango de fechas para ver las estadisticas</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>

    </div>
  );
}
