import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  EstadoHistoriaClinica,
  HistoriaClinica,
  HistoriaClinicaFormValues
} from '../types/historiaClinica.types';
import type { AntecedenteClinico } from '../types/antecedenteClinico.types';
import type { CasoClinico } from '../types/casoClinico.types';
import { historiasClinicasService } from '../services/historiasClinicasService';

type StatusFilter = 'todas' | EstadoHistoriaClinica;

export const useHistoriasClinicas = () => {
  const [historias, setHistorias] = useState<HistoriaClinica[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState('');
  const [statusValue, setStatusValue] = useState<StatusFilter>('todas');

  const [selectedHistoria, setSelectedHistoria] = useState<HistoriaClinica | null>(null);
  const [antecedentes, setAntecedentes] = useState<AntecedenteClinico[]>([]);
  const [casos, setCasos] = useState<CasoClinico[]>([]);

  const statusOptions = useMemo(
    () => [
      { value: 'todas', label: 'Todas' },
      { value: 'ACTIVA', label: 'Activa' },
      { value: 'CERRADA', label: 'Cerrada' }
    ],
    []
  );

  const cargarHistorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await historiasClinicasService.listarHistoriasClinicas();
      setHistorias(data);
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar historias clínicas');
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarDetalleHistoria = useCallback(
    async (id: string | number) => {
      setLoading(true);
      setError(null);
      try {
        const historia = await historiasClinicasService.obtenerHistoriaClinicaPorId(String(id));
        setSelectedHistoria(historia);
        const [ants, cs] = await Promise.all([
          historiasClinicasService.listarAntecedentesPorHistoria(String(id)),
          historiasClinicasService.listarCasosPorHistoria(String(id))
        ]);
        setAntecedentes(ants);
        setCasos(cs);
      } catch (err: any) {
        setError(err?.message ?? 'Error al cargar detalle de historia');
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void cargarHistorias();
  }, [cargarHistorias]);

  const filteredHistorias = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    return historias.filter((historia) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        String(historia.id).toLowerCase().includes(normalizedSearch) ||
        historia.usuario.nombre.toLowerCase().includes(normalizedSearch) ||
        historia.usuario.identificacion.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusValue === 'todas' || historia.estado === statusValue;
      return matchesSearch && matchesStatus;
    });
  }, [historias, searchValue, statusValue]);

  const stats = useMemo(() => {
    const activas = historias.filter((historia) => historia.estado === 'ACTIVA').length;
    const cerradas = historias.filter((historia) => historia.estado === 'CERRADA').length;
    return [
      { label: 'Total', value: historias.length, description: 'Historias registradas' },
      { label: 'Activas', value: activas, description: 'En seguimiento' },
      { label: 'Cerradas', value: cerradas, description: 'Procesos concluidos' }
    ];
  }, [historias]);

  const seleccionarHistoria = useCallback((historiaId: string) => {
    void cargarDetalleHistoria(historiaId);
  }, [cargarDetalleHistoria]);

  const crearHistoria = useCallback(async (payload: HistoriaClinicaFormValues) => {
    setLoading(true);
    setError(null);
    try {
      await historiasClinicasService.crearHistoriaClinica(payload);
      await cargarHistorias();
    } catch (err: any) {
      setError(err?.message ?? 'Error al crear historia clínica');
    } finally {
      setLoading(false);
    }
  }, [cargarHistorias]);

  const crearAntecedente = useCallback(async (payload: Partial<AntecedenteClinico>) => {
    setLoading(true);
    setError(null);
    try {
      const created = await historiasClinicasService.crearAntecedenteClinico(payload);
      // refrescar lista de antecedentes de la historia seleccionada
      if (selectedHistoria) {
        const ants = await historiasClinicasService.listarAntecedentesPorHistoria(selectedHistoria.id);
        setAntecedentes(ants);
      }
      return created;
    } catch (err: any) {
      setError(err?.message ?? 'Error al crear antecedente clínico');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedHistoria]);

  const crearCaso = useCallback(async (payload: Partial<CasoClinico>) => {
    setLoading(true);
    setError(null);
    try {
      const created = await historiasClinicasService.crearCasoClinico(payload);
      if (selectedHistoria) {
        const cs = await historiasClinicasService.listarCasosPorHistoria(selectedHistoria.id);
        setCasos(cs);
      }
      return created;
    } catch (err: any) {
      setError(err?.message ?? 'Error al crear caso clínico');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedHistoria]);

  const clearSelection = useCallback(() => {
    setSelectedHistoria(null);
    setAntecedentes([]);
    setCasos([]);
  }, []);

  return {
    historias: filteredHistorias,
    rawHistorias: historias,
    stats,
    statusOptions,
    searchValue,
    statusValue,
    selectedHistoria,
    antecedentes,
    casos,
    loading,
    error,
    setSearchValue,
    setStatusValue,
    cargarHistorias,
    seleccionarHistoria,
    crearHistoria,
    crearAntecedente,
    crearCaso,
    clearSelection
  };
};
