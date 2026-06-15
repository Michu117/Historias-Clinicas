import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgenda } from '../../hooks/useAgenda';
import { SideNavBar } from '../shared/SideNavBar';
import { Cita, EstadoCita } from '../../types';
import { startedConsultaStorage } from '../../services/storage/startedConsultaStorage';

type FilterTab = 'Todos' | 'Programados' | 'En Curso' | 'Completados';

const STATUS_MAP: Record<FilterTab, EstadoCita[]> = {
  'Todos': [EstadoCita.AGENDADA, EstadoCita.CONFIRMADA, EstadoCita.ATENDIDA],
  'Programados': [EstadoCita.AGENDADA, EstadoCita.CONFIRMADA],
  'En Curso': [],
  'Completados': [EstadoCita.ATENDIDA],
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
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
  if (startedIds.includes(cita.id)) {
    return { label: 'En curso', bgClass: '#fff7ed', textClass: '#9a3412', icon: 'play_circle' };
  }
  switch (cita.estado) {
    case EstadoCita.AGENDADA:
    case EstadoCita.CONFIRMADA:
      return { label: 'Programado', bgClass: '#f1f3ff', textClass: '#424752', icon: 'schedule' };
    case EstadoCita.ATENDIDA:
      return { label: 'Completado', bgClass: '#f0fdf4', textClass: '#166534', icon: 'check_circle' };
    default:
      return { label: cita.estado, bgClass: '#f1f3ff', textClass: '#424752', icon: 'schedule' };
  }
}

function getButtonInfo(cita: Cita, startedIds: number[]): { label: string; variant: 'primary' | 'ghost' } | null {
  if (cita.estado === EstadoCita.ATENDIDA) {
    return { label: 'Ver Detalles', variant: 'ghost' };
  }
  if (startedIds.includes(cita.id)) {
    return { label: 'Continuar', variant: 'primary' };
  }
  return { label: 'Iniciar Consulta', variant: 'primary' };
}

export const MiAgenda: React.FC = () => {
  const navigate = useNavigate();
  const { citas, loading, error, loadAgenda } = useAgenda();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [startedCitaIds, setStartedCitaIds] = useState<number[]>(() =>
    startedConsultaStorage.getAllStarted()
  );
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadAgenda();
  }, [loadAgenda]);

  useEffect(() => {
    setStartedCitaIds(startedConsultaStorage.getAllStarted());
  }, [citas]);

  const filteredCitas = useMemo(() => {
    let result = citas;
    if (activeFilter === 'En Curso') {
      result = result.filter((c) => startedCitaIds.includes(c.id));
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
  }, [citas, activeFilter, searchQuery, startedCitaIds]);

  const handleCardAction = useCallback((cita: Cita) => {
    if (cita.estado !== EstadoCita.ATENDIDA) {
      startedConsultaStorage.markStarted(cita.id);
    }
    navigate(`/agendas/consulta/${cita.id}`);
  }, [navigate]);

  const filterTabs: FilterTab[] = ['Todos', 'Programados', 'En Curso', 'Completados'];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#faf9ff' }}>
      <SideNavBar />
      <main className="flex-1 ml-60 h-screen overflow-y-auto">
        <header
          className="flex justify-end items-center h-16 px-8 border-b sticky top-0 z-40"
          style={{ backgroundColor: 'rgba(255,255,255,0.8)', borderColor: '#c2c6d4', backdropFilter: 'blur(8px)' }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2"
              style={{ backgroundColor: '#d7e2ff', color: '#0056b3', borderColor: '#c2c6d4' }}
            >
              DR
            </div>
          </div>
        </header>

        <div className="p-10 max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-black tracking-tight mb-2" style={{ color: '#141b2b' }}>
              Agenda Diaria
            </h1>
            <div className="flex items-center gap-2 font-medium" style={{ color: '#424752' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(today)}</span>
            </div>
          </div>

          <div
            className="bg-white border rounded-2xl p-6 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ borderColor: '#c2c6d4' }}
          >
            <div className="relative w-full sm:w-96">
              <svg
                className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={{ color: '#424752' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl border outline-none transition-all text-sm"
                style={{ backgroundColor: '#f1f3ff', borderColor: '#c2c6d4' }}
                onFocus={(e) => { e.target.style.borderColor = '#0056b3'; e.target.style.setProperty('--tw-ring-color', '#0056b3'); }}
                onBlur={(e) => { e.target.style.borderColor = '#c2c6d4'; }}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider mr-1" style={{ color: '#424752' }}>
                Estado:
              </span>
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    activeFilter === tab
                      ? 'text-white'
                      : 'hover:bg-[#e1e8fe]'
                  }`}
                  style={
                    activeFilter === tab
                      ? { backgroundColor: '#0056b3', color: '#ffffff' }
                      : { color: '#424752' }
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
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#424752' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium" style={{ color: '#424752' }}>
                No hay citas {activeFilter !== 'Todos' ? activeFilter.toLowerCase() : ''}
              </p>
              <p className="text-sm mt-1" style={{ color: '#424752' }}>
                {activeFilter === 'Todos' ? 'Aún no tienes citas asignadas para hoy.' : 'Ninguna cita coincide con este filtro.'}
              </p>
            </div>
          )}

          {!loading && filteredCitas.length > 0 && (
            <div className="space-y-4">
              {filteredCitas.map((cita) => {
                const statusInfo = getStatusInfo(cita, startedCitaIds);
                const btnInfo = getButtonInfo(cita, startedCitaIds);
                const isInProgress = activeFilter === 'En Curso';
                const nombreCompleto = cita.paciente_nombre || `Paciente #${cita.paciente_id}`;

                return (
                  <div
                    key={cita.id}
                    className="bg-white border-2 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm transition-all hover:shadow-md gap-4"
                    style={{
                      borderColor: isInProgress ? '#0056b3' : '#c2c6d4',
                      ...(isInProgress ? { ring: '1px solid #0056b3' } : {}),
                    }}
                  >
                    <div className="flex items-center gap-6 sm:gap-10 w-full sm:w-auto">
                      <div className="text-center w-20 shrink-0">
                        <p className="text-2xl font-black leading-tight" style={{ color: '#141b2b' }}>
                          {cita.hora?.split(':').slice(0, 2).join(':') || '--:--'}
                        </p>
                      </div>

                      <div className="h-10 w-px shrink-0" style={{ backgroundColor: '#c2c6d4' }} />

                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-bold shrink-0 text-sm"
                          style={{ backgroundColor: '#d7e2ff', color: '#0056b3' }}
                        >
                          {cita.paciente_nombre ? getInitials(cita.paciente_nombre) : `P${cita.paciente_id}`}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-black truncate" style={{ color: '#141b2b' }}>
                            {nombreCompleto}
                          </h3>
                          <div className="flex items-center gap-1.5 text-sm" style={{ color: '#424752' }}>
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

                      {btnInfo && (
                        <button
                          onClick={() => handleCardAction(cita)}
                          className={`px-6 h-11 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shrink-0 ${
                            btnInfo.variant === 'primary'
                              ? 'text-white shadow-lg hover:opacity-90'
                              : 'hover:bg-[#e1e8fe]'
                          }`}
                          style={
                            btnInfo.variant === 'primary'
                              ? { backgroundColor: '#0056b3' }
                              : { color: '#0056b3' }
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
