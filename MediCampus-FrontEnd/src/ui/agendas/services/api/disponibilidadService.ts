import axiosInstance from './axiosConfig';
import { CitaBackendDTO } from './citaService';
import { timing } from '../../utils/constants/timing';
import { timeStringToMinutes, minutesToTimeString } from '../../utils/formatters/timeFormatters';

export interface TimeSlot {
  hora: string;
  disponible: boolean;
  fecha: string;
}

export const disponibilidadService = {
  obtenerSlots: async (
    profesionalId: number,
    fecha: string,
  ): Promise<TimeSlot[]> => {
    const [respProfesional, respPaciente] = await Promise.all([
      axiosInstance.get<CitaBackendDTO[]>('/v1/agendas/citas/', {
        params: {
          profesional_id: profesionalId,
          estado: ['AGENDADA', 'CONFIRMADA', 'ATENDIDA'].join(','),
          fecha_desde: fecha,
          fecha_hasta: fecha,
        },
      }),
      axiosInstance.get<CitaBackendDTO[]>('/v1/agendas/citas/', {
        params: {
          usuario_id: profesionalId,
          estado: ['AGENDADA', 'CONFIRMADA', 'ATENDIDA'].join(','),
          fecha_desde: fecha,
          fecha_hasta: fecha,
        },
      }),
    ]);

    const citasDelDia: CitaBackendDTO[] = [
      ...(respProfesional.data || []),
      ...(respPaciente.data || []),
    ];

    const ahora = new Date();
    const minDateTime = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
    const hoyStr = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

    const slots: TimeSlot[] = [];
    const inicio = timing.scheduleStart;
    const fin = timing.scheduleEnd;
    const duracion = timing.citaDurationMinutes;
    const almuerzoInicio = timing.scheduleBreakStart;
    const almuerzoFin = timing.scheduleBreakEnd;

    let current = timeStringToMinutes(inicio);
    const endMinutes = timeStringToMinutes(fin);
    const lunchStartMin = timeStringToMinutes(almuerzoInicio);
    const lunchEndMin = timeStringToMinutes(almuerzoFin);

    while (current + duracion <= endMinutes) {
      if (current >= lunchStartMin && current < lunchEndMin) {
        current = lunchEndMin;
        continue;
      }

      const horaStr = minutesToTimeString(current);
      const slotEnd = current + duracion;

      const slotDateTime = new Date(`${fecha}T${horaStr}:00`);
      const dentroDe24h = slotDateTime < minDateTime;
      const esPasado = fecha === hoyStr && current <= minutosAhora;

      const hayConflicto = citasDelDia.some((cita) => {
        const citaHora = new Date(cita.fecha_hora);
        const citaStart = citaHora.getUTCHours() * 60 + citaHora.getUTCMinutes();
        const citaEnd = citaStart + 60;
        return current < citaEnd && slotEnd > citaStart;
      });

      slots.push({
        hora: horaStr,
        disponible: !hayConflicto && !esPasado && !dentroDe24h,
        fecha,
      });

      current += 30;
    }

    return slots;
  },
};

export default disponibilidadService;
