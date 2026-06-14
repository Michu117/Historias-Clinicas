import { useState, useEffect, useCallback } from 'react';
import { Cita, Consulta, EstadoCita } from '../types';
import { consultaService } from '../services/api/consultaService';
import { validateObservaciones, isConsultaEditable } from '../utils/validators/consultaValidators';
import { getErrorMessage } from '../utils/errors/ErrorHandler';
import { useAuth } from './useAuth'; // Suponiendo que existe un hook para autenticación

interface UseConsultaResult {
  consulta: Consulta | null;
  loading: boolean;
  error: string | null;
  cita: Cita | null; // Añadimos la cita para poder actualizar su estado localmente
  obtenerConsulta: (citaId: number) => Promise<void>;
  crearConsulta: (citaId: number, tipo: string, data: any) => Promise<Consulta | null>;
  guardarConsulta: (consultaId: number, data: any) => Promise<Consulta | null>;
}

export const useConsulta = (initialCitaId?: number): UseConsultaResult => {
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [cita, setCita] = useState<Cita | null>(null); // Estado para la cita
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Obtenemos el usuario autenticado

  const fetchCita = useCallback(async (citaId: number) => {
    // Aquí deberías obtener la cita. Esto es un mock.
    // En una implementación real, tendrías un servicio para obtener citas.
    const mockCitas: Cita[] = [
      { id: citaId, usuario_id: 1, fecha_hora: '2026-06-15T10:00:00Z', estado: EstadoCita.AGENDADA, motivo: 'Consulta mock', servicios: [], fecha_creacion: '2026-06-14T08:00:00Z', fecha_actualizacion: '2026-06-14T08:00:00Z' },
    ];
    const fetchedCita = mockCitas.find(c => c.id === citaId);
    setCita(fetchedCita || null);
  }, []);

  const obtenerConsulta = useCallback(async (citaId: number) => {
    setLoading(true);
    setError(null);
    try {
      await fetchCita(citaId);
      const response = await consultaService.obtenerConsulta(citaId);
      setConsulta(response.data);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [fetchCita]);

  const crearConsulta = useCallback(async (citaId: number, tipo: string, data: any): Promise<Consulta | null> => {
    setLoading(true);
    setError(null);

    if (!validateObservaciones(data.observaciones)) {
      setError('Las observaciones deben tener al menos 10 caracteres.');
      setLoading(false);
      return null;
    }

    // RN-005: Solo profesional asignado puede guardar (mocked for now)
    if (user?.rol !== 'profesional') { // Asumiendo que `user` tiene un `rol`
      setError('El usuario actual no tiene permisos para crear consultas.');
      setLoading(false);
      return null;
    }
    // En un caso real, también se verificaría que el profesional_id de la cita coincide con el user.id

    try {
      const response = await consultaService.crearConsulta(citaId, tipo, data);
      setConsulta(response.data);
      setCita(prevCita => prevCita ? { ...prevCita, estado: EstadoCita.ATENDIDA } : null); // Actualizar estado de la cita
      return response.data;
    } catch (err: any) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const guardarConsulta = useCallback(async (consultaId: number, data: any): Promise<Consulta | null> => {
    setLoading(true);
    setError(null);

    if (consulta && !isConsultaEditable(consulta)) {
      setError('La consulta no puede ser editada una vez guardada.');
      setLoading(false);
      return null;
    }

    if (!validateObservaciones(data.observaciones)) {
      setError('Las observaciones deben tener al menos 10 caracteres.');
      setLoading(false);
      return null;
    }

    // RN-005: Solo profesional asignado puede guardar (mocked for now)
    if (user?.rol !== 'profesional') {
      setError('El usuario actual no tiene permisos para guardar consultas.');
      setLoading(false);
      return null;
    }

    try {
      const response = await consultaService.guardarConsulta(consultaId, data);
      setConsulta(response.data);
      setCita(prevCita => prevCita ? { ...prevCita, estado: EstadoCita.ATENDIDA } : null); // Actualizar estado de la cita
      return response.data;
    } catch (err: any) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [consulta, user]);

  useEffect(() => {
    if (initialCitaId) {
      obtenerConsulta(initialCitaId);
    }
  }, [initialCitaId, obtenerConsulta]);

  return { consulta, loading, error, cita, obtenerConsulta, crearConsulta, guardarConsulta };
};