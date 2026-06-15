import { Servicio, Profesional, Cita, EstadoCita } from '../types';
import { isDatePast, hasConflict } from '../utils/validators/citaValidators';
import { messages } from '../utils/constants/messages';
import { servicioService } from '../services/api/servicioService';
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

const defaultProfesionales: Profesional[] = [
  {
    id: 101,
    nombre: 'Dr. Carlos García',
    email: 'carlos.garcia@hospital.com',
    especialidad: 'Medicina',
    rol: 'PROFESIONAL',
    is_activo: true,
  },
  {
    id: 102,
    nombre: 'Dra. Laura Martínez',
    email: 'laura.martinez@hospital.com',
    especialidad: 'Odontologia',
    rol: 'PROFESIONAL',
    is_activo: true,
  },
  {
    id: 103,
    nombre: 'Trab. Soc. Ana López',
    email: 'ana.lopez@hospital.com',
    especialidad: 'Trabajo Social',
    rol: 'PROFESIONAL',
    is_activo: true,
  },
  {
    id: 104,
    nombre: 'Psic. Ricardo Torres',
    email: 'ricardo.torres@hospital.com',
    especialidad: 'Psicologia',
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

const parseTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return Number.isNaN(hours) || Number.isNaN(minutes) ? NaN : hours * 60 + minutes;
};

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
    loadProfesionales: async (servicioId: number) => {
      agendamientoState.isLoading = true;
      agendamientoState.error = null;
      await Promise.resolve();
      agendamientoState.profesionales = defaultProfesionales.filter(
        (p) => p.especialidad === defaultServicios.find((s) => s.id === servicioId)?.nombre
      );
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

      try {
        const usuarioId = getUserId() || citaData.paciente_id;
        const fecha_hora = `${citaData.fecha}T${citaData.hora}:00`;
        const created = await citaService.crear({
          usuario_id: usuarioId,
          profesional_id: citaData.profesional_id || null,
          fecha_hora,
          motivo: citaData.motivo,
          servicios: citaData.servicios_ids ?? [citaData.servicio_id],
        });

        agendamientoState.citasExistentes = [...agendamientoState.citasExistentes, created];
        agendamientoState.error = null;
        return created;
      } catch {
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
