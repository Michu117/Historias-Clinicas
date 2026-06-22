import axiosInstance from './axiosConfig';

const AUTH_PATH = '/v1/auth';

export interface ProfesionalBackendDTO {
  id: number;
  correo: string;
  esActiva: boolean;
  rol: {
    id: number;
    nombre: string;
    descripcion: string;
  } | null;
  usuario: {
    nombre: string;
    apellido: string;
    cedula: string;
    fechaNacimiento: string;
    sexo: string;
  } | null;
}

import { Profesional } from '../../types';

const ROLE_NAME_MAP: Record<string, string> = {
  medico: 'Medicina',
  psicologo: 'Psicologia',
  odontologo: 'Odontologia',
  trabajador_social: 'Trabajo Social',
};

const SERVICE_TO_ROLES: Record<string, string[]> = {
  'Medicina': ['medico'],
  'Medicina General': ['medico'],
  'Odontologia': ['odontologo'],
  'Odontología': ['odontologo'],
  'Psicologia': ['psicologo'],
  'Psicología': ['psicologo'],
  'Trabajo Social': ['trabajador_social'],
};

export function mapProfesionalBackendToFrontend(dto: ProfesionalBackendDTO): Profesional {
  return {
    id: dto.id,
    nombre: dto.usuario
      ? `${dto.usuario.nombre} ${dto.usuario.apellido}`
      : dto.correo,
    email: dto.correo,
    especialidad: dto.rol ? ROLE_NAME_MAP[dto.rol.nombre] || dto.rol.nombre : undefined,
    rol: 'PROFESIONAL',
    is_activo: dto.esActiva,
  };
}

export const profesionalService = {
  listar: async (servicioNombre?: string): Promise<Profesional[]> => {
    const rolesToFetch = servicioNombre
      ? (SERVICE_TO_ROLES[servicioNombre] || [servicioNombre])
      : ['medico', 'psicologo', 'odontologo', 'trabajador_social'];

    const promises = rolesToFetch.map((rol) =>
      axiosInstance.get<ProfesionalBackendDTO[]>(`${AUTH_PATH}/users`, {
        params: { rol, activo: 'true' },
      }).then((r) => (r.data || []).map(mapProfesionalBackendToFrontend))
    );

    const results = await Promise.all(promises);
    return results.flat();
  },

  listarPorServicio: async (servicioId: number, servicioNombre: string): Promise<Profesional[]> => {
    const all = await profesionalService.listar(servicioNombre);
    return all.filter((p) => p.is_activo);
  },
};

export default profesionalService;
