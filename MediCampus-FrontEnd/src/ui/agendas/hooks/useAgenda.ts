import { useState, useCallback } from 'react';
import { Cita, Servicio } from '../types';
import { agendaService } from '../services/api/agendaService';
import { getToken, getUserId } from '../services/storage/authStorage';
import { getTokenRole } from '../utils/auth/jwtValidator';
import { servicioService } from '../services/api/servicioService';

const ROLE_SERVICE_MAP: Record<string, string> = {
  medico: 'Medicina',
  psicologo: 'Psicologia',
  odontologo: 'Odontologia',
  trabajador_social: 'Trabajo Social',
};

function getServicioIdsForRole(servicios: Servicio[], role: string | null): number[] {
  if (!role || !ROLE_SERVICE_MAP[role]) return [];
  const expectedName = ROLE_SERVICE_MAP[role];
  return servicios
    .filter((s) => s.nombre === expectedName)
    .map((s) => s.id);
}

interface UseAgendaState {
  citas: Cita[];
  loading: boolean;
  error: string | null;
  loadAgenda: (desde?: string, hasta?: string) => Promise<void>;
  filterByDateRange: (desde: string, hasta: string) => Promise<void>;
}

export const useAgenda = (): UseAgendaState => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterCitasByRole = async (data: Cita[]): Promise<Cita[]> => {
    try {
      const token = getToken();
      const role = token ? getTokenRole(token) : null;
      if (!role || !ROLE_SERVICE_MAP[role]) return data;

      const servicios = await servicioService.listar();
      const allowedIds = getServicioIdsForRole(servicios, role);
      if (allowedIds.length === 0) return data;

      return data.filter((c) => allowedIds.includes(c.servicio_id));
    } catch {
      return data;
    }
  };

  const loadAgenda = useCallback(async (desde?: string, hasta?: string) => {
    setLoading(true);
    setError(null);
    try {
      const profesionalId = getUserId();
      const data = await agendaService.getAgenda({
        profesional_id: profesionalId ?? undefined,
      });
      const filtered = await filterCitasByRole(data || []);
      setCitas(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar agenda');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterByDateRange = useCallback(async (desde: string, hasta: string) => {
    setLoading(true);
    setError(null);
    try {
      const profesionalId = getUserId();
      const data = await agendaService.getAgenda({
        profesional_id: profesionalId ?? undefined,
      });
      const filtered = (data || []).filter((cita) => {
        if (desde && cita.fecha < desde) return false;
        if (hasta && cita.fecha > hasta) return false;
        return true;
      });
      const roleFiltered = await filterCitasByRole(filtered);
      setCitas(roleFiltered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al filtrar agenda');
    } finally {
      setLoading(false);
    }
  }, []);

  return { citas, loading, error, loadAgenda, filterByDateRange };
};
