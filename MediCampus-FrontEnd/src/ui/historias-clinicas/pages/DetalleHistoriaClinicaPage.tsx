import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../ui/components/Button';
import { Card } from '../../../ui/components/Card';
import { HistoriasClinicasDashboardLayout } from '../components/HistoriasClinicasDashboardLayout';
import { HistoriasClinicasHeader } from '../components/HistoriasClinicasHeader';
import { historiasClinicasService } from '../services/historiasClinicasService';
import { useHistoriasClinicasAuth } from '../hooks/useHistoriasClinicasAuth';
import { getNombreMedico } from '../utils/getNombreMedico';
import type { HistoriaClinica } from '../types/historiaClinica.types';
import type { AntecedenteClinico } from '../types/antecedenteClinico.types';
import type { ConsultaClinico } from '../types/consultaClinico.types';
import type { DocumentoClinico } from '../types/documentoClinico.types';
import type { RegistroClinicoHistoria } from '../types/registroClinico.types';
import CasosClinicosList from '../components/CasosClinicosList';
import DocumentosClinicosList from '../components/DocumentosClinicosList';

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

const AccessDeniedMessage = () => (
  <Card className="max-w-md text-center">
    <h1 className="text-xl font-semibold" style={{ color: 'var(--hc-text)' }}>
      Acceso denegado
    </h1>
    <p className="mt-2 text-sm" style={{ color: 'var(--on-surface-variant)' }}>
      No tienes permisos para acceder a historias clínicas.
    </p>
  </Card>
);

export const DetalleHistoriaClinicaPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, permissions, userCedula, isAuthorized } = useHistoriasClinicasAuth();

  const [historia, setHistoria] = useState<HistoriaClinica | null>(null);
  const [antecedentes, setAntecedentes] = useState<AntecedenteClinico[]>([]);
  const [casos, setCasos] = useState<ConsultaClinico[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoClinico[]>([]);
  const [registros, setRegistros] = useState<RegistroClinicoHistoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!isAuthorized) {
      navigate('/seguridad/login', { replace: true });
      return;
    }

    if (!role || !permissions) {
      navigate('/home', { replace: true });
      return;
    }

    if (role === 'ADMINISTRADOR' || permissions.isAdminBlocked) {
      navigate('/home', { replace: true });
      return;
    }

    if (role === 'PACIENTE' && !id) {
      navigate('/home', { replace: true });
      return;
    }

    if (!id) {
      setError('No se encontró la historia clínica.');
      setLoading(false);
      return;
    }

    const cargarDatos = async () => {
      setLoading(true);
      setError('');
      try {
        const h = await historiasClinicasService.obtenerHistoriaClinicaPorId(id);

        if (role === 'PACIENTE') {
          const cedula = userCedula ?? '';
          const usuario = h.usuario;
          if (usuario.identificacion !== cedula) {
            navigate('/home', { replace: true });
            return;
          }
        }

        setHistoria(h);
        const [ants, cs, docs, regs] = await Promise.all([
          historiasClinicasService.listarAntecedentesPorHistoria(id),
          historiasClinicasService.listarCasosClinicosPorHistoria(id),
          historiasClinicasService.listarDocumentosPorHistoria(id),
          historiasClinicasService.listarRegistrosClinicosPorHistoria(id),
        ]);
        setAntecedentes(ants);
        setCasos(cs);
        setDocumentos(docs);
        setRegistros(regs);
      } catch (err: any) {
        const msg = err?.message ?? '';
        if (msg.includes('404') || msg.includes('No se encontró')) {
          setError('No se encontró la historia clínica.');
        } else {
          setError('Ocurrió un error al cargar la información clínica.');
        }
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id, role, permissions, userCedula, isAuthorized, navigate]);

  const puedeEditar = role === 'MEDICO';
  const puedeCrearDocumentos = role === 'MEDICO' || role === 'TRABAJADOR_SOCIAL';

  return (
    <HistoriasClinicasDashboardLayout>
      <HistoriasClinicasHeader
        title={historia ? `Historia Clínica #${historia.id}` : 'Detalle de Historia Clínica'}
        subtitle={historia ? `Paciente: ${historia.usuario.nombre}` : 'Cargando...'}
        backTo="/historias"
        action={
          puedeEditar && historia
            ? {
                label: 'Editar historia clínica',
                onClick: () => navigate(`/historias/${historia.id}/editar`),
              }
            : undefined
        }
      />

      {loading && (
        <section className="flex-1">
          <p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>Cargando datos...</p>
        </section>
      )}

      {error && (
        <section className="flex-1">
          <p className="text-sm font-medium text-rose-600">{error}</p>
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
              {puedeEditar && (
                <div className="mt-4 flex justify-end">

                </div>
              )}
            </Card>

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

          <Card className="mt-4">
            <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--hc-text)' }}>Casos clínicos</h2>
            <CasosClinicosList casos={casos} />
          </Card>

          <Card className="mt-4">
            <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--hc-text)' }}>Documentos clínicos</h2>
            <DocumentosClinicosList
              historiaClinicaId={id!}
              historia={historia}
              medicoNombre={getNombreMedico()}
              readOnly={!puedeCrearDocumentos}
              showFilters
            />
          </Card>
        </section>
      )}
    </HistoriasClinicasDashboardLayout>
  );
};

export default DetalleHistoriaClinicaPage;
