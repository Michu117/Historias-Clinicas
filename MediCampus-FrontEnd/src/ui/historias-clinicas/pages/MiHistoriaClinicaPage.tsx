import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../ui/components/Button';
import { Card } from '../../../ui/components/Card';
import { HistoriasClinicasDashboardLayout } from '../components/HistoriasClinicasDashboardLayout';
import { HistoriasClinicasHeader } from '../components/HistoriasClinicasHeader';
import DocumentosClinicosList from '../components/DocumentosClinicosList';
import { historiasClinicasService } from '../services/historiasClinicasService';
import { useHistoriasClinicasAuth } from '../hooks/useHistoriasClinicasAuth';
import type { HistoriaClinica } from '../types/historiaClinica.types';
import type { AntecedenteClinico } from '../types/antecedenteClinico.types';
import type { ConsultaClinico } from '../types/consultaClinico.types';
import type { DocumentoClinico } from '../types/documentoClinico.types';
import type { RegistroClinicoHistoria } from '../types/registroClinico.types';

const Field = ({ label, value, className = '' }: { label: string; value: string | null | undefined; className?: string }) => {
  if (!value) return null;
  return (
    <div className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--card-text-muted)' }}>{label}</p>
      <p className="mt-0.5 text-sm" style={{ color: 'var(--on-surface)' }}>{value}</p>
    </div>
  );
};

const TIPO_ANT_LABELS: Record<string, string> = {
  HEREDOFAMILIARES: 'Heredofamiliares',
  PERSONALES_NO_PATOLOGICOS: 'Personales no patológicos',
  PERSONALES_PATOLOGICOS: 'Personales patológicos',
  GINECO_OBSTETRICOS: 'Gineco obstétricos',
};

function generarHtmlPDF(historia: HistoriaClinica, antecedentes: AntecedenteClinico[], consultas: ConsultaClinico[], documentos: DocumentoClinico[]) {
  const antRows = antecedentes.map((a) => `<tr><td>${TIPO_ANT_LABELS[a.tipo] ?? a.tipo}</td><td>${a.descripcion}</td><td>${a.fecha}</td></tr>`).join('')
  const consultaRows = consultas.map((c) =>
    `<tr><td>${c.fecha}</td><td>${c.tipo}</td><td>${c.estado}</td></tr>`
  ).join('')
  const docRows = documentos.map((d) => `<tr><td>${d.fecha}</td><td>${d.encabezado}</td><td>${d.tipo}</td></tr>`).join('')
  const atendidas = consultas.filter(c => c.estado === 'ATENDIDA');
  const condResumen = atendidas.length === 0 ? '—' : (
    (() => {
      const ultima = atendidas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];
      return ultima.diagnostico ?? ultima.observaciones ?? ultima.motivo ?? 'Sin resumen disponible';
    })()
  );
  return `
<html><head><meta charset="utf-8"><title>Mi Historia Clínica</title>
<style>body{font-family:Arial,sans-serif;margin:20px}table{width:100%;border-collapse:collapse;margin-bottom:20px}th,td{border:1px solid #ccc;padding:6px 10px;text-align:left;vertical-align:top}th{background:#eee}h2{color:#333}</style>
</head><body>
<h1>Mi Historia Clínica</h1>
<p><strong>Paciente:</strong> ${historia.usuario.nombre}</p>
<h2>Datos generales</h2>
<table><tr><th>Alergia</th><td>${historia.alergia}</td></tr><tr><th>Condición preexistente</th><td>${condResumen}</td></tr><tr><th>Factor de riesgo</th><td>${historia.factorRiesgo}</td></tr></table>
<h2>Antecedentes clínicos</h2>
<table><thead><tr><th>Tipo</th><th>Descripción</th><th>Fecha</th></tr></thead><tbody>${antRows || '<tr><td colspan="3">Sin antecedentes registrados</td></tr>'}</tbody></table>
<h2>Casos clínicos</h2>
<table><thead><tr><th>Fecha</th><th>Tipo</th><th>Estado</th></tr></thead><tbody>${consultaRows || '<tr><td colspan="3">Sin casos registrados</td></tr>'}</tbody></table>
<h2>Documentos clínicos</h2>
<table><thead><tr><th>Fecha</th><th>Encabezado</th><th>Tipo</th></tr></thead><tbody>${docRows || '<tr><td colspan="3">Sin documentos adjuntos</td></tr>'}</tbody></table>
</body></html>`
}

