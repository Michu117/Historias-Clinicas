import axiosInstance from './axiosConfig';
import { Derivacion, DerivacionCreateDTO, DerivacionResponseDTO, EstadoDerivacion, Cita } from '../../types';
import { CitaBackendDTO, mapBackendToFrontend as mapCitaBackendToFrontend } from './citaService';

const API_PATH = '/v1/agendas/derivaciones/';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface DerivacionBackendDTO {
  id: number;
  usuario_id: number;
  remitente_id: number;
  destinatario: string;
  tipo: string;
  motivo: string;
  estado: string;
  fecha_creacion: string;
}

interface DerivacionCreateResponseDTO {
  derivacion: DerivacionBackendDTO;
  cita_agendada: CitaBackendDTO | null;
}

function mapBackendToFrontend(dto: DerivacionBackendDTO): Derivacion {
  return {
    id: dto.id,
    cita_origen_id: 0,
    profesional_origen_id: dto.remitente_id,
    usuario_id: dto.usuario_id,
    servicio_destino_id: 0,
    motivo: dto.motivo,
    estado: dto.estado as EstadoDerivacion,
    fecha_creacion: dto.fecha_creacion,
  };
}

export const derivacionService = {
  crearDerivacion: async (data: DerivacionCreateDTO): Promise<ApiResponse<Derivacion & { cita_agendada?: Cita }>> => {
    const payload = {
      usuario_id: data.usuario_id || data.cita_origen_id,
      remitente_id: data.profesional_destino_id || 1,
      destinatario: String(data.servicio_destino_id),
      tipo: 'INTERNA',
      motivo: data.motivo,
    };
    const response = await axiosInstance.post<DerivacionCreateResponseDTO>(API_PATH, payload);
    const result: Derivacion & { cita_agendada?: Cita } = {
      ...mapBackendToFrontend(response.data.derivacion),
      cita_agendada: response.data.cita_agendada ? mapCitaBackendToFrontend(response.data.cita_agendada) : undefined,
    };
    return {
      success: true,
      data: result,
    };
  },

  loadPendientes: async (profesionalId: number): Promise<ApiResponse<Derivacion[]>> => {
    const response = await axiosInstance.get<DerivacionBackendDTO[]>(API_PATH, {
      params: { remitente_id: profesionalId, estado: 'PENDIENTE' },
    });
    return {
      success: true,
      data: (response.data || []).map(mapBackendToFrontend),
    };
  },

  aceptarDerivacion: async (derivacionId: number): Promise<ApiResponse<DerivacionResponseDTO>> => {
    await axiosInstance.patch(`${API_PATH}${derivacionId}/`, { estado: 'ACEPTADA' });
    return {
      success: true,
      data: {
        id: derivacionId,
        estado: EstadoDerivacion.ACEPTADA,
        notas_respuesta: 'Derivación aceptada',
      },
    };
  },

  rechazarDerivacion: async (derivacionId: number, motivo?: string): Promise<ApiResponse<DerivacionResponseDTO>> => {
    await axiosInstance.patch(`${API_PATH}${derivacionId}/`, { estado: 'RECHAZADA', notas_respuesta: motivo });
    return {
      success: true,
      data: {
        id: derivacionId,
        estado: EstadoDerivacion.RECHAZADA,
        notas_respuesta: motivo,
      },
    };
  },
};

export default derivacionService;
