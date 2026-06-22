import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardTitle } from '../../../components';
import { citaService } from '../../services/api/citaService';
import { servicioService } from '../../services/api/servicioService';
import { getUserId } from '../../services/storage/authStorage';
import { Cita, EstadoCita, Servicio } from '../../types';
import { ConfirmModal } from '../shared/ConfirmModal';

const ESTADO_LABEL: Record<string, { label: string; color: string }> = {
  AGENDADA: { label: 'Agendada', color: 'bg-blue-100 text-blue-700' },
  CONFIRMADA: { label: 'Confirmada', color: 'bg-indigo-100 text-indigo-700' },
  ATENDIDA: { label: 'Atendida', color: 'bg-green-100 text-green-700' },
  CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
  NO_ASISTIDA: { label: 'No Asistió', color: 'bg-yellow-100 text-yellow-700' },
  REAGENDADA: { label: 'Reagendada', color: 'bg-purple-100 text-purple-700' },
};

export const MisCitas: React.FC = () => {
  const navigate = useNavigate();
  const userId = useMemo(() => getUserId(), []);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('AGENDADA,CONFIRMADA,REAGENDADA');
  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);

  const servicioMap = useMemo(() => {
    const map = new Map<number, string>();
    servicios.forEach((s) => map.set(s.id, s.nombre));
    return map;
  }, [servicios]);

  const cargarCitas = async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await citaService.listar({
        usuario_id: userId,
        estado: filtroEstado,
      });
      data.sort((a, b) => {
        const dateA = new Date(`${a.fecha}T${a.hora}`);
        const dateB = new Date(`${b.fecha}T${b.hora}`);
        return dateA.getTime() - dateB.getTime();
      });
      setCitas(data);
    } catch {
      setError('Error al cargar las citas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    servicioService.listar().then(setServicios).catch(() => {});
  }, []);

  useEffect(() => {
    cargarCitas();
  }, [userId, filtroEstado]);

  const handleCancelConfirm = async () => {
    if (confirmCancelId === null) return;
    setCancelandoId(confirmCancelId);
    setMessage(null);
    setError(null);
    setConfirmCancelId(null);
    try {
      await citaService.cancelar(confirmCancelId);
      setMessage('Cita cancelada exitosamente.');
      cargarCitas();
    } catch {
      setError('Error al cancelar la cita.');
    } finally {
      setCancelandoId(null);
    }
  };

  const estadoBadge = (estado: string) => {
    const info = ESTADO_LABEL[estado] || { label: estado, color: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${info.color}`}>
        {info.label}
      </span>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-hc-bg">
      <header className="bg-hc-primary text-hc-primaryText px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <span className="font-bold text-sm sm:text-base">M</span>
          </div>
          <h1 className="text-base sm:text-lg font-semibold truncate">Mis Citas</h1>
        </div>
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-hc-primaryText/80 hover:text-hc-primaryText transition-colors shrink-0"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Inicio
        </button>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto max-w-4xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Mis Citas Agendadas</CardTitle>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Revisa, reprograma o cancela tus citas médicas.
              </p>
            </div>
            <Button variant="primary" onClick={() => navigate('/AgendarCita')}>
              + Nueva Cita
            </Button>
          </div>
        </Card>

        {/* Filtros */}
        <Card>
          <div className="flex gap-2">
            {[
              { value: 'AGENDADA,CONFIRMADA,REAGENDADA', label: 'Próximas' },
              { value: 'ATENDIDA', label: 'Atendidas' },
              { value: 'CANCELADA,NO_ASISTIDA', label: 'Canceladas' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFiltroEstado(f.value)}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-full font-bold transition-colors ${
                  filtroEstado === f.value
                    ? 'bg-hc-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Alertas */}
        {(error || message) && (
          <div className="space-y-2">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4 text-red-700 text-xs sm:text-sm flex items-center gap-2 font-medium">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            ) : null}
            {message ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 sm:p-4 text-green-700 text-xs sm:text-sm flex items-center gap-2 font-medium">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {message}
              </div>
            ) : null}
          </div>
        )}

        {/* Lista de citas */}
        <div className="space-y-3">
          {isLoading ? (
            <Card>
              <p className="text-sm text-slate-500 text-center py-8">Cargando citas...</p>
            </Card>
          ) : citas.length === 0 ? (
            <Card>
              <p className="text-sm text-slate-500 text-center py-8">No tienes citas en esta categoría.</p>
            </Card>
          ) : (
            citas.map((cita) => {
              const puedeCancelar = cita.estado === EstadoCita.AGENDADA || cita.estado === EstadoCita.REAGENDADA;
              const servicioNombre = servicioMap.get(cita.servicio_id) || 'Sin especificar';
              return (
                <Card key={cita.id}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                          {servicioNombre}
                        </h4>
                        {estadoBadge(cita.estado)}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600">
                        <span className="font-medium">Fecha:</span> {String(cita.fecha)} a las {cita.hora}
                      </p>
                      {cita.profesional_nombre && (
                        <p className="text-xs sm:text-sm text-slate-600">
                          <span className="font-medium">Profesional:</span> {cita.profesional_nombre}
                        </p>
                      )}
                      {cita.motivo && (
                        <p className="text-xs sm:text-sm text-slate-500 line-clamp-2">
                          <span className="font-medium">Motivo:</span> {cita.motivo}
                        </p>
                      )}
                    </div>
                    {puedeCancelar && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            navigate('/AgendarCita', {
                              state: {
                                reprogramCita: {
                                  id: cita.id,
                                  servicio_id: cita.servicio_id,
                                  profesional_id: cita.profesional_id,
                                  motivo: cita.motivo || '',
                                },
                              },
                            });
                          }}
                        >
                          Reprogramar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={cancelandoId === cita.id}
                          onClick={() => setConfirmCancelId(cita.id)}
                        >
                          {cancelandoId === cita.id ? 'Cancelando...' : 'Cancelar'}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </main>

      <ConfirmModal
        open={confirmCancelId !== null}
        title="Cancelar Cita"
        message="¿Estás seguro de cancelar esta cita? Esta acción no se puede deshacer."
        confirmLabel="Sí, cancelar"
        cancelLabel="Volver"
        onConfirm={handleCancelConfirm}
        onCancel={() => setConfirmCancelId(null)}
        isLoading={cancelandoId !== null}
      />

      <footer className="text-center text-[10px] sm:text-xs text-slate-400 py-3 sm:py-4 border-t border-slate-200">
        Universidad Nacional de Loja &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default MisCitas;
