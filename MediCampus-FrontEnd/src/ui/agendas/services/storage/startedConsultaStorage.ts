const STORAGE_KEY = 'agendas_started_consultas';

export const startedConsultaStorage = {
  markStarted: (citaId: number) => {
    const started = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    started[citaId] = true;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(started));
  },
  isStarted: (citaId: number): boolean => {
    const started = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    return !!started[citaId];
  },
  markCompleted: (citaId: number) => {
    const started = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    delete started[citaId];
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(started));
  },
  getAllStarted: (): number[] => {
    const started = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    return Object.keys(started).map(Number);
  },
};
