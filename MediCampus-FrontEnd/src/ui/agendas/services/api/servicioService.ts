import axiosInstance from './axiosConfig';
import { Servicio } from '../../types';

const API_PATH = '/v1/agendas/servicios/';

export interface ServicioBackendDTO {
  id: number;
  nombre: string;
  descripcion: string;
  es_activo: boolean;
  fecha_creacion: string;
}

function mapBackendToFrontend(dto: ServicioBackendDTO): Servicio {
  return {
    id: dto.id,
    nombre: dto.nombre,
    descripcion: dto.descripcion,
    es_activo: dto.es_activo,
    profesionales: [],
    created_at: dto.fecha_creacion,
  };
}

export const servicioService = {
  listar: async (): Promise<Servicio[]> => {
    const response = await axiosInstance.get<ServicioBackendDTO[]>(API_PATH);
    return (response.data || []).map(mapBackendToFrontend);
  },
};

export default servicioService;
