import { fetchJSON } from './apiClient';

const AUTH_BASE = '/api/v1/auth';

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
  rol?: string;
}

export interface User {
  id: number;
  correo: string;
  esActiva: boolean;
  rol: { id: number; nombre: string; descripcion: string } | null;
  usuario: {
    nombre: string;
    apellido: string;
    cedula: string;
    fechaNacimiento: string;
    sexo: string;
  } | null;
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

function getToken(): string | null {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return fetchJSON(`${AUTH_BASE}/login`, undefined, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return fetchJSON(`${AUTH_BASE}/register`, undefined, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMe(): Promise<User> {
  const token = getToken();
  return fetchJSON(`${AUTH_BASE}/me`, token || undefined);
}

export async function listUsers(filters?: { rol?: string; activo?: string; busqueda?: string }): Promise<User[]> {
  const token = getToken();
  const params = new URLSearchParams();
  if (filters?.rol) params.set('rol', filters.rol);
  if (filters?.activo) params.set('activo', filters.activo);
  if (filters?.busqueda) params.set('busqueda', filters.busqueda);
  const qs = params.toString();
  return fetchJSON(`${AUTH_BASE}/users${qs ? `?${qs}` : ''}`, token || undefined);
}

export async function createUser(payload: RegisterPayload): Promise<User> {
  const token = getToken();
  return fetchJSON(`${AUTH_BASE}/users`, token || undefined, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getUserDetail(userId: number): Promise<User> {
  const token = getToken();
  return fetchJSON(`${AUTH_BASE}/users/${userId}`, token || undefined);
}

export async function updateUser(userId: number, payload: Record<string, unknown>): Promise<User> {
  const token = getToken();
  return fetchJSON(`${AUTH_BASE}/users/${userId}/update`, token || undefined, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(userId: number): Promise<void> {
  const token = getToken();
  await fetchJSON(`${AUTH_BASE}/users/${userId}/delete`, token || undefined, {
    method: 'DELETE',
  });
}

export async function listRoles(): Promise<Role[]> {
  const token = getToken();
  return fetchJSON(`${AUTH_BASE}/roles`, token || undefined);
}

export async function createRole(payload: { nombre: string; descripcion?: string }): Promise<Role> {
  const token = getToken();
  return fetchJSON(`${AUTH_BASE}/roles/create`, token || undefined, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listAuditLogs(filters?: AuditLogFilters): Promise<AuditLogEntry[]> {
  const token = getToken();
  const params = new URLSearchParams();
  if (filters?.fecha_desde) params.set('fecha_desde', filters.fecha_desde);
  if (filters?.fecha_hasta) params.set('fecha_hasta', filters.fecha_hasta);
  if (filters?.tipo_accion) params.set('tipo_accion', filters.tipo_accion);
  if (filters?.usuario) params.set('usuario', filters.usuario);
  if (filters?.limite) params.set('limite', String(filters.limite));
  const qs = params.toString();
  return fetchJSON(`${AUTH_BASE}/logs${qs ? `?${qs}` : ''}`, token || undefined);
}

export async function exportAuditLogs(filters?: AuditLogFilters): Promise<void> {
  const token = getToken();
  const formato = filters?.formato || 'csv';
  const params = new URLSearchParams();
  params.set('formato', formato);
  if (filters?.fecha_desde) params.set('fecha_desde', filters.fecha_desde);
  if (filters?.fecha_hasta) params.set('fecha_hasta', filters.fecha_hasta);
  if (filters?.tipo_accion) params.set('tipo_accion', filters.tipo_accion);
  const qs = params.toString();
  const url = `${AUTH_BASE}/logs/export${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Error al exportar logs');
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `auditoria_logs.${formato}`;
  a.click();
  URL.revokeObjectURL(blobUrl);
}
