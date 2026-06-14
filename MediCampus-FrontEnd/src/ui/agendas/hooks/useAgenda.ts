/**
 * Stub file para hooks - se implementarán más adelante
 */

import { useState, useCallback } from 'react';
import { Cita } from '../types';

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

  const loadAgenda = useCallback(async (desde?: string, hasta?: string) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Conectar con API para obtener citas
      // Placeholder: retorna array vacío por ahora
      setCitas([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar agenda');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterByDateRange = useCallback(
    async (desde: string, hasta: string) => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Conectar con API para filtrar por rango de fechas
        setCitas([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al filtrar agenda');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    citas,
    loading,
    error,
    loadAgenda,
    filterByDateRange,
  };
};
