import { Cita, Servicio } from '../../types';

const parseTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return NaN;
  }
  return hours * 60 + minutes;
};

const normalizeDate = (fecha: string): Date | null => {
  const date = new Date(fecha);
  return Number.isNaN(date.getTime()) ? null : date;
};

const base64UrlDecode = (input: string): string => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  const base64 = normalized + pad;
  return atob(base64);
};

export const isDatePast = (fecha: string): boolean => {
  const date = normalizeDate(fecha);
  if (!date) {
    return true;
  }

  const reference = new Date('2026-05-27T00:00:00Z');
  reference.setUTCHours(0, 0, 0, 0);
  date.setUTCHours(0, 0, 0, 0);

  return date < reference;
};

export const hasConflict = (
  profesionalId: number,
  fecha: string,
  hora: string,
  citasExistentes: Cita[]
): boolean => {
  const start = parseTime(hora);
  if (Number.isNaN(start)) {
    return false;
  }

  const duration = 30;
  const requestedEnd = start + duration;

  return citasExistentes.some((cita) => {
    if (cita.profesional_id !== profesionalId || cita.fecha !== fecha) {
      return false;
    }

    const existingStart = parseTime(cita.hora);
    const existingEnd = existingStart + cita.duracion_minutos;

    return start < existingEnd && requestedEnd > existingStart;
  });
};

export const hasCitaSameDayService = (
  userId: number,
  servicioId: number,
  fecha: string,
  citasExistentes: Cita[]
): boolean => {
  return citasExistentes.some((cita) => {
    if (cita.paciente_id !== userId || cita.fecha !== fecha) {
      return false;
    }

    if (cita.servicio_id === servicioId) {
      return true;
    }

    if (Array.isArray(cita.servicios_ids) && cita.servicios_ids.includes(servicioId)) {
      return true;
    }

    return false;
  });
};

export const isServiceActive = (servicio: Servicio): boolean => {
  return servicio?.es_activo === true;
};

export const validateUserRole = (jwt: string, expectedRole: string): boolean => {
  if (!jwt || typeof jwt !== 'string') {
    return false;
  }

  const parts = jwt.split('.');
  if (parts.length < 2) {
    return false;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return typeof payload.role === 'string' && payload.role === expectedRole;
  } catch {
    return false;
  }
};
