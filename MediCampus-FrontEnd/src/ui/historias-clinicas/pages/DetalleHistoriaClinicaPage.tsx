import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../../ui/components/Card';
import { HistoriasClinicasDashboardLayout } from '../components/HistoriasClinicasDashboardLayout';
import { HistoriasClinicasHeader } from '../components/HistoriasClinicasHeader';
import { historiasClinicasService } from '../services/historiasClinicasService';
import type { HistoriaClinica } from '../types/historiaClinica.types';
import type { AntecedenteClinico } from '../types/antecedenteClinico.types';
import type { CasoClinico } from '../types/casoClinico.types';

const TIPO_ANT_LABELS: Record<string, string> = {
  HEREDOFAMILIARES: 'Heredofamiliares',
  PERSONALES_NO_PATOLOGICOS: 'Personales no patológicos',
  PERSONALES_PATOLOGICOS: 'Personales patológicos',
  GINECO_OBSTETRICOS: 'Gineco obstétricos',
};

const ESTADO_CASO_LABELS: Record<string, string> = {
  ABIERTO: 'Abierto',
  EN_SEGUIMIENTO: 'En seguimiento',
  CERRADO: 'Cerrado',
};

const PRIORIDAD_LABELS: Record<string, string> = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja',
};

export const DetalleHistoriaClinicaPage = () => {
  const { id } = useParams<{ id: string }>();
  const [historia, setHistoria] = useState<HistoriaClinica | null>(null);
  const [antecedentes, setAntecedentes] = useState<AntecedenteClinico[]>([]);
  const [casos, setCasos] = useState<CasoClinico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarDatos = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const h = await historiasClinicasService.obtenerHistoriaClinicaPorId(id);
      setHistoria(h);
      const [ants, cs] = await Promise.all([
        historiasClinicasService.listarAntecedentesPorHistoria(id),
        historiasClinicasService.listarCasosPorHistoria(id),
      ]);
      setAntecedentes(ants);
      setCasos(cs);
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  return (
    <HistoriasClinicasDashboardLayout>
      <HistoriasClinicasHeader
        title={historia ? `Historia Clínica #${historia.id}` : 'Detalle de Historia Clínica'}
        subtitle={historia ? `Paciente: ${historia.usuario.nombre}` : 'Cargando...'}
        backTo="/historias"
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
            {/* ── Datos generales ── */}
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
                <div className="rounded-global border border-slate-200 bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Estado</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {historia.estado === 'ACTIVA' ? 'Activa' : 'Cerrada'}
                  </p>
                </div>
                {historia.fechaApertura && (
                  <div className="rounded-global border border-slate-200 bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Fecha de creación</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{historia.fechaApertura}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* ── Antecedentes clínicos ── */}
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
            {casos.length === 0 ? (
              <p className="text-sm text-slate-500">Sin casos clínicos registrados</p>
            ) : (
              <div className="space-y-2">
                {casos.map((c) => (
                  <div key={c.id} className="rounded-global border border-slate-200 bg-white p-3">
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Fecha apertura</p>
                        <p className="mt-1 text-sm font-medium text-slate-800">{c.fechaApertura}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Fecha cierre</p>
                        <p className="mt-1 text-sm font-medium text-slate-800">{c.fechaCierre || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Estado</p>
                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {ESTADO_CASO_LABELS[c.estado] ?? c.estado}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Prioridad</p>
                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {PRIORIDAD_LABELS[c.prioridad] ?? c.prioridad}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      )}
    </HistoriasClinicasDashboardLayout>
  );
};

export default DetalleHistoriaClinicaPage;
