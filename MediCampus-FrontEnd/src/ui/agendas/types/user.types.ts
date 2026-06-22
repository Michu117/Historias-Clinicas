/**
 * Tipos para Usuario y Rol
 * RN-005: Validación de rol con zero-trust
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
  es_activo: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface JWTPayload {
  user_id: number;
  email: string;
  rol: RolUsuario; // Case-sensitive (RN-005)
  exp: number; // Unix timestamp
  iat: number; // Unix timestamp
}

export interface AuthResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user: Partial<Usuario>;
}
