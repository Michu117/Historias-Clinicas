export interface LoginPayload {
  correo: string;
  clave: string;
}

export interface RegisterPayload {
  correo: string;
  clave: string;
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: string;
  sexo: string;
  roles?: string[];
}

export interface User {
  id: number;
  correo: string;
  esActiva: boolean;
  roles: Array<{ id: number; nombre: string; descripcion: string }>;
  usuario: {
    nombre: string;
    apellido: string;
    cedula: string;
    fechaNacimiento: string;
    sexo: string;
  } | null;
  mustChangePassword?: boolean;
}

export interface Tokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  usuario: User;
  tokens: Tokens;
}

export interface AuditLogEntry {
  id: number;
  fechaHora: string;
  tipoAccion: string;
  moduloAfectado: string;
  correo: string;
  detalle: string;
  direccionIp: string | null;
}

export interface AuditLogFilters {
  fecha_desde?: string;
  fecha_hasta?: string;
  tipo_accion?: string;
  usuario?: string;
  limite?: number;
  formato?: 'csv' | 'pdf';
}

export interface Role {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface ChangePasswordPayload {
  clave_nueva: string;
}
