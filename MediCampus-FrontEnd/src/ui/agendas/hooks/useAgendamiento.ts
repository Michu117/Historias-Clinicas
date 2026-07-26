import { Servicio, Profesional, Cita, EstadoCita } from '../types';
import { isDatePast, hasConflict } from '../utils/validators/citaValidators';
import { messages } from '../utils/constants/messages';
import { timing } from '../utils/constants/timing';
import { servicioService } from '../services/api/servicioService';
import { profesionalService } from '../services/api/profesionalService';
import citaService from '../services/api/citaService';
import { getUserId } from '../services/storage/authStorage';

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
  loadProfesionales: (servicioId: number, servicioNombre?: string) => Promise<void>;
  checkDisponibilidad: (
    profesionalId: number,
    servicioId: number,
    fecha: string,
    hora: string
  ) => boolean;
  loadCitasPorProfesional: (profesionalId: number) => Promise<void>;
  crearCita: (citaData: Omit<Cita, 'id' | 'created_at' | 'updated_at'>) => Promise<Cita>;
  reset: () => void;
}

const defaultServicios: Servicio[] = [
  {
    id: 1,
    nombre: 'Medicina',
    descripcion: 'Atención médica general',
    es_activo: true,
    profesionales: [101],
  },
  {
    id: 2,
    nombre: 'Odontologia',
    descripcion: 'Atención odontológica',
    es_activo: true,
    profesionales: [102],
  },
  {
    id: 3,
    nombre: 'Trabajo Social',
    descripcion: 'Atención de trabajo social',
    es_activo: true,
    profesionales: [103],
  },
  {
    id: 4,
    nombre: 'Psicologia',
    descripcion: 'Atención psicológica',
    es_activo: true,
    profesionales: [104],
  },
];

const parseTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return Number.isNaN(hours) || Number.isNaN(minutes) ? NaN : hours * 60 + minutes;
};

export const useAgendamiento = (): UseAgendamientoState => {
  const agendamientoState: UseAgendamientoState = {
    servicios: [],
    profesionales: [],
    citasExistentes: [],
    selectedService: null,
    selectedProfessional: null,
    selectedDate: null,
    selectedTime: null,
    isLoading: false,
    error: null,
    loadServicios: async () => {
      agendamientoState.isLoading = true;
      agendamientoState.error = null;
      agendamientoState.servicios = [...defaultServicios];
      try {
        const data = await servicioService.listar();
        if (data.length > 0) {
          agendamientoState.servicios = data;
        }
      } catch {
        agendamientoState.servicios = [...defaultServicios];
      }
      agendamientoState.isLoading = false;
    },
    loadProfesionales: async (servicioId: number, servicioNombre?: string) => {
      agendamientoState.isLoading = true;
      agendamientoState.error = null;
      try {
        const nombreServicio = servicioNombre
          || agendamientoState.servicios.find((s) => s.id === servicioId)?.nombre
          || '';
        const data = await profesionalService.listarPorServicio(servicioId, nombreServicio);
        agendamientoState.profesionales = data;
      } catch {
        agendamientoState.profesionales = [];
      }
      agendamientoState.isLoading = false;
    },
    checkDisponibilidad: (profesionalId: number, servicioId: number, fecha: string, hora: string) => {
      const now = new Date();
      const requestedDate = new Date(fecha);
      if (isNaN(requestedDate.getTime())) {
        return false;
      }

      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (fecha <= todayStr) {
        return false;
      }

      const ninetyDaysFromNow = new Date(now);
      ninetyDaysFromNow.setDate(now.getDate() + 90);
      if (requestedDate > ninetyDaysFromNow) {
        return false;
      }

      const dayOfWeek = new Date(parseInt(fecha.split('-')[0]), parseInt(fecha.split('-')[1]) - 1, parseInt(fecha.split('-')[2])).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return false;
      }

      const timeMinutes = parseTime(hora);
      if (timeMinutes < parseTime(timing.scheduleStart) || timeMinutes >= parseTime(timing.scheduleEnd)) {
        return false;
      }

      if (timeMinutes >= parseTime(timing.scheduleBreakStart) && timeMinutes < parseTime(timing.scheduleBreakEnd)) {
        return false;
      }

      const conflict = agendamientoState.citasExistentes.some((cita) => {
        if (cita.profesional_id !== profesionalId || cita.fecha !== fecha) {
          return false;
        }
        const existingStart = parseTime(cita.hora);
        const existingEnd = existingStart + cita.duracion_minutos;
        const requestedEnd = timeMinutes + 30;
        return timeMinutes < existingEnd && requestedEnd > existingStart;
      });

      return !conflict;
    },
    loadCitasPorProfesional: async (profesionalId: number) => {
      try {
        const [comoProfesional, comoPaciente] = await Promise.all([
          citaService.listar({
            profesional_id: profesionalId,
            estado: ['AGENDADA', 'CONFIRMADA', 'ATENDIDA'].join(','),
          }),
          citaService.listar({
            usuario_id: profesionalId,
            estado: ['AGENDADA', 'CONFIRMADA', 'ATENDIDA'].join(','),
          }),
        ]);
        agendamientoState.citasExistentes = [...comoProfesional, ...comoPaciente];
      } catch {
        agendamientoState.citasExistentes = [];
      }
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

      try {
        const fecha_hora = `${citaData.fecha}T${citaData.hora}:00`;
        const created = await citaService.crear({
          usuario_id: citaData.paciente_id,
          profesional_id: citaData.profesional_id || null,
          fecha_hora,
          motivo: citaData.motivo,
          servicios: citaData.servicios_ids ?? [citaData.servicio_id],
        });

        agendamientoState.citasExistentes = [...agendamientoState.citasExistentes, created];
        agendamientoState.error = null;
        return created;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al crear la cita';
        agendamientoState.error = message;
        return Promise.resolve({} as Cita);
      }
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
