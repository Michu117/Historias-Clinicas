import { getToken } from '../storage/authStorage';

const API_BASE = '/api/v1/auth';

interface PacienteInfo {
  nombre: string;
  apellido: string;
}

export const pacienteService = {
  obtener: async (id: number): Promise<PacienteInfo | null> => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/users/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) return null;
      const data = await response.json();
      return {
        nombre: data.usuario?.nombre || '',
        apellido: data.usuario?.apellido || '',
      };
    } catch {
      return null;
    }
  },
};
