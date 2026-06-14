import { useState, useCallback } from 'react';
import { Derivacion, DerivacionCreateDTO } from '../types';
import { derivacionService } from '../services/api/derivacionService';
import { validateDerivationDestiny, validateMotivo } from '../utils/validators/derivacionValidators';
import { getErrorMessage } from '../utils/errors/ErrorHandler';
import { messages } from '../utils/constants/messages';

interface UseDerivacionResult {
  pendientes: Derivacion[];
  loading: boolean;
  error: string | null;
  nuevaCitaId: number | null;
  crearDerivacion: (data: DerivacionCreateDTO) => Promise<void>;
  loadPendientes: (profesionalId: number) => Promise<void>;
  aceptarDerivacion: (derivacionId: number) => Promise<void>;
  rechazarDerivacion: (derivacionId: number, motivo?: string) => Promise<void>;
}

export const useDerivacion = (): UseDerivacionResult => {
  const [pendientes, setPendientes] = useState<Derivacion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nuevaCitaId, setNuevaCitaId] = useState<number | null>(null);

  const crearDerivacion = useCallback(async (data: DerivacionCreateDTO) => {
    setLoading(true);
    setError(null);

    if (!validateMotivo(data.motivo)) {
      setError(messages.derivacion.motivoMinLength);
      setLoading(false);
      return;
    }

    try {
      await derivacionService.crearDerivacion(data);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPendientes = useCallback(async (profesionalId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await derivacionService.loadPendientes(profesionalId);
      setPendientes(response.data || []);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const aceptarDerivacion = useCallback(async (derivacionId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await derivacionService.aceptarDerivacion(derivacionId);
      if (response.data) {
        setPendientes(prev => prev.filter(d => d.id !== derivacionId));
        setNuevaCitaId(Date.now());
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const rechazarDerivacion = useCallback(async (derivacionId: number, motivo?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await derivacionService.rechazarDerivacion(derivacionId, motivo);
      if (response.data) {
        setPendientes(prev => prev.filter(d => d.id !== derivacionId));
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return { pendientes, loading, error, nuevaCitaId, crearDerivacion, loadPendientes, aceptarDerivacion, rechazarDerivacion };
};
