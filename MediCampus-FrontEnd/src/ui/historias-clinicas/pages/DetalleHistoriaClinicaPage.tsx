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
import DocumentosClinicosList from '../components/DocumentosClinicosList';

const TIPO_ANT_LABELS: Record<string, string> = {
  HEREDOFAMILIARES: 'Heredofamiliares',
  PERSONALES_NO_PATOLOGICOS: 'Personales no patológicos',
  PERSONALES_PATOLOGICOS: 'Personales patológicos',
  GINECO_OBSTETRICOS: 'Gineco obstétricos',
};

const AccessDeniedMessage = () => (
  <Card className="max-w-md text-center">
    <h1 className="text-xl font-semibold text-slate-900">
      Acceso denegado
    </h1>
    <p className="mt-2 text-sm text-slate-600">
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!isAuthorized) {
      navigate('/seguridad/login');
      return;
    }

    if (!role || !permissions) {
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    if (role === 'ADMINISTRADOR' || permissions.isAdminBlocked) {
      setAccessDenied(true);
      setLoading(false);
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
            setAccessDenied(true);
            setLoading(false);
            return;
          }
        }

        setHistoria(h);
        const [ants, cs, docs] = await Promise.all([
          historiasClinicasService.listarAntecedentesPorHistoria(id),
          historiasClinicasService.listarCasosClinicosPorHistoria(id),
          historiasClinicasService.listarDocumentosPorHistoria(id),
        ]);
        setAntecedentes(ants);
        setCasos(cs);
        setDocumentos(docs);
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

  if (accessDenied) {
    return (
      <HistoriasClinicasDashboardLayout>
        <HistoriasClinicasHeader title="Detalle de Historia Clínica" backTo="/historias" />
        <section className="flex items-center justify-center">
          <AccessDeniedMessage />
        </section>
      </HistoriasClinicasDashboardLayout>
    );
  }

  const isMedico = role === 'MEDICO';

  return (
    <HistoriasClinicasDashboardLayout>
      <HistoriasClinicasHeader
        title={historia ? `Historia Clínica #${historia.id}` : 'Detalle de Historia Clínica'}
        subtitle={historia ? `Paciente: ${historia.usuario.nombre}` : 'Cargando...'}
        backTo="/historias"
        action={
          isMedico && historia
            ? {
                label: 'Editar historia clínica',
                onClick: () => navigate(`/historias/${historia.id}/editar`),
              }
            : undefined
        }
      />

      {loading && (
        <section className="flex-1">
          <p className="text-sm text-slate-500">Cargando datos...</p>
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
              {isMedico && (
                <div className="mt-4 flex justify-end">

                </div>
              )}
            </Card>

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

          <Card className="mt-4">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Casos clínicos</h2>
            {casos.length === 0 ? (
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
                    {casos.map((c, i) => (
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

          <Card className="mt-4">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Documentos clínicos</h2>
            <DocumentosClinicosList
              historiaClinicaId={id!}
              historia={historia}
              medicoNombre={getNombreMedico()}
              readOnly
              showFilters
            />
          </Card>
        </section>
      )}
    </HistoriasClinicasDashboardLayout>
  );
};

export default DetalleHistoriaClinicaPage;
