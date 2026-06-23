import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgenda } from '../../hooks/useAgenda';
import { SideNavBar } from '../shared/SideNavBar';
import { NotificationBell } from '../../../notificaciones';
import { useNotifications, useMarkAsRead } from '../../../notificaciones';
import { Cita, EstadoCita } from '../../types';
import { citaService } from '../../services/api/citaService';
import { startedConsultaStorage } from '../../services/storage/startedConsultaStorage';

type FilterTab = 'Todos' | 'Programados' | 'En Curso' | 'Completados';

const STATUS_MAP: Record<FilterTab, EstadoCita[]> = {
  'Todos': [EstadoCita.AGENDADA, EstadoCita.CONFIRMADA, EstadoCita.ATENDIDA, EstadoCita.CANCELADA, 'NO_ASISTIDA' as EstadoCita, EstadoCita.REAGENDADA],
  'Programados': [EstadoCita.AGENDADA, EstadoCita.CONFIRMADA],
  'En Curso': [],
  'Completados': [EstadoCita.ATENDIDA],
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getInitials(nombreCompleto: string): string {
  const parts = nombreCompleto.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getStatusInfo(cita: Cita, startedIds: number[]): { label: string; bgClass: string; textClass: string; icon: string } {
  if (cita.estado === EstadoCita.ATENDIDA) {
    return { label: 'Completado', bgClass: 'var(--secondary-container)', textClass: 'var(--on-secondary-container)', icon: 'check_circle' };
  }
  if (cita.estado === EstadoCita.CANCELADA) {
    return { label: 'Cancelado', bgClass: '#fef2f2', textClass: '#991b1b', icon: 'cancel' };
  }
  if (cita.estado === 'NO_ASISTIDA' as EstadoCita) {
    return { label: 'No Asistió', bgClass: '#fef2f2', textClass: '#991b1b', icon: 'cancel' };
  }
  if (cita.estado === EstadoCita.REAGENDADA) {
    return { label: 'Reagendada', bgClass: '#f3e8ff', textClass: '#6b21a8', icon: 'schedule' };
  }
  if (startedIds.includes(cita.id)) {
    return { label: 'En curso', bgClass: '#fff7ed', textClass: '#9a3412', icon: 'play_circle' };
  }
  switch (cita.estado) {
    case EstadoCita.AGENDADA:
    case EstadoCita.CONFIRMADA:
      return { label: 'Programado', bgClass: 'var(--primary-fixed)', textClass: 'var(--on-primary-fixed)', icon: 'schedule' };
    default:
      return { label: cita.estado, bgClass: 'var(--surface-container-low)', textClass: 'var(--on-surface-variant)', icon: 'schedule' };
  }
}

function getButtonInfo(cita: Cita, startedIds: number[]): { label: string; variant: 'primary' | 'ghost' } | null {
  if (cita.estado === EstadoCita.CANCELADA || cita.estado === 'NO_ASISTIDA' as EstadoCita || cita.estado === EstadoCita.REAGENDADA) {
    return null;
  }
  if (cita.estado === EstadoCita.ATENDIDA) {
    return { label: 'Ver Detalles', variant: 'ghost' };
  }
  if (startedIds.includes(cita.id)) {
    return { label: 'Continuar', variant: 'primary' };
  }
  return { label: 'Iniciar Consulta', variant: 'primary' };
}

function toISODate(date: Date): string {
  return date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0');
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const MiAgenda: React.FC = () => {
  const navigate = useNavigate();
  const { citas, loading, error, loadAgenda } = useAgenda();
  const { notifications, isLoading: notifLoading, error: notifError } = useNotifications();
  const markAsRead = useMarkAsRead();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [startedCitaIds, setStartedCitaIds] = useState<number[]>(() =>
    startedConsultaStorage.getAllStarted()
  );
  const [noAsistioLoadingId, setNoAsistioLoadingId] = useState<number | null>(null);

  useEffect(() => {
    loadAgenda();
  }, [loadAgenda]);

  useEffect(() => {
    setStartedCitaIds(startedConsultaStorage.getAllStarted());
  }, [citas]);

  const filteredCitas = useMemo(() => {
    let result = citas;

    // Only citas with valid patient names
    result = result.filter((c) => c.paciente_nombre);

    // Filter by selected date
    result = result.filter((c) => {
      const citaDate = typeof c.fecha === 'string' ? c.fecha : toISODate(new Date(c.fecha));
      return citaDate === selectedDate;
    });

    if (activeFilter === 'En Curso') {
      result = result.filter((c) => startedCitaIds.includes(c.id) && c.estado !== EstadoCita.ATENDIDA);
    } else {
      const validStatuses = STATUS_MAP[activeFilter];
      if (validStatuses.length > 0) {
        result = result.filter((c) => validStatuses.includes(c.estado));
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => {
        const nombre = (c.paciente_nombre || '').toLowerCase();
        return (
          c.motivo?.toLowerCase().includes(q) ||
          String(c.paciente_id).includes(q) ||
          nombre.includes(q)
        );
      });
    }
    return result;
  }, [citas, selectedDate, activeFilter, searchQuery, startedCitaIds]);

  const handleCardAction = useCallback((cita: Cita) => {
    if (cita.estado === EstadoCita.CANCELADA || cita.estado === 'NO_ASISTIDA' as EstadoCita || cita.estado === EstadoCita.REAGENDADA) {
      return;
    }
    if (cita.estado !== EstadoCita.ATENDIDA) {
      startedConsultaStorage.markStarted(cita.id);
    }
    navigate(`/agendas/consulta/${cita.id}`);
  }, [navigate]);

  const handleNoAsistio = useCallback(async (cita: Cita) => {
    setNoAsistioLoadingId(cita.id);
    try {
      await citaService.actualizar(cita.id, { estado: 'NO_ASISTIDA' });
      loadAgenda();
    } catch {
      // ignore
    } finally {
      setNoAsistioLoadingId(null);
    }
  }, [loadAgenda]);

  const handlePrevDay = () => {
    const current = new Date(selectedDate + 'T12:00:00');
    setSelectedDate(toISODate(addDays(current, -1)));
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate + 'T12:00:00');
    setSelectedDate(toISODate(addDays(current, 1)));
  };

  const handleToday = () => {
    setSelectedDate(toISODate(new Date()));
  };

  const todayStr = toISODate(new Date());
  const isToday = selectedDate === todayStr;

  const filterTabs: FilterTab[] = ['Todos', 'Programados', 'En Curso', 'Completados'];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--hc-bg)' }}>
      <SideNavBar />
      <main className="flex-1 ml-60 h-screen overflow-y-auto">
        <header
          className="flex justify-end items-center h-16 px-8 border-b sticky top-0 z-40"
          style={{ backgroundColor: 'rgba(255,255,255,0.8)', borderColor: 'var(--outline)', backdropFilter: 'blur(8px)' }}
        >
          <div className="flex items-center gap-4">
            <NotificationBell
              notifications={notifications}
              isLoading={notifLoading}
              onMarkAsRead={markAsRead}
              error={notifError || undefined}
            />
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2"
              style={{ backgroundColor: 'var(--primary-fixed)', color: 'var(--on-primary-fixed)', borderColor: 'var(--outline)' }}
            >
              DR
            </div>
          </div>
        </header>

        <div className="p-10 max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl font-black tracking-tight mb-1" style={{ color: 'var(--hc-text)' }}>
              Agenda Diaria
            </h1>
          </div>

          {/* Date Selector */}
          <div
            className="bg-white border rounded-2xl shadow-sm mb-6 p-4 flex items-center justify-between"
            style={{ borderColor: 'var(--outline)' }}
          >
            <button
              onClick={handlePrevDay}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--btn-tertiary-hover)] transition-all active:scale-95"
              style={{ color: 'var(--primary)', backgroundColor: 'transparent' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-bold capitalize" style={{ color: 'var(--hc-text)' }}>
                  {formatDate(selectedDate)}
                </p>
              </div>
              {!isToday && (
                <button
                  onClick={handleToday}
                  className="px-4 h-9 rounded-lg text-sm font-bold flex items-center justify-center hover:bg-[var(--btn-tertiary-hover)] transition-all active:scale-95"
                  style={{ color: 'var(--primary)', border: '1px solid var(--outline)', backgroundColor: 'transparent' }}
                >
                  Hoy
                </button>
              )}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 px-3 rounded-lg border text-sm outline-none transition-all"
                style={{ backgroundColor: 'var(--surface-container-low)', borderColor: 'var(--outline)', color: 'var(--on-surface-variant)' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--outline)'; }}
              />
            </div>

            <button
              onClick={handleNextDay}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--btn-tertiary-hover)] transition-all active:scale-95"
              style={{ color: 'var(--primary)', backgroundColor: 'transparent' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div
            className="bg-white border rounded-2xl p-6 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ borderColor: 'var(--outline)' }}
          >
            <div className="relative w-full sm:w-96">
              <svg
                className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={{ color: 'var(--on-surface-variant)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl border outline-none transition-all text-sm"
                style={{ backgroundColor: 'var(--surface-container-low)', borderColor: 'var(--outline)' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--outline)'; }}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider mr-1" style={{ color: 'var(--on-surface-variant)' }}>
                Estado:
              </span>
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    activeFilter === tab
                      ? 'text-white'
                      : 'hover:bg-[var(--btn-tertiary-hover)]'
                  }`}
                  style={
                    activeFilter === tab
                      ? { backgroundColor: 'var(--primary)', color: 'var(--surface-container-lowest)' }
                      : { color: 'var(--on-surface-variant)', backgroundColor: 'transparent' }
                  }
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && filteredCitas.length === 0 && (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--on-surface-variant)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium" style={{ color: 'var(--on-surface-variant)' }}>
                No hay citas {activeFilter !== 'Todos' ? activeFilter.toLowerCase() : ''}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--on-surface-variant)' }}>
                No hay citas para esta fecha.
              </p>
            </div>
          )}

          {!loading && filteredCitas.length > 0 && (
            <div className="space-y-4">
              {filteredCitas.map((cita) => {
                const statusInfo = getStatusInfo(cita, startedCitaIds);
                const btnInfo = getButtonInfo(cita, startedCitaIds);
                const isInProgress = activeFilter === 'En Curso';
                const nombreCompleto = cita.paciente_nombre!;

                return (
                  <div
                    key={cita.id}
                    className="bg-white border-2 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm transition-all hover:shadow-md gap-4"
                    style={{
                      borderColor: isInProgress ? 'var(--primary)' : 'var(--outline)',
                      ...(isInProgress ? { ring: '1px solid var(--primary)' } : {}),
                    }}
                  >
                    <div className="flex items-center gap-6 sm:gap-10 w-full sm:w-auto">
                      <div className="text-center w-20 shrink-0">
                        <p className="text-2xl font-black leading-tight" style={{ color: 'var(--hc-text)' }}>
                          {cita.hora?.split(':').slice(0, 2).join(':') || '--:--'}
                        </p>
                      </div>

                      <div className="h-10 w-px shrink-0" style={{ backgroundColor: 'var(--outline)' }} />

                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-bold shrink-0 text-sm"
                          style={{ backgroundColor: 'var(--primary-fixed)', color: 'var(--on-primary-fixed)' }}
                        >
                          {getInitials(cita.paciente_nombre!)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-black truncate" style={{ color: 'var(--hc-text)' }}>
                            {nombreCompleto}
                          </h3>
                          <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--on-surface-variant)' }}>
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span className="font-medium truncate">{cita.motivo || 'Sin motivo'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <span className="px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shrink-0"
                        style={{ backgroundColor: statusInfo.bgClass, color: statusInfo.textClass }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {statusInfo.label === 'Completado' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                        {statusInfo.label}
                      </span>

                      {cita.estado === EstadoCita.AGENDADA && (
                        <button
                          onClick={() => handleNoAsistio(cita)}
                          disabled={noAsistioLoadingId === cita.id}
                          className="px-4 h-11 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shrink-0 text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {noAsistioLoadingId === cita.id ? 'Guardando...' : 'No Asistió'}
                        </button>
                      )}

                      {btnInfo && (
                        <button
                          onClick={() => handleCardAction(cita)}
                          className={`px-6 h-11 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shrink-0 ${
                            btnInfo.variant === 'primary'
                              ? 'text-white shadow-lg hover:opacity-90'
                              : 'hover:bg-[var(--btn-tertiary-hover)]'
                          }`}
                          style={
                            btnInfo.variant === 'primary'
                              ? { backgroundColor: 'var(--primary)' }
                              : { color: 'var(--primary)', backgroundColor: 'transparent' }
                          }
                        >
                          {btnInfo.label}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {cita.estado === EstadoCita.ATENDIDA ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            )}
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
