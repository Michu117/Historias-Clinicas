import React from 'react';
import ChartConsultasGenero from '../component/ChartConsultasGenero';
import ChartConsultasFecha from '../component/ChartConsultasFecha';
import DataTable from '../component/DataTable';
import type { ReportFilter } from '../types';

export type ServiciosConfig = Record<string, { label: string; color: string }>;

interface PrintViewData {
  kpis: any;
  byGenderData: any;
  serviciosData: any;
  tableRows: any[];
  filters: ReportFilter;
  tableColumns: { key: string; label: string; align?: 'left' | 'center' | 'right' }[];
}

interface PrintViewConfig {
  servicios: ServiciosConfig;
}

interface PrintReportViewProps {
  data: PrintViewData;
  config: PrintViewConfig;
}

function normalizeKey(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export default function PrintReportView({
  data,
  config,
}: PrintReportViewProps): JSX.Element {
  const { kpis, byGenderData, serviciosData, tableRows, filters, tableColumns } = data;
  const { servicios } = config;
  const totalConsultas = kpis?.totalConsultas ?? 0;

  const serviciosMap = new Map<string, number>();
  for (const row of tableRows) {
    const label = normalizeKey(row.servicio || '');
    const val = row.total_consultas ?? row.cantidad ?? 0;
    serviciosMap.set(label, (serviciosMap.get(label) ?? 0) + val);
  }
  if (serviciosMap.size === 0 && Array.isArray(serviciosData)) {
    for (const item of serviciosData) {
      const label = normalizeKey(item.servicio || '');
      serviciosMap.set(label, item.total ?? 0);
    }
  }

  return (
    <div className="print-report">
      <div className="print-header no-break">
        <h1>Reporte de Consultas - MediCampus</h1>
        <p>
          Período: {filters.fecha_inicio} al {filters.fecha_fin}
          {filters.servicioId ? ` | Servicio: ${filters.servicioId}` : ''}
        </p>
      </div>

      <div className="print-kpis no-break">
        <div className="print-kpi-card">
          <span className="print-kpi-value">{totalConsultas.toLocaleString()}</span>
          <span className="print-kpi-label">Consultas Totales</span>
        </div>
        {!filters.servicioId && Object.entries(servicios).map(([key, svc]) => {
          const nkey = normalizeKey(key);
          const valor = serviciosMap.get(nkey) ?? 0;
          return (
            <div key={key} className="print-kpi-card" style={{ borderLeftColor: svc.color }}>
              <span className="print-kpi-value" style={{ color: svc.color }}>
                {valor.toLocaleString()}
              </span>
              <span className="print-kpi-label">{svc.label}</span>
            </div>
          );
        })}
      </div>

      <div className={`print-charts no-break${filters.servicioId ? ' print-charts--single' : ''}`}>
        <div className="print-chart-item">
          <ChartConsultasGenero data={byGenderData} loading={false} error={null} />
        </div>
        {!filters.servicioId && (
          <div className="print-chart-item">
            <ChartConsultasFecha data={serviciosData} loading={false} error={null} />
          </div>
        )}
      </div>

      {!filters.servicioId && tableRows.length > 0 && (
        <div className="page-break">
          <DataTable
            title="Detalle de Atenciones"
            columns={tableColumns}
            rows={tableRows}
          />
        </div>
      )}

      <div className="print-footer no-break">
        <p>Generado el {new Date().toLocaleDateString('es-EC')}</p>
      </div>
    </div>
  );
}