export const MiHistoriaClinicaPage = () => {
  const navigate = useNavigate();
  const { isAuthorized } = useHistoriasClinicasAuth();
  const [historia, setHistoria] = useState<HistoriaClinica | null>(null);
  const [antecedentes, setAntecedentes] = useState<AntecedenteClinico[]>([]);
  const [consultas, setConsultas] = useState<ConsultaClinico[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoClinico[]>([]);
  const [registros, setRegistros] = useState<RegistroClinicoHistoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthorized) {
      navigate('/seguridad/login', { replace: true });
      return;
    }
  }, [isAuthorized, navigate]);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const h = await historiasClinicasService.obtenerMiHistoriaClinica();
      setHistoria(h);
      const [ants, cs, docs, regs] = await Promise.all([
        historiasClinicasService.listarAntecedentesPorHistoria(h.id),
        historiasClinicasService.listarCasosClinicosPorHistoria(h.id),
        historiasClinicasService.listarDocumentosPorHistoria(h.id),
        historiasClinicasService.listarRegistrosClinicosPorHistoria(h.id),
      ]);
      setAntecedentes(ants);
      setConsultas(cs);
      setDocumentos(docs);
      setRegistros(regs);
    } catch (err: any) {
      setError(err?.message ?? 'Ocurrió un error al cargar la información clínica.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      void cargarDatos();
    }
  }, [isAuthorized]);

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
        backTo="/historias"
      />

      {loading && (
        <section className="flex-1">
          <p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>Cargando tu historia clínica...</p>
        </section>
      )}

      {error && (
        <section className="flex-1">
          <Card><p className="text-sm font-medium text-rose-600">{error}</p></Card>
        </section>
      )}

      {!loading && !error && !historia && (
        <section className="flex-1">
          <Card><p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>No se encontró la historia clínica.</p></Card>
        </section>
      )}

      {!loading && !error && historia && (
        <section className="w-full">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--hc-text)' }}>Datos generales</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3" style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--card-text-muted)' }}>Nombre </p>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--on-surface)' }}>{historia.usuario?.nombre || '—'}</p>
                </div>
                <div className="rounded-lg p-3" style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--card-text-muted)' }}>identificación</p>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--on-surface)' }}>{historia.usuario?.identificacion || '—'}</p>
                </div>
                <div className="rounded-lg p-3" style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--card-text-muted)' }}>Condición preexistente</p>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--on-surface)' }}>
                    {(() => {
                      const atendidas = consultas.filter(c => c.estado === 'ATENDIDA');
                      if (atendidas.length === 0) return '—';
                      const ultima = atendidas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];
                      return ultima.diagnostico ?? ultima.observaciones ?? ultima.motivo ?? 'Sin resumen disponible';
                    })()}
                  </p>
                </div>
                <div className="rounded-lg p-3" style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--card-text-muted)' }}>Alergias</p>
                  <div className="mt-1 max-h-32 space-y-1 overflow-y-auto">
                    {(() => {
                      const alergias = registros.filter((r) => r.tipo === 'ALERGIA');
                      return alergias.length === 0 ? (
                        <p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>Sin registros</p>
                      ) : (
                        alergias.map((r) => (
                          <div key={r.id}>
                            <p className="text-sm font-medium" style={{ color: 'var(--on-surface)' }}>{r.descripcion}</p>
                            <p className="text-[10px]" style={{ color: 'var(--card-text-muted)' }}>
                              {new Date(r.fecha_registro).toLocaleDateString()}
                              {r.medico_registro_nombre ? ` — ${r.medico_registro_nombre}` : ''}
                            </p>
                          </div>
                        ))
                      );
                    })()}
                  </div>
                </div>
                <div className="rounded-lg p-3" style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--card-text-muted)' }}>Factores de riesgo</p>
                  <div className="mt-1 max-h-32 space-y-1 overflow-y-auto">
                    {(() => {
                      const factores = registros.filter((r) => r.tipo === 'FACTOR_RIESGO');
                      return factores.length === 0 ? (
                        <p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>Sin registros</p>
                      ) : (
                        factores.map((r) => (
                          <div key={r.id}>
                            <p className="text-sm font-medium" style={{ color: 'var(--on-surface)' }}>{r.descripcion}</p>
                            <p className="text-[10px]" style={{ color: 'var(--card-text-muted)' }}>
                              {new Date(r.fecha_registro).toLocaleDateString()}
                              {r.medico_registro_nombre ? ` — ${r.medico_registro_nombre}` : ''}
                            </p>
                          </div>
                        ))
                      );
                    })()}
                  </div>
                </div>
                {historia.fechaApertura && (
                  <div className="rounded-lg p-3" style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--card-text-muted)' }}>Fecha de creación</p>
                    <p className="mt-1 text-sm font-medium" style={{ color: 'var(--on-surface)' }}>{historia.fechaApertura}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* ── Antecedentes ── */}
            <Card>
              <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--hc-text)' }}>Antecedentes clínicos</h2>
              {antecedentes.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>Sin antecedentes registrados</p>
              ) : (
                <div className="space-y-2">
                  {antecedentes.map((a) => (
                    <div key={a.id} className="rounded-lg p-3" style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--card-text-muted)' }}>Tipo</p>
                          <p className="mt-1 text-sm font-medium" style={{ color: 'var(--on-surface)' }}>
                            {TIPO_ANT_LABELS[a.tipo] ?? a.tipo}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--card-text-muted)' }}>Descripción</p>
                          <p className="mt-1 text-sm font-medium" style={{ color: 'var(--on-surface)' }}>{a.descripcion}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--card-text-muted)' }}>Fecha</p>
                          <p className="mt-1 text-sm font-medium" style={{ color: 'var(--on-surface)' }}>{a.fecha}</p>
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
            <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--hc-text)' }}>Casos clínicos</h2>
            {consultas.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>Sin casos clínicos registrados</p>
            ) : (
              <div className="space-y-3">
                {consultas.map((c, i) => (
                  <div key={c.id || i} className="rounded-lg p-4" style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                      <Field label="Fecha" value={c.fecha} />
                      <Field label="Tipo" value={c.tipo} />
                      <Field label="Estado" value={c.estado} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── Documentos ── */}
          <Card className="mt-4">
            <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--hc-text)' }}>Documentos clínicos</h2>
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
