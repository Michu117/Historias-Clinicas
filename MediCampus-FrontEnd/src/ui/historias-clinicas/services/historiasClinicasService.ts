import { apiClient } from './api';
import type { EstadoHistoriaClinica, HistoriaClinica, HistoriaClinicaFormValues } from '../types/historiaClinica.types';
import type { AntecedenteClinico } from '../types/antecedenteClinico.types';
import type { CasoClinico } from '../types/casoClinico.types';

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
    antecedentes: Array.isArray(api.antecedentes) ? '' : (api.antecedentes ?? ''),
    casos: Array.isArray(api.casos) ? '' : (api.casos ?? ''),
    documentos: Array.isArray(api.documentos) ? '' : (api.documentos ?? ''),
    consultas: api.consultas ?? ''
  };
};

const mapApiAntecedenteToModel = (api: any): AntecedenteClinico => ({
  id: String(api.id ?? api.pk ?? ''),
  historiaClinicaId: String(api.historia_clinica ?? api.historiaClinica ?? ''),
  tipo: (api.tipo_antecedente ?? api.tipo ?? '').toUpperCase(),
  descripcion: api.descripcion ?? '',
  fecha: api.fecha ?? '',
  creadoEn: api.created_at ?? undefined,
  actualizadoEn: api.updated_at ?? undefined,
});

const mapApiCasoToModel = (api: any): CasoClinico => ({
  id: String(api.id ?? api.pk ?? ''),
  historiaClinicaId: String(api.historia_clinica ?? api.historiaClinica ?? ''),
  descripcion: api.descripcion ?? api.descripcion_caso ?? '',
  prioridad: (api.prioridad ?? 'MEDIA') as any,
  estado: (api.estado_caso ?? api.estado ?? 'ABIERTO') as any,
  responsable: api.responsable ?? undefined,
  fechaApertura: api.fecha_apertura ?? undefined,
  ultimaActualizacion: api.updated_at ?? undefined,
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
      consultas: payload.consultas,
      // El API asigna el usuario desde la sesión en backend; si fuera necesario, ajustar aquí.
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
    // El backend asocia la historia clínica a partir de la sesión; pero si acepta campo, usar 'historia_clinica'
    const body: any = {
      descripcion: payload.descripcion,
      fecha: payload.fecha,
      tipo_antecedente: payload.tipo,
    };
    if (payload.historiaClinicaId) body.historia_clinica = payload.historiaClinicaId;
    const data = await apiClient.post<any>('/historias/antecedentes/', body);
    return mapApiAntecedenteToModel(data);
  },

  listarCasosPorHistoria: async (historiaId: string): Promise<CasoClinico[]> => {
    const response = await apiClient.get<any>('/historias/casos/');
    const data = Array.isArray(response) ? response : response.data
    const all = (data || []).map(mapApiCasoToModel);
    return all.filter((c: CasoClinico) => String(c.historiaClinicaId) === String(historiaId));
  },

  crearCasoClinico: async (payload: Partial<CasoClinico>): Promise<CasoClinico> => {
    const body: any = {
      descripcion: payload.descripcion,
      prioridad: payload.prioridad ?? 'MEDIA',
      fecha_apertura: payload.fechaApertura ?? undefined,
      estado_caso: payload.estado ?? 'ABIERTO'
    };
    if (payload.historiaClinicaId) body.historia_clinica = payload.historiaClinicaId;
    const data = await apiClient.post<any>('/historias/casos/', body);
    return mapApiCasoToModel(data);
  },
  
  actualizarHistoriaClinica: async (
  id: string,
  payload: {
    alergia: string;
    condicionPreexistente: string;
    factorRiesgo: string;
    consultas: string;
    responsable?: string;
  }
): Promise<HistoriaClinica> => {
  const body = {
    alergia: payload.alergia,
    condicion_preexistente: payload.condicionPreexistente,
    factor_riesgo: payload.factorRiesgo,
    consultas: payload.consultas,
    responsable: payload.responsable,
  };

  const response = await apiClient.patch<any>(
    `/historias/historias_clinicas/${id}/`,
    body
  );

  const data = response.data ?? response;

  return mapApiHistoriaToModel(data);
},
};
