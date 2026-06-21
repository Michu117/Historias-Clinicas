import { useEffect, useState } from 'react';
import { Button } from '../../../ui/components/Button';
import { Card } from '../../../ui/components/Card';
import { HistoriasClinicasDashboardLayout } from '../components/HistoriasClinicasDashboardLayout';
import { HistoriasClinicasHeader } from '../components/HistoriasClinicasHeader';
import DocumentosClinicosList from '../components/DocumentosClinicosList';
import { historiasClinicasService } from '../services/historiasClinicasService';
import type { HistoriaClinica } from '../types/historiaClinica.types';
import type { AntecedenteClinico } from '../types/antecedenteClinico.types';
import type { ConsultaClinico } from '../types/consultaClinico.types';
import type { DocumentoClinico } from '../types/documentoClinico.types';

const TIPO_ANT_LABELS: Record<string, string> = {
  HEREDOFAMILIARES: 'Heredofamiliares',
  PERSONALES_NO_PATOLOGICOS: 'Personales no patológicos',
  PERSONALES_PATOLOGICOS: 'Personales patológicos',
  GINECO_OBSTETRICOS: 'Gineco obstétricos',
};

function generarHtmlPDF(historia: HistoriaClinica, antecedentes: AntecedenteClinico[], consultas: ConsultaClinico[], documentos: DocumentoClinico[]) {
  const antRows = antecedentes.map((a) => `<tr><td>${TIPO_ANT_LABELS[a.tipo] ?? a.tipo}</td><td>${a.descripcion}</td><td>${a.fecha}</td></tr>`).join('')
  const consultaRows = consultas.map((c) => `<tr><td>${c.fecha}</td><td>${c.motivo}</td><td>${c.tipo}</td><td>${c.estado}</td></tr>`).join('')
  const docRows = documentos.map((d) => `<tr><td>${d.fecha}</td><td>${d.encabezado}</td><td>${d.tipo}</td></tr>`).join('')
  return `
<html><head><meta charset="utf-8"><title>Mi Historia Clínica</title>
<style>body{font-family:Arial,sans-serif;margin:20px}table{width:100%;border-collapse:collapse;margin-bottom:20px}th,td{border:1px solid #ccc;padding:6px 10px;text-align:left}th{background:#eee}h2{color:#333}</style>
</head><body>
<h1>Mi Historia Clínica</h1>
<p><strong>Paciente:</strong> ${historia.usuario.nombre}</p>
<h2>Datos generales</h2>
<table><tr><th>Alergia</th><td>${historia.alergia}</td></tr><tr><th>Condición preexistente</th><td>${historia.condicionPreexistente}</td></tr><tr><th>Factor de riesgo</th><td>${historia.factorRiesgo}</td></tr></table>
<h2>Antecedentes clínicos</h2>
<table><thead><tr><th>Tipo</th><th>Descripción</th><th>Fecha</th></tr></thead><tbody>${antRows || '<tr><td colspan="3">Sin antecedentes registrados</td></tr>'}</tbody></table>
<h2>Casos clínicos</h2>
<table><thead><tr><th>Fecha</th><th>Motivo</th><th>Tipo</th><th>Estado</th></tr></thead><tbody>${consultaRows || '<tr><td colspan="4">Sin casos registrados</td></tr>'}</tbody></table>
<h2>Documentos clínicos</h2>
<table><thead><tr><th>Fecha</th><th>Encabezado</th><th>Tipo</th></tr></thead><tbody>${docRows || '<tr><td colspan="3">Sin documentos adjuntos</td></tr>'}</tbody></table>
</body></html>`
}

