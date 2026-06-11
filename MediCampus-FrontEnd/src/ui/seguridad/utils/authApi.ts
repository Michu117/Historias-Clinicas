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

export async function listUsers(): Promise<User[]> {
  const token = getToken();
  return fetchJSON(`${AUTH_BASE}/users`, token || undefined);
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

export async function listAuditLogs(): Promise<AuditLogEntry[]> {
  const token = getToken();
  return fetchJSON(`${AUTH_BASE}/logs`, token || undefined);
}
