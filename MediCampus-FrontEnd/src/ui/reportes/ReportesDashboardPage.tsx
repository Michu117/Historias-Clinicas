import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../seguridad/context/AuthContext';
import { HamburgerMenuDropdown } from '../components/HamburgerMenuDropdown';
import type { NavItem } from '../components/HamburgerMenuDropdown';
import ReportFilterBar from './component/ReportFilterBar';
import LoadingState from './component/LoadingState';
import ErrorState from './component/ErrorState';
import KPIsGrid, { MetricDef } from './component/KPIsGrid';
import ChartConsultasFecha from './component/ChartConsultasFecha';
import ChartConsultasGenero from './component/ChartConsultasGenero';
import DataTable from './component/DataTable';
import PrintReportView, { type ServiciosConfig } from './print/PrintReportView';
import './print/print-report.css';
import { useReportesDashboard } from './hooks/useReportesDashboard';
import reportService from './service/reportService';
import type { ReportFilter, DateRangePreset } from './types';

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: '/seguridad/dashboard', match: '/seguridad/dashboard' },
  { label: 'Usuarios', icon: 'group', path: '/seguridad/users', match: '/seguridad/users' },
  { label: 'Auditoría', icon: 'assignment', path: '/seguridad/audit', match: '/seguridad/audit' },
  { label: 'Alertas', icon: 'notifications', path: '/seguridad/alerts', match: '/seguridad/alerts' },
  { label: 'Reportes', icon: 'reportes', path: '/reportes', match: '/reportes' },
] as const;

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

type ReportType = 'general' | 'servicio';

const PRINT_SERVICIOS_CONFIG: ServiciosConfig = {
  medica: { label: 'Médica', color: '#006766' },
  psicologica: { label: 'Psicológica', color: '#565e74' },
  odontologica: { label: 'Odontológica', color: '#595c5e' },
  social: { label: 'T. Social', color: '#3e4948' },
};

const TABLE_COLUMNS = [
  { key: 'servicio', label: 'Servicio', align: 'left' as const },
  { key: 'total_consultas', label: 'Consultas', align: 'center' as const },
  { key: 'fecha', label: 'Periodo', align: 'left' as const },
];

