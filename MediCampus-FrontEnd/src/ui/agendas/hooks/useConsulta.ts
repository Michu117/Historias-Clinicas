import { useState, useEffect, useCallback } from 'react';
import { Cita, Consulta, EstadoCita } from '../types';
import { consultaService } from '../services/api/consultaService';
import { citaService } from '../services/api/citaService';
import { isConsultaEditable } from '../utils/validators/consultaValidators';
import { getErrorMessage } from '../utils/errors/ErrorHandler';

interface UseConsultaResult {
  consulta: Consulta | null;
  loading: boolean;
  error: string | null;
  cita: Cita | null;
  obtenerConsulta: (citaId: number) => Promise<void>;
  crearConsulta: (citaId: number, tipo: string, data: any) => Promise<Consulta | null>;
  guardarConsulta: (consultaId: number, tipo: string, data: any) => Promise<Consulta | null>;
}

export const useConsulta = (initialCitaId?: number): UseConsultaResult => {
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [cita, setCita] = useState<Cita | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCita = useCallback(async (citaId: number) => {
    try {
      const fetched = await citaService.obtener(citaId);
      setCita(fetched);
    } catch {
      setCita(null);
    }
  }, []);

  const obtenerConsulta = useCallback(async (citaId: number) => {
    setLoading(true);
    setError(null);
    try {
      await fetchCita(citaId);
      const response = await consultaService.obtenerConsulta(citaId);
      setConsulta(response.data as Consulta | null);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [fetchCita]);

  const crearConsulta = useCallback(async (citaId: number, tipo: string, data: any): Promise<Consulta | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await consultaService.crearConsulta(citaId, tipo, data);
      const created = response.data as Consulta | null;
      setConsulta(created);
      setCita(prevCita => prevCita ? { ...prevCita, estado: EstadoCita.ATENDIDA } : null);
      return created;
    } catch (err: any) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const guardarConsulta = useCallback(async (consultaId: number, tipo: string, data: any): Promise<Consulta | null> => {
    setLoading(true);
    setError(null);

    if (consulta && !isConsultaEditable(consulta)) {
      setError('La consulta no puede ser editada una vez guardada.');
      setLoading(false);
      return null;
    }

    try {
      const response = await consultaService.guardarConsulta(consultaId, tipo, data);
      const saved = response.data as Consulta | null;
      setConsulta(saved);
      setCita(prevCita => prevCita ? { ...prevCita, estado: EstadoCita.ATENDIDA } : null);
      return saved;
    } catch (err: any) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [consulta]);

  useEffect(() => {
    if (initialCitaId) {
      obtenerConsulta(initialCitaId);
    }
  }, [initialCitaId, obtenerConsulta]);

  return { consulta, loading, error, cita, obtenerConsulta, crearConsulta, guardarConsulta };
};
