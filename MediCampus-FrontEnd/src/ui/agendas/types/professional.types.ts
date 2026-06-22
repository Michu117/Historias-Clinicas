import { RolUsuario } from './user.types';

export interface Profesional {
  id: number;
  nombre: string;
  email: string;
  especialidad?: string;
  rol: RolUsuario | 'PROFESIONAL';
  is_activo: boolean;
  telefono?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}
