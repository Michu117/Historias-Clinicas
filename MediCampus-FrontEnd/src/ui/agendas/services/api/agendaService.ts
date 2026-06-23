import citaService from './citaService';
import { Cita } from '../../types';

export interface AgendaFilters {
  usuario_id?: number;
  profesional_id?: number;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export const agendaService = {
  getAgenda: async (filters?: AgendaFilters): Promise<Cita[]> => {
    const params: Record<string, string | number> = {};
    if (filters?.usuario_id) params.usuario_id = filters.usuario_id;
    if (filters?.profesional_id) params.profesional_id = filters.profesional_id;
    if (filters?.estado) params.estado = filters.estado;
    return citaService.listar(params);
  },

  getCitaById: async (id: number): Promise<Cita> => {
    return citaService.obtener(id);
  },
};

export default agendaService;
