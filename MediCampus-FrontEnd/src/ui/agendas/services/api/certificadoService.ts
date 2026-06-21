import axiosInstance from './axiosConfig';
import { CitaBackendDTO } from './citaService';
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

const API_PATH = '/v1/agendas/certificados/';
const CITAS_PATH = '/v1/agendas/citas/';
const SERVICIOS_PATH = '/v1/agendas/servicios/';
const CONSULTAS_PATH = '/v1/agendas/consultas/';
const AUTH_USERS_PATH = '/v1/auth/users/';

interface ConsultaResponse {
  data: {
    observaciones?: string;
  } | null;
}

interface UserDetailResponse {
  id: number;
  correo: string;
  usuario: {
    nombre: string;
    apellido: string;
    cedula: string;
  } | null;
}

async function fetchEspecialidad(servicioId: number): Promise<string> {
  try {
    const response = await axiosInstance.get<{ id: number; nombre: string }>(`${SERVICIOS_PATH}${servicioId}/`);
    return response.data?.nombre || '';
  } catch {
    return '';
  }
}

async function fetchObservaciones(citaId: number): Promise<string | undefined> {
  try {
    const response = await axiosInstance.get<ConsultaResponse>(CONSULTAS_PATH, {
      params: { cita_id: citaId },
    });
    return response.data?.data?.observaciones || undefined;
  } catch {
    return undefined;
  }
}

async function fetchCedula(userId: number): Promise<string> {
  try {
    const response = await axiosInstance.get<UserDetailResponse>(`${AUTH_USERS_PATH}${userId}`);
    return response.data?.usuario?.cedula || '';
  } catch {
    return '';
  }
}

export const certificadoService = {
  getCertificadoData: async (citaId: number): Promise<ApiResponse<CertificadoData>> => {
    try {
      const response = await axiosInstance.get<CitaBackendDTO>(`${CITAS_PATH}${citaId}/`);
      const dto = response.data;
      const [especialidad, observaciones, pacienteCedula, profesionalCedula] = await Promise.all([
        dto.servicios?.[0] ? fetchEspecialidad(dto.servicios[0]) : Promise.resolve(''),
        fetchObservaciones(citaId),
        dto.usuario_id ? fetchCedula(dto.usuario_id) : Promise.resolve(''),
        dto.profesional_id ? fetchCedula(dto.profesional_id) : Promise.resolve(''),
      ]);

      const fechaObj = new Date(dto.fecha_hora);
      const fecha = isNaN(fechaObj.getTime()) ? '' : fechaObj.toISOString().split('T')[0];
      const hora = isNaN(fechaObj.getTime()) ? ''
        : `${String(fechaObj.getUTCHours()).padStart(2, '0')}:${String(fechaObj.getUTCMinutes()).padStart(2, '0')}`;

      return {
        success: true,
        data: {
          citaId: dto.id,
          pacienteNombre: dto.paciente_nombre || '',
          pacienteCedula,
          profesionalNombre: dto.profesional_nombre || '',
          profesionalCedula,
          especialidad,
          fecha,
          hora,
          motivo: dto.motivo || undefined,
          observaciones,
          fechaEmision: new Date().toISOString(),
        },
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      return {
        success: false,
        message: err.message || 'Error al obtener datos del certificado',
      };
    }
  },

  downloadCertificadoPDF: async (citaId: number): Promise<ApiResponse<Blob>> => {
    try {
      await axiosInstance.post(API_PATH, { cita: citaId, tipo: 'Asistencia' });

      const data = await certificadoService.getCertificadoData(citaId);
      if (!data.success || !data.data) {
        throw new Error('No se pudieron obtener los datos del certificado');
      }

      const info = data.data;
      const now = new Date(info.fechaEmision);
      const fechaEmision = now.toLocaleDateString('es-EC', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });

      const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Certificado de Atención Médica</title>
<style>
  @page { margin: 2cm; }
  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    color: #1a1a1a;
    max-width: 700px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  .header {
    text-align: center;
    border-bottom: 3px double #1a5276;
    padding-bottom: 20px;
    margin-bottom: 30px;
  }
  .header h1 {
    font-size: 22px;
    color: #1a5276;
    margin: 0 0 5px 0;
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  .header h2 {
    font-size: 14px;
    color: #555;
    font-weight: normal;
    margin: 0;
  }
  .title {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    color: #1a5276;
    margin: 25px 0;
    text-transform: uppercase;
  }
  .info-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }
  .info-table td {
    padding: 8px 12px;
    border: 1px solid #ccc;
    vertical-align: top;
  }
  .info-table .label {
    font-weight: bold;
    background: #f0f4f8;
    width: 130px;
    color: #1a5276;
  }
  .info-table .value {
    color: #333;
  }
  .observaciones {
    margin: 20px 0;
    padding: 15px;
    background: #f9f9f9;
    border-left: 4px solid #1a5276;
    border-radius: 4px;
    font-style: italic;
    color: #444;
  }
  .footer {
    text-align: center;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #ccc;
    font-size: 11px;
    color: #888;
  }
  .stamp {
    text-align: center;
    margin-top: 30px;
  }
  .stamp .line {
    display: inline-block;
    width: 200px;
    border-top: 1px solid #333;
    margin-top: 50px;
    padding-top: 8px;
    font-size: 13px;
    color: #555;
  }
</style>
</head>
<body>
<div class="header">
  <h1>MediCampus</h1>
  <h2>Sistema Integral de Salud</h2>
</div>

<div class="title">Certificado de Atención Médica</div>

<table class="info-table">
  <tr>
    <td class="label">Paciente</td>
    <td class="value">${info.pacienteNombre || 'No registrado'}</td>
  </tr>
  <tr>
    <td class="label">Cédula</td>
    <td class="value">${info.pacienteCedula || 'No disponible'}</td>
  </tr>
  <tr>
    <td class="label">Atendido por</td>
    <td class="value">${info.profesionalNombre || 'No registrado'}</td>
  </tr>
  <tr>
    <td class="label">Especialidad</td>
    <td class="value">${info.especialidad || 'No especificada'}</td>
  </tr>
  <tr>
    <td class="label">Fecha de atención</td>
    <td class="value">${info.fecha || 'No registrada'}</td>
  </tr>
  <tr>
    <td class="label">Hora</td>
    <td class="value">${info.hora || 'No registrada'}</td>
  </tr>
  <tr>
    <td class="label">Motivo</td>
    <td class="value">${info.motivo || 'No especificado'}</td>
  </tr>
</table>

${info.observaciones ? `
<div class="observaciones">
  <strong>Observaciones:</strong><br>
  ${info.observaciones}
</div>
` : ''}

<div class="stamp">
  <div class="line">Firma del profesional</div>
</div>

<div class="footer">
  <p>Documento generado por MediCampus el ${fechaEmision}</p>
  <p>Este certificado es válido como constancia de atención médica.</p>
</div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      return { success: true, data: blob };
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || 'Error al descargar certificado');
    }
  },
};
