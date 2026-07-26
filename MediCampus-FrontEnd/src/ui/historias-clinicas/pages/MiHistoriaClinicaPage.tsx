import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../ui/components/Button';
import { Card } from '../../../ui/components/Card';
import { HistoriasClinicasHeader } from '../components/HistoriasClinicasHeader';
import CasosClinicosList from '../components/CasosClinicosList';
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

const TIPO_DOC_LABELS: Record<string, string> = {
  RESULTADO: 'Resultado',
  FORMULARIOS: 'Formulario',
  CONSENTIMIENTO: 'Consentimiento',
  CERTIFICADO: 'Certificado',
};

const TIPO_REG_LABELS: Record<string, string> = {
  ALERGIA: 'Alergia',
  FACTOR_RIESGO: 'Factor de riesgo',
};

function sanitizeForFilename(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function generarHtmlPDF(
  historia: HistoriaClinica,
  antecedentes: AntecedenteClinico[],
  consultas: ConsultaClinico[],
  documentos: DocumentoClinico[],
  registros: RegistroClinicoHistoria[],
): string {
  const dateStr = new Date().toISOString().split('T')[0];
  const todayFormatted = new Date().toLocaleDateString('es-EC', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const paciente = historia.usuario;
  const nameSlug = sanitizeForFilename(paciente.nombre || '');
  const idSlug = sanitizeForFilename(paciente.identificacion || '');
  const titleParts = ['Historia_Clinica'];
  if (nameSlug) titleParts.push(nameSlug);
  if (idSlug) titleParts.push(idSlug);
  titleParts.push(dateStr);
  const docTitle = titleParts.join('_');

  const antGroups: Record<string, AntecedenteClinico[]> = {};
  antecedentes.forEach(a => { (antGroups[a.tipo] ??= []).push(a); });
  const antKeys = Object.keys(antGroups);

  const fieldRow = (label: string, value: string | null | undefined) =>
    (value && value.trim())
      ? `<div class="row"><span class="lbl">${label}</span><span class="val">${value}</span></div>`
      : '';

  const antecedentesHtml = antKeys.length === 0
    ? '<p class="muted">No se registraron antecedentes clínicos.</p>'
    : antKeys.map(key => `
      <div class="block">
        <h3 class="block-title">${TIPO_ANT_LABELS[key] ?? key}</h3>
        ${antGroups[key].map(a => fieldRow('Descripción', a.descripcion) + fieldRow('Fecha', a.fecha)).join('')}
      </div>`).join('');

  const consultasHtml = consultas.length === 0
    ? '<p class="muted">No se registraron casos clínicos.</p>'
    : consultas.map(c => `
      <div class="block">
        <h3 class="block-title">${c.fecha} ${c.tipo ? '— ' + c.tipo : ''}</h3>
        ${fieldRow('Fecha', c.fecha)}
        ${fieldRow('Tipo', c.tipo)}
        ${fieldRow('Estado', c.estado)}
        ${fieldRow('Motivo', c.motivo)}
        ${fieldRow('Diagnóstico', c.diagnostico)}
        ${fieldRow('Tratamiento', c.tratamiento)}
        ${fieldRow('Anamnesis', c.anamnesis)}
        ${fieldRow('Observaciones', c.observaciones)}
        ${c.servicios?.length ? `<div class="row"><span class="lbl">Servicios</span><span class="val">${c.servicios.join(', ')}</span></div>` : ''}
      </div>`).join('');

  const registrosHtml = registros.length === 0
    ? '<p class="muted">No se registraron registros clínicos.</p>'
    : registros.map(r => `
      <div class="block">
        <h3 class="block-title">${TIPO_REG_LABELS[r.tipo] ?? r.tipo}</h3>
        ${fieldRow('Descripción', r.descripcion)}
        ${fieldRow('Fecha de registro', new Date(r.fecha_registro).toLocaleDateString('es-EC'))}
        ${fieldRow('Registrado por', r.medico_registro_nombre)}
      </div>`).join('');

  const documentosHtml = documentos.length === 0
    ? '<p class="muted">No se registraron documentos adjuntos.</p>'
    : documentos.map(d => `
      <div class="block">
        <h3 class="block-title">${TIPO_DOC_LABELS[d.tipo] ?? d.tipo}</h3>
        ${fieldRow('Encabezado', d.encabezado)}
        ${fieldRow('Fecha', d.fecha)}
        ${fieldRow('Cuerpo', d.cuerpo)}
      </div>`).join('');

  const responsable = historia.responsable;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${docTitle}</title>
<style>
@page{size:A4;margin:2cm 2.2cm;@bottom-center{content:"MediCampus — " counter(page) " de " counter(pages);font-family:'Segoe UI',Arial,sans-serif;font-size:8pt;color:#6b7280;}}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Segoe UI',Arial,sans-serif;font-size:10pt;line-height:1.6;color:#1f2937;background:#fff;}
.header{text-align:center;padding-bottom:14px;margin-bottom:18px;border-bottom:3px solid #0d9488;}
.header h1{font-size:24pt;font-weight:700;color:#0d9488;letter-spacing:2px;margin-bottom:2px;}
.header h2{font-size:15pt;font-weight:600;color:#1f2937;margin-bottom:4px;}
.header .meta{font-size:9pt;color:#6b7280;}
.sec-title{font-size:13pt;font-weight:700;color:#0d9488;margin-top:24px;margin-bottom:10px;padding-bottom:3px;border-bottom:1.5px solid #0d9488;page-break-after:avoid;}
.block{border:1px solid #e5e7eb;border-radius:5px;padding:10px 12px;margin-bottom:8px;background:#fafafa;page-break-inside:avoid;}
.block-title{font-size:10pt;font-weight:600;color:#0d9488;margin-bottom:6px;padding-bottom:3px;border-bottom:1px dashed #d1d5db;}
.row{display:flex;padding:3px 0;border-bottom:1px solid #f3f4f6;}
.row:last-child{border-bottom:none;}
.lbl{width:130px;min-width:130px;font-weight:600;font-size:9pt;color:#4b5563;text-transform:uppercase;letter-spacing:0.3px;}
.val{flex:1;font-size:9.5pt;color:#1f2937;word-break:break-word;overflow-wrap:break-word;white-space:pre-wrap;}
.pgrid{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px;}
.pgrid .row{width:calc(50% - 5px);border:1px solid #e5e7eb;border-radius:4px;padding:7px 9px;background:#fafafa;display:block;}
.pgrid .lbl{width:auto;min-width:0;display:block;margin-bottom:1px;}
.pgrid .val{display:block;font-size:10pt;}
.sig{margin-top:28px;padding-top:14px;border-top:2px solid #e5e7eb;page-break-inside:avoid;}
.sig-line{margin-top:50px;width:250px;border-top:1px solid #1f2937;}
.sig-label{font-size:9pt;color:#4b5563;margin-top:3px;}
.muted{font-size:9.5pt;color:#9ca3af;font-style:italic;padding:6px 0;}
.footer-note{text-align:center;font-size:7.5pt;color:#9ca3af;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:8px;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;} .no-break{page-break-inside:avoid;} .page-break{page-break-before:always;}}
</style></head><body>

<div class="header">
  <h1>MediCampus</h1>
  <h2>Historia Cl\u00ednica</h2>
  <p class="meta">Generado: ${todayFormatted}</p>
  <p class="meta">ID: ${historia.id}</p>
</div>

<h2 class="sec-title">Datos del Paciente</h2>
<div class="pgrid">
  <div class="row"><span class="lbl">Nombre</span><span class="val">${paciente.nombre}</span></div>
  ${paciente.identificacion ? '<div class="row"><span class="lbl">Identificaci\u00f3n</span><span class="val">' + paciente.identificacion + '</span></div>' : ''}
  ${historia.fechaApertura ? '<div class="row"><span class="lbl">Fecha de apertura</span><span class="val">' + historia.fechaApertura + '</span></div>' : ''}
</div>

<h2 class="sec-title">Datos Generales de la Historia Cl\u00ednica</h2>
<div class="block">
  ${fieldRow('Fecha de creaci\u00f3n', historia.fechaApertura)}
  ${fieldRow('Estado', historia.estado)}
  ${fieldRow('Alergias', historia.alergia)}
  ${fieldRow('Condici\u00f3n preexistente', historia.condicionPreexistenteUltimaConsulta || null)}
  ${fieldRow('Factor de riesgo', historia.factorRiesgo)}
</div>

<h2 class="sec-title">Antecedentes</h2>
${antecedentesHtml}

<h2 class="sec-title">Casos Cl\u00ednicos</h2>
${consultasHtml}

<h2 class="sec-title">Registros Cl\u00ednicos</h2>
${registrosHtml}

<h2 class="sec-title">Documentos Adjuntos</h2>
${documentosHtml}

<h2 class="sec-title">Datos del Profesional Responsable</h2>
<div class="block">
  ${responsable ? fieldRow('Nombre del m\u00e9dico', responsable) : '<p class="muted">No se ha asignado un profesional responsable.</p>'}
  ${fieldRow('Especialidad', null)}
  <div class="sig">
    <div class="sig-line"></div>
    <p class="sig-label">Firma del profesional</p>
  </div>
</div>

<p class="footer-note">MediCampus — Historia Cl\u00ednica generada el ${todayFormatted}</p>
</body></html>`;
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
    const html = generarHtmlPDF(historia, antecedentes, consultas, documentos, registros)
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    win.print()
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--hc-bg)' }}>
      <main className="mx-auto flex h-full w-full max-w-[1600px] flex-col gap-5 px-6 py-6">
        <HistoriasClinicasHeader
          title="Mi Historia Clínica"
          subtitle={historia ? `Paciente: ${historia.usuario.nombre}` : 'Cargando...'}
          backTo="/home"
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
                    {historia.condicionPreexistenteUltimaConsulta || 'Sin condición preexistente registrada'}
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
            <CasosClinicosList casos={consultas} />
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
      </main>
    </div>
  );
};

export default MiHistoriaClinicaPage;
