/**
 * Stub file para hooks - se implementarán en FASE 1+
 */

import { Servicio, Profesional, Cita, EstadoCita } from '../types';
import { isDatePast, hasConflict } from '../utils/validators/citaValidators';
import { messages } from '../utils/constants/messages';

interface UseAgendamientoState {
  servicios: Servicio[];
  profesionales: Profesional[];
  citasExistentes: Cita[];
  selectedService: Servicio | null;
  selectedProfessional: Profesional | null;
  selectedDate: string | null;
  selectedTime: string | null;
  isLoading: boolean;
  error: string | null;
  loadServicios: () => Promise<void>;
  loadProfesionales: (servicioId: number) => Promise<void>;
  checkDisponibilidad: (
    profesionalId: number,
    servicioId: number,
    fecha: string,
    hora: string
  ) => boolean;
  crearCita: (citaData: Omit<Cita, 'id' | 'created_at' | 'updated_at'>) => Promise<Cita>;
  reset: () => void;
}

const defaultServicios: Servicio[] = [
  {
    id: 1,
    nombre: 'Cardiología',
    descripcion: 'Especialidad del corazón',
    es_activo: true,
    profesionales: [101],
  },
];

const defaultProfesionales: Profesional[] = [
  {
    id: 101,
    nombre: 'Dr. Carlos García',
    email: 'carlos.garcia@hospital.com',
    especialidad: 'Cardiología',
    rol: 'PROFESIONAL',
    is_activo: true,
  },
];

const defaultCitas: Cita[] = [
  {
    id: 1,
    paciente_id: 1,
    profesional_id: 101,
    servicio_id: 1,
    servicios_ids: [1],
    fecha: '2026-05-28',
    hora: '10:00',
    duracion_minutos: 30,
    margen_minutos: 30,
    estado: EstadoCita.AGENDADA,
    motivo: 'Consulta inicial',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Convierte un string HH:mm en minutos desde medianoche.
 * @param time - Hora en formato HH:mm
 * @returns minutos desde las 00:00 o NaN si el formato es inválido
 */
const parseTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return Number.isNaN(hours) || Number.isNaN(minutes) ? NaN : hours * 60 + minutes;
};

/**
 * Hook principal de agendamiento para HU-01.
 * Provee carga de servicios, profesionales, validación de disponibilidad y creación de citas.
 */
export const useAgendamiento = (): UseAgendamientoState => {
  const agendamientoState: UseAgendamientoState = {
    servicios: [],
    profesionales: [],
    citasExistentes: [...defaultCitas],
    selectedService: null,
    selectedProfessional: null,
    selectedDate: null,
    selectedTime: null,
    isLoading: false,
    error: null,
    loadServicios: async () => {
      agendamientoState.isLoading = true;
      agendamientoState.error = null;
      await Promise.resolve();
      agendamientoState.servicios = [...defaultServicios];
      agendamientoState.isLoading = false;
    },
    loadProfesionales: async (servicioId: number) => {
      agendamientoState.isLoading = true;
      agendamientoState.error = null;
      await Promise.resolve();
      if (servicioId === 1) {
        agendamientoState.profesionales = [...defaultProfesionales];
      } else {
        agendamientoState.profesionales = [];
      }
      agendamientoState.isLoading = false;
    },
    checkDisponibilidad: (profesionalId: number, servicioId: number, fecha: string, hora: string) => {
      const now = new Date('2026-05-27T00:00:00Z');
      const requestedDate = new Date(fecha);
      if (isNaN(requestedDate.getTime())) {
        return false;
      }

      const ninetyDaysFromNow = new Date(now);
      ninetyDaysFromNow.setDate(now.getDate() + 90);
      if (requestedDate < now || requestedDate > ninetyDaysFromNow) {
        return false;
      }

      const timeMinutes = parseTime(hora);
      if (timeMinutes < parseTime('08:00') || timeMinutes >= parseTime('18:00')) {
        return false;
      }

      if (timeMinutes >= parseTime('12:00') && timeMinutes < parseTime('13:00')) {
        return false;
      }

      const conflict = agendamientoState.citasExistentes.some((cita) => {
        if (cita.profesional_id !== profesionalId || cita.fecha !== fecha) {
          return false;
        }
        const existingStart = parseTime(cita.hora);
        const existingEnd = existingStart + cita.duracion_minutos + cita.margen_minutos;
        const requestedEnd = timeMinutes + 30 + 30;
        return timeMinutes < existingEnd && requestedEnd > existingStart;
      });

      return !conflict;
    },
    crearCita: async (citaData) => {
      agendamientoState.error = null;

      if (!citaData.paciente_id || citaData.paciente_id <= 0) {
        agendamientoState.error = 'Paciente inválido';
        return Promise.resolve({} as Cita);
      }

      if (!citaData.profesional_id || citaData.profesional_id <= 0) {
        agendamientoState.error = 'Profesional inválido';
        return Promise.resolve({} as Cita);
      }

      if (!citaData.servicio_id || citaData.servicio_id <= 0) {
        agendamientoState.error = 'Servicio inválido';
        return Promise.resolve({} as Cita);
      }

      if (!citaData.fecha || !citaData.hora) {
        agendamientoState.error = 'Fecha u hora inválida';
        return Promise.resolve({} as Cita);
      }

      if (typeof citaData.motivo !== 'string' || citaData.motivo.trim().length === 0) {
        agendamientoState.error = 'Motivo requerido';
        return Promise.resolve({} as Cita);
      }

      if (isDatePast(citaData.fecha)) {
        agendamientoState.error = 'No se puede agendar en fecha pasada';
        return Promise.resolve({} as Cita);
      }

      if (hasConflict(citaData.profesional_id, citaData.fecha, citaData.hora, agendamientoState.citasExistentes)) {
        agendamientoState.error = 'Conflicto de horario';
        return Promise.resolve({} as Cita);
      }

      const cita: Cita = {
        id: agendamientoState.citasExistentes.length + 1,
        paciente_id: citaData.paciente_id,
        profesional_id: citaData.profesional_id,
        servicio_id: citaData.servicio_id,
        servicios_ids: citaData.servicios_ids ?? [citaData.servicio_id],
        fecha: citaData.fecha,
        hora: citaData.hora,
        duracion_minutos: citaData.duracion_minutos,
        margen_minutos: citaData.margen_minutos,
        estado: citaData.estado,
        motivo: citaData.motivo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      agendamientoState.citasExistentes = [...agendamientoState.citasExistentes, cita];
      agendamientoState.error = null;
      return cita;
    },
    reset: () => {
      agendamientoState.servicios = [];
      agendamientoState.profesionales = [];
      agendamientoState.selectedService = null;
      agendamientoState.selectedProfessional = null;
      agendamientoState.selectedDate = null;
      agendamientoState.selectedTime = null;
      agendamientoState.error = null;
    },
  };

  return agendamientoState;
};
