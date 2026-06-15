import axiosInstance from './axiosConfig';
import { Cita, EstadoCita } from '../../types';

const API_PATH = '/v1/agendas/citas/';

export interface CitaBackendDTO {
  id: number;
  usuario_id: number;
  profesional_id: number | null;
  fecha_hora: string;
  estado: string;
  motivo: string;
  servicios: number[];
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CrearCitaDTO {
  usuario_id: number;
  profesional_id?: number | null;
  fecha_hora: string;
  motivo?: string;
  servicios: number[];
}

function mapBackendToFrontend(dto: CitaBackendDTO): Cita {
  const fechaObj = new Date(dto.fecha_hora);
  const fecha = fechaObj.toISOString().split('T')[0];
  const hora = fechaObj.toTimeString().slice(0, 5);

  return {
    id: dto.id,
    paciente_id: dto.usuario_id,
    profesional_id: dto.profesional_id ?? 0,
    servicio_id: dto.servicios[0] || 0,
    servicios_ids: dto.servicios,
    fecha,
    hora,
    duracion_minutos: 30,
    margen_minutos: 30,
    estado: dto.estado as EstadoCita,
    motivo: dto.motivo,
    created_at: dto.fecha_creacion,
    updated_at: dto.fecha_actualizacion,
  };
}

export const citaService = {
  listar: async (params?: { usuario_id?: number; estado?: string }): Promise<Cita[]> => {
    const response = await axiosInstance.get<CitaBackendDTO[]>(API_PATH, { params });
    return (response.data || []).map(mapBackendToFrontend);
  },

  crear: async (data: CrearCitaDTO): Promise<Cita> => {
    const response = await axiosInstance.post<CitaBackendDTO>(API_PATH, data);
    return mapBackendToFrontend(response.data);
  },

  obtener: async (id: number): Promise<Cita> => {
    const response = await axiosInstance.get<CitaBackendDTO>(`${API_PATH}${id}/`);
    return mapBackendToFrontend(response.data);
  },
};

export default citaService;