export default function ReportesDashboardPage(): JSX.Element {
  const navigate = useNavigate();
  const { isAdmin } = useAuthContext();

  useEffect(() => {
    if (!isAdmin) {
      const raw = localStorage.getItem('currentUser');
      let storedIsAdmin = false;
      if (raw) {
        try {
          const u = JSON.parse(raw);
          const roles = u.roles as Array<Record<string, unknown>> | null;
          const roleName = (roles?.[0]?.nombre as string) ?? '';
          storedIsAdmin = ['admin', 'administrador', 'Administrador'].includes(roleName);
        } catch {}
      }
      if (!storedIsAdmin) {
        navigate('/');
      }
    }
  }, [isAdmin, navigate]);

  const [filters, setFilters] = useState<ReportFilter>(() => {
    const { fecha_inicio, fecha_fin } = defaultDateRange();
    return { fecha_inicio, fecha_fin, dateRange: 'year' };
  });
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExporting, setIsExporting] = useState<'idle' | 'csv' | 'pdf' | 'done' | 'error'>('idle');
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const printTriggered = useRef(false);

  useEffect(() => {
    if (isPrinting && !printTriggered.current) {
      printTriggered.current = true;
      const handleAfterPrint = () => {
        setIsPrinting(false);
        printTriggered.current = false;
      };
      window.addEventListener('afterprint', handleAfterPrint);
      window.print();
      return () => window.removeEventListener('afterprint', handleAfterPrint);
    }
    if (!isPrinting) {
      printTriggered.current = false;
    }
  }, [isPrinting]);

  const reportType: ReportType = filters.servicioId ? 'servicio' : 'general';

  const {
    loading,
    error,
    kpis,
    byGenderData,
    tableData,
    serviciosData,
  } = useReportesDashboard(filters);

  const tableRows = tableData?.rows ?? [];
  const filteredRows = tableRows.filter(
    (r: any) => r.servicio && r.servicio !== '-' && r.total_consultas !== '-' && r.total_consultas !== 0
  );

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

    if (format === 'pdf') {
      setIsPrinting(true);
      return;
    }

    setIsExporting(format);
    setExportMsg(null);

    try {
      const payload = {
        tipo: reportType,
        fecha_inicio: filters.fecha_inicio,
        fecha_fin: filters.fecha_fin,
        servicio_id: filters.servicioId || undefined,
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

  const buildDynamicMetrics = (): MetricDef[] => {
    if (!kpis) return [];

    const totalConsultasGlobal = kpis.totalConsultas ?? 0;

    if (filters.servicioId) {
      return [
        {
          value: totalConsultasGlobal,
          label: `Total de consultas`,
          trend: 'neutral',
          highlight: true
        }
      ];
    }

    const baseMetrics: MetricDef[] = [
      { value: totalConsultasGlobal, label: 'Consultas Totales', trend: 'up' }
    ];

    const tarjetasServicios = filteredRows.map((row: any): MetricDef => ({
      value: row.total_consultas ?? row.cantidad ?? 0,
      label: `Consulta ${row.servicio}`,
      trend: 'neutral'
    }));

    return [...baseMetrics, ...tarjetasServicios];
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--hc-bg)' }}>
      {isPrinting && (
        <div className="print-only">
          <PrintReportView
            data={{ kpis, byGenderData, serviciosData, tableRows: filteredRows, filters, tableColumns: TABLE_COLUMNS }}
            config={{ servicios: PRINT_SERVICIOS_CONFIG }}
          />
        </div>
      )}

      <div className={`flex-1 flex flex-col h-screen overflow-hidden ${isPrinting ? 'no-print' : ''}`} style={{ backgroundColor: 'var(--hc-bg)' }}>
        <header
          className="h-16 flex items-center gap-3 px-6 shrink-0"
          style={{
            backgroundColor: 'var(--surface-container-lowest)',
            borderBottom: '1px solid var(--outline)',
          }}
        >
          <HamburgerMenuDropdown navItems={NAV_ITEMS} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--hc-text)' }}>Reportes</h2>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1400px] mx-auto">
            {filters && !loading && !error && (
                <div className="flex items-center gap-3 p-2 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={isExporting === 'csv'}
                    className="bg-transparent font-semibold text-[14px] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    style={{ border: '1px solid var(--primary)', color: 'var(--primary)' }}
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    {isExporting === 'csv' ? 'Exportando...' : 'Exportar CSV'}
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting === 'pdf'}
                    className="text-white font-semibold text-[14px] px-4 py-2 rounded-lg flex items-center gap-2 transition-opacity shadow-sm disabled:opacity-50"
                    style={{ backgroundColor: 'var(--primary)' }}
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

            <div className="mb-8">
              <ReportFilterBar onApply={handleApplyFilters} />
            </div>

            <div className="grid grid-cols-12 gap-6">
              {error && !loading && (
                <div className="col-span-12">
                  <ErrorState error={error} onRetry={handleRetry} />
                </div>
              )}

              {loading && (
                <div className="col-span-12">
                  <LoadingState message="Cargando datos del dashboard..." />
                </div>
              )}

              {kpis && !loading && !error && (
                <div className="col-span-12">
                  <KPIsGrid
                    title="Metricas Principales"
                    metrics={buildDynamicMetrics()}
                  />
                </div>
              )}

              {!loading && !error && (
                <div className={`${reportType === 'servicio' ? 'col-span-12' : 'col-span-12 lg:col-span-6'}`}>
                  <ChartConsultasGenero
                    data={byGenderData}
                    loading={loading}
                    error={error}
                  />
                </div>
              )}

              {!loading && !error && reportType === 'general' && (
                <div className="col-span-12 lg:col-span-6">
                  <ChartConsultasFecha
                    data={serviciosData}
                    loading={loading}
                    error={error}
                  />
                </div>
              )}

              {!loading && !error && reportType === 'general' && filteredRows.length > 0 && (
                <div className="col-span-12">
                  <DataTable
                    title="Detalle de Atenciones"
                    columns={TABLE_COLUMNS}
                    rows={filteredRows}
                  />
                </div>
              )}

              {!loading && !error && !kpis && !filters && (
                <div className="col-span-12">
                  <div className="rounded-xl p-12 text-center" style={{ backgroundColor: 'var(--surface-container-lowest)', border: '1px dashed var(--outline)' }}>
                    <p style={{ color: 'var(--on-surface-variant)' }}>Selecciona un rango de fechas para ver las estadisticas</p>
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
