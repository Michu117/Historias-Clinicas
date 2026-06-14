import { ApiResponse } from '../../types';

export interface CertificadoData {
  citaId: number;
  pacienteNombre: string;
  pacienteCedula: string;
  profesionalNombre: string;
  profesionalCedula: string;
  especialidad: string;
  fecha: string;
  hora: string;
  motivo?: string;
  observaciones?: string;
  fechaEmision: string;
}

export const certificadoService = {
  getCertificadoData: async (citaId: number): Promise<ApiResponse<CertificadoData>> => {
    return {
      success: true,
      data: {
        citaId,
        pacienteNombre: 'Paciente Ejemplo',
        pacienteCedula: '000-0000000-0',
        profesionalNombre: 'Dr. Profesional',
        profesionalCedula: '000-0000000-0',
        especialidad: 'Medicina General',
        fecha: new Date().toISOString().split('T')[0],
        hora: '10:00',
        motivo: 'Consulta general',
        observaciones: 'Paciente en buen estado.',
        fechaEmision: new Date().toISOString(),
      },
    };
  },

  downloadCertificadoPDF: async (_citaId: number): Promise<ApiResponse<Blob>> => {
    const blob = new Blob(['PDF content'], { type: 'application/pdf' });
    return {
      success: true,
      data: blob,
    };
  },
};
