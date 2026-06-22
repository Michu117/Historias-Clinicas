import { useState, useCallback } from 'react';
import { disponibilidadService, TimeSlot } from '../services/api/disponibilidadService';

interface UseAvailabilityResult {
  slots: TimeSlot[];
  loading: boolean;
  error: string | null;
  loadSlots: (profesionalId: number, fecha: string) => Promise<void>;
}

export const useAvailability = (): UseAvailabilityResult => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadSlots = useCallback(async (profesionalId: number, fecha: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await disponibilidadService.obtenerSlots(profesionalId, fecha);
      setSlots(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar disponibilidad';
      setError(message);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { slots, loading, error, loadSlots };
};

export default useAvailability;
