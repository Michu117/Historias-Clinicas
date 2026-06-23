import axiosInstance from './axiosConfig';

const API_PATH = '/v1/agendas/consultas/';

const TIPO_MAP: Record<string, string> = {
  'Medicina General': 'medica',
  'Medicina': 'medica',
  'Odontología': 'odontologica',
  'Odontologia': 'odontologica',
  'Psicología': 'psicologica',
  'Psicologia': 'psicologica',
  'Trabajo Social': 'social',
};

function mapTipoConsulta(serviceName: string): string {
  return TIPO_MAP[serviceName] || serviceName;
}

export interface ConsultaBackendResponse {
  id: number;
  cita: number;
  historia_clinica_id: number;
  [key: string]: unknown;
}

export const consultaService = {
  obtenerConsulta: async (citaId: number): Promise<{ data: unknown }> => {
    const response = await axiosInstance.get<{ data: unknown }>(API_PATH, {
      params: { cita_id: citaId },
    });
    return { data: response.data?.data ?? null };
  },

  crearConsulta: async (citaId: number, tipo: string, data: Record<string, unknown>): Promise<{ data: unknown }> => {
    const { cita: _cita, ...rest } = data;
    const payload = {
      cita_id: citaId,
      tipo_consulta: mapTipoConsulta(tipo),
      datos_consulta: rest,
    };
    const response = await axiosInstance.post<ConsultaBackendResponse>(API_PATH, payload);
    return { data: response.data };
  },

  guardarConsulta: async (consultaId: number, tipo: string, data: Record<string, unknown>): Promise<{ data: unknown }> => {
    const { cita: _cita, ...rest } = data;
    const payload = {
      tipo_consulta: mapTipoConsulta(tipo),
      datos_consulta: rest,
    };
    const response = await axiosInstance.patch<ConsultaBackendResponse>(`${API_PATH}${consultaId}/`, payload);
    return { data: response.data };
  },
};

export default consultaService;
