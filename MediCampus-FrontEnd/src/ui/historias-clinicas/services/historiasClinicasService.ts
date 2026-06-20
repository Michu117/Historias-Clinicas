import { apiClient } from './api';
import type { EstadoHistoriaClinica, HistoriaClinica, HistoriaClinicaFormValues } from '../types/historiaClinica.types';
import type { AntecedenteClinico, TipoAntecedenteClinico } from '../types/antecedenteClinico.types';
import type { CasoClinico, PrioridadCasoClinico, EstadoCasoClinico } from '../types/casoClinico.types';

const mapApiHistoriaToModel = (api: any): HistoriaClinica => {
  // Mapea de la respuesta del API (snake_case) a nuestro modelo frontend (camelCase)
  const usuario = typeof api.usuario === 'object' && api.usuario !== null
    ? { nombre: api.usuario.nombre || '', identificacion: api.usuario.identificacion || '' }
    : { nombre: '', identificacion: '' };

  return {
    id: String(api.id ?? api.pk ?? ''),
    alergia: api.alergia ?? '',
    condicionPreexistente: api.condicion_preexistente ?? api.condicionPreexistente ?? '',
    factorRiesgo: api.factor_riesgo ?? api.factorRiesgo ?? '',
    fechaApertura: api.created_at ?? undefined,
    ultimaActualizacion: api.updated_at ?? undefined,
    estado: (api.estado as EstadoHistoriaClinica) ?? 'ACTIVA',
    usuario,
    responsable: api.responsable ?? undefined,
  };
};

const mapApiAntecedenteToModel = (api: any): AntecedenteClinico => ({
  id: String(api.id ?? api.pk ?? ''),
  historiaClinicaId: String(api.historia_clinica ?? ''),
  tipo: (api.tipo_antecedente ?? '').toUpperCase() as TipoAntecedenteClinico,
  descripcion: api.descripcion ?? '',
  fecha: api.fecha ?? '',
  creadoEn: api.created_at ?? undefined,
  actualizadoEn: api.updated_at ?? undefined,
});

const mapApiCasoToModel = (api: any): CasoClinico => ({
  id: String(api.id ?? api.pk ?? ''),
  historiaClinicaId: String(api.historia_clinica ?? ''),
  prioridad: (api.prioridad ?? 'MEDIA') as PrioridadCasoClinico,
  estado: (api.estado_caso ?? 'ABIERTO') as EstadoCasoClinico,
  fechaApertura: api.fecha_apertura ?? '',
  fechaCierre: api.fecha_cierre ?? null,
  creadoEn: api.created_at ?? undefined,
  actualizadoEn: api.updated_at ?? undefined,
});

export const historiasClinicasService = {
  listarHistoriasClinicas: async (): Promise<HistoriaClinica[]> => {
  const response = await apiClient.get<any>('/historias/historias_clinicas/');
  const data = Array.isArray(response) ? response : response.data


    console.log('RESPUESTA HISTORIAS:', response)
    console.log('DATA HISTORIAS:', data)

    return (data || []).map(mapApiHistoriaToModel);
  },

  obtenerHistoriaClinicaPorId: async (id: string): Promise<HistoriaClinica> => {
  try {
    const response = await apiClient.get<any>(
      `/historias/historias_clinicas/${id}/`
    );

    const data = response.data ?? response;

    return mapApiHistoriaToModel(data);
  } catch (error) {
    console.warn(
      'No se pudo obtener la historia por detalle. Se buscará en el listado.',
      error
    );

    const historias = await historiasClinicasService.listarHistoriasClinicas();

    const historiaEncontrada = historias.find(
      (historia) => String(historia.id) === String(id)
    );

    if (!historiaEncontrada) {
      throw new Error(`No se encontró la historia clínica con id ${id}.`);
    }

    return historiaEncontrada;
  }
},

  crearHistoriaClinica: async (payload: HistoriaClinicaFormValues): Promise<HistoriaClinica> => {
    const body = {
      alergia: payload.alergia,
      condicion_preexistente: payload.condicionPreexistente,
      factor_riesgo: payload.factorRiesgo,
    };
    const response = await apiClient.post<any>('/historias/historias_clinicas/', body);
    const data = response.data ?? response;
    return mapApiHistoriaToModel(data);
  },

  listarAntecedentesPorHistoria: async (historiaId: string): Promise<AntecedenteClinico[]> => {
    const response = await apiClient.get<any>('/historias/antecedentes/');
    const data = Array.isArray(response) ? response : response.data
    const all = (data || []).map(mapApiAntecedenteToModel);
    return all.filter((a: AntecedenteClinico) => String(a.historiaClinicaId) === String(historiaId));
  },

  crearAntecedenteClinico: async (payload: Partial<AntecedenteClinico>): Promise<AntecedenteClinico> => {
    const body: any = {
      historia_clinica: payload.historiaClinicaId,
      descripcion: payload.descripcion,
      fecha: payload.fecha,
      tipo_antecedente: payload.tipo,
    };
    const data = await apiClient.post<any>('/historias/antecedentes/', body);
    return mapApiAntecedenteToModel(data);
  },

  actualizarAntecedente: async (id: string, payload: Partial<AntecedenteClinico>): Promise<AntecedenteClinico> => {
    const body: any = {
      descripcion: payload.descripcion,
      fecha: payload.fecha,
      tipo_antecedente: payload.tipo,
    };
    const data = await apiClient.patch<any>(`/historias/antecedentes/${id}/`, body);
    return mapApiAntecedenteToModel(data);
  },

  eliminarAntecedente: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`/historias/antecedentes/${id}/`);
  },

  listarCasosPorHistoria: async (historiaId: string): Promise<CasoClinico[]> => {
    const response = await apiClient.get<any>('/historias/casos/');
    const data = Array.isArray(response) ? response : response.data
    const all = (data || []).map(mapApiCasoToModel);
    return all.filter((c: CasoClinico) => String(c.historiaClinicaId) === String(historiaId));
  },

  crearCasoClinico: async (payload: Partial<CasoClinico>): Promise<CasoClinico> => {
    const body: any = {
      historia_clinica: payload.historiaClinicaId,
      fecha_apertura: payload.fechaApertura,
      fecha_cierre: payload.fechaCierre || null,
      estado_caso: payload.estado ?? 'ABIERTO',
      prioridad: payload.prioridad ?? 'MEDIA',
    };
    const data = await apiClient.post<any>('/historias/casos/', body);
    return mapApiCasoToModel(data);
  },

  actualizarCaso: async (id: string, payload: Partial<CasoClinico>): Promise<CasoClinico> => {
    const body: any = {
      fecha_apertura: payload.fechaApertura,
      fecha_cierre: payload.fechaCierre,
      estado_caso: payload.estado,
      prioridad: payload.prioridad,
    };
    const data = await apiClient.patch<any>(`/historias/casos/${id}/`, body);
    return mapApiCasoToModel(data);
  },

  eliminarCaso: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`/historias/casos/${id}/`);
  },
  
  actualizarHistoriaClinica: async (
  id: string,
  payload: {
    alergia: string;
    condicionPreexistente: string;
    factorRiesgo: string;
  }
): Promise<HistoriaClinica> => {
  const body = {
    alergia: payload.alergia,
    condicion_preexistente: payload.condicionPreexistente,
    factor_riesgo: payload.factorRiesgo,
  };

  const response = await apiClient.patch<any>(
    `/historias/historias_clinicas/${id}/`,
    body
  );

  const data = response.data ?? response;

  return mapApiHistoriaToModel(data);
},
};
