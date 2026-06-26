import { fetchJSON } from './apiClient';
import type { LoginPayload, RegisterPayload, AuthResponse, User, AuditLogEntry, AuditLogFilters, Role, ChangePasswordPayload } from '../../../types';

const AUTH_BASE = '/api/v1/auth';

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
  return fetchJSON(`${AUTH_BASE}/me`);
}

export async function listUsers(filters?: { rol?: string; activo?: string; busqueda?: string }): Promise<User[]> {
  const params = new URLSearchParams();
  if (filters?.rol) params.set('rol', filters.rol);
  if (filters?.activo) params.set('activo', filters.activo);
  if (filters?.busqueda) params.set('busqueda', filters.busqueda);
  const qs = params.toString();
  return fetchJSON(`${AUTH_BASE}/users${qs ? `?${qs}` : ''}`);
}

export async function createUser(payload: RegisterPayload): Promise<User> {
  return fetchJSON(`${AUTH_BASE}/users`, undefined, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getUserDetail(userId: number): Promise<User> {
  return fetchJSON(`${AUTH_BASE}/users/${userId}`);
}

export async function updateUser(userId: number, payload: Record<string, unknown>): Promise<User> {
  return fetchJSON(`${AUTH_BASE}/users/${userId}/update`, undefined, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(userId: number): Promise<void> {
  await fetchJSON(`${AUTH_BASE}/users/${userId}/delete`, undefined, {
    method: 'DELETE',
  });
}

export async function listRoles(): Promise<Role[]> {
  return fetchJSON(`${AUTH_BASE}/roles`);
}

export async function createRole(payload: { nombre: string; descripcion?: string }): Promise<Role> {
  return fetchJSON(`${AUTH_BASE}/roles/create`, undefined, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listAuditLogs(filters?: AuditLogFilters): Promise<AuditLogEntry[]> {
  const params = new URLSearchParams();
  if (filters?.fecha_desde) params.set('fecha_desde', filters.fecha_desde);
  if (filters?.fecha_hasta) params.set('fecha_hasta', filters.fecha_hasta);
  if (filters?.tipo_accion) params.set('tipo_accion', filters.tipo_accion);
  if (filters?.usuario) params.set('usuario', filters.usuario);
  if (filters?.limite) params.set('limite', String(filters.limite));
  const qs = params.toString();
  return fetchJSON(`${AUTH_BASE}/logs${qs ? `?${qs}` : ''}`);
}

export async function forgotPassword(payload: { correo: string }): Promise<{ detail: string }> {
  return fetchJSON(`${AUTH_BASE}/forgot-password`, undefined, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await fetchJSON(`${AUTH_BASE}/cambiar-clave`, undefined, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function exportAuditLogs(filters?: AuditLogFilters): Promise<string> {
  const formato = filters?.formato || 'csv';
  const params = new URLSearchParams();
  params.set('formato', formato);
  if (filters?.fecha_desde) params.set('fecha_desde', filters.fecha_desde);
  if (filters?.fecha_hasta) params.set('fecha_hasta', filters.fecha_hasta);
  if (filters?.tipo_accion) params.set('tipo_accion', filters.tipo_accion);
  const qs = params.toString();
  const url = `${AUTH_BASE}/logs/export${qs ? `?${qs}` : ''}`;
  return fetchJSON(url);
}