export const MiHistoriaClinicaPage = () => {
  const [historia, setHistoria] = useState<HistoriaClinica | null>(null);
  const [antecedentes, setAntecedentes] = useState<AntecedenteClinico[]>([]);
  const [consultas, setConsultas] = useState<ConsultaClinico[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoClinico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const historias = await historiasClinicasService.listarHistoriasClinicas();
      if (historias.length === 0) {
        setError('No se encontró la historia clínica asociada a tu usuario.');
        return;
      }
      const h = historias[0];
      setHistoria(h);
      const [ants, cs, docs] = await Promise.all([
        historiasClinicasService.listarAntecedentesPorHistoria(h.id),
        historiasClinicasService.listarCasosClinicosPorHistoria(h.id),
        historiasClinicasService.listarDocumentosPorHistoria(h.id),
      ]);
      setAntecedentes(ants);
      setConsultas(cs);
      setDocumentos(docs);
    } catch (err: any) {
      setError(err?.message ?? 'Ocurrió un error al cargar la información clínica.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarDatos();
  }, []);

  const handleExportPDF = () => {
    if (!historia) return;
    const html = generarHtmlPDF(historia, antecedentes, consultas, documentos)
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    win.print()
  }

  return (
    <HistoriasClinicasDashboardLayout>
      <HistoriasClinicasHeader
        title="Mi Historia Clínica"
        subtitle={historia ? `Paciente: ${historia.usuario.nombre}` : 'Cargando...'}
      />

      {loading && (
        <section className="flex-1">
          <p className="text-sm text-slate-500">Cargando tu historia clínica...</p>
        </section>
      )}

      {error && (
        <section className="flex-1">
          <Card><p className="text-sm font-medium text-rose-600">{error}</p></Card>
        </section>
      )}

      {!loading && !error && !historia && (
        <section className="flex-1">
          <Card><p className="text-sm text-slate-500">No se encontró la historia clínica.</p></Card>
        </section>
      )}

      {!loading && !error && historia && (
        <section className="w-full">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <h2 className="mb-3 text-base font-semibold text-slate-900">Datos generales</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-global border border-slate-200 bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Alergia</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{historia.alergia || '—'}</p>
                </div>
                <div className="rounded-global border border-slate-200 bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Condición preexistente</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{historia.condicionPreexistente || '—'}</p>
                </div>
                <div className="rounded-global border border-slate-200 bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Factor de riesgo</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{historia.factorRiesgo || '—'}</p>
                </div>
                {historia.fechaApertura && (
                  <div className="rounded-global border border-slate-200 bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Fecha de creación</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{historia.fechaApertura}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* ── Antecedentes ── */}
            <Card>
              <h2 className="mb-3 text-base font-semibold text-slate-900">Antecedentes clínicos</h2>
              {antecedentes.length === 0 ? (
                <p className="text-sm text-slate-500">Sin antecedentes registrados</p>
              ) : (
                <div className="space-y-2">
                  {antecedentes.map((a) => (
                    <div key={a.id} className="rounded-global border border-slate-200 bg-white p-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Tipo</p>
                          <p className="mt-1 text-sm font-medium text-slate-800">
                            {TIPO_ANT_LABELS[a.tipo] ?? a.tipo}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Descripción</p>
                          <p className="mt-1 text-sm font-medium text-slate-800">{a.descripcion}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Fecha</p>
                          <p className="mt-1 text-sm font-medium text-slate-800">{a.fecha}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* ── Casos clínicos ── */}
          <Card className="mt-4">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Casos clínicos</h2>
            {consultas.length === 0 ? (
              <p className="text-sm text-slate-500">Sin casos clínicos registrados</p>
            ) : (
              <div className="overflow-hidden rounded-global border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Motivo / Caso</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {consultas.map((c, i) => (
                      <tr key={c.id || i} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{c.fecha}</td>
                        <td className="px-4 py-3 text-slate-800">{c.motivo}</td>
                        <td className="px-4 py-3 text-slate-600">{c.tipo}</td>
                        <td className="px-4 py-3 text-slate-600">{c.estado}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* ── Documentos ── */}
          <Card className="mt-4">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Documentos clínicos</h2>
            <DocumentosClinicosList
              historiaClinicaId={historia.id}
              historia={historia}
              readOnly
              showFilters
            />
          </Card>

          <div className="mt-4 flex justify-end">
            <Button type="button" variant="primary" onClick={handleExportPDF}>
              Exportar PDF
            </Button>
          </div>
        </section>
      )}
    </HistoriasClinicasDashboardLayout>
  );
};

export default MiHistoriaClinicaPage;
