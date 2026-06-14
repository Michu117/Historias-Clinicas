import { Derivacion, DerivacionCreateDTO, DerivacionResponseDTO, EstadoDerivacion } from '../../types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const derivacionService = {
  crearDerivacion: async (data: DerivacionCreateDTO): Promise<ApiResponse<Derivacion>> => {
    return {
      success: true,
      data: {
        id: Date.now(),
        cita_origen_id: data.cita_origen_id,
        profesional_origen_id: 101,
        servicio_destino_id: data.servicio_destino_id,
        profesional_destino_id: data.profesional_destino_id,
        motivo: data.motivo,
        estado: EstadoDerivacion.PENDIENTE,
        fecha_creacion: new Date().toISOString(),
      },
    };
  },

  loadPendientes: async (profesionalId: number): Promise<ApiResponse<Derivacion[]>> => {
    return {
      success: true,
      data: [],
    };
  },

  aceptarDerivacion: async (derivacionId: number): Promise<ApiResponse<DerivacionResponseDTO>> => {
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
