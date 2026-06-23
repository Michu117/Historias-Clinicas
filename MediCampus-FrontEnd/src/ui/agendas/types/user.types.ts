/**
 * Tipos para Usuario y Rol
 * RN-005: Validación de rol con zero-trust
 * Soporte M2M: roles puede ser string (legacy) o string[]
 */

export enum RolUsuario {
  PACIENTE = 'PACIENTE',
  PROFESIONAL = 'PROFESIONAL',
  ADMIN = 'ADMIN',
}

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  cédula?: string;
  sexo?: 'M' | 'F' | 'O';
  rol: RolUsuario;
  roles?: string[];
  es_activo: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface JWTPayload {
  user_id: number;
  email: string;
  rol: string; // Primer rol (backward compat)
  roles?: string[]; // Todos los roles (M2M)
  exp: number; // Unix timestamp
  iat: number; // Unix timestamp
}

export function getRolesArray(payload: JWTPayload | null): string[] {
  if (!payload) return [];
  if (Array.isArray(payload.roles) && payload.roles.length > 0) return payload.roles;
  if (payload.rol) return [payload.rol];
  return [];
}

export function hasAnyRole(payload: JWTPayload | null, ...expected: string[]): boolean {
  const userRoles = getRolesArray(payload);
  return expected.some(r => userRoles.includes(r));
}

export function isProfessional(payload: JWTPayload | null): boolean {
  return hasAnyRole(payload, 'PROFESIONAL', 'medico', 'psicologo', 'odontologo', 'trabajador_social');
}

export interface AuthResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user: Partial<Usuario>;
}
