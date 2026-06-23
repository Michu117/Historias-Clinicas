/**
 * Validación y parseo de JWT (JSON Web Tokens)
 * Soporta HS256, HS512, RS256, etc.
 * Soporte M2M: roles puede ser string (legacy) o string[]
 */

import { JWTPayload, getRolesArray } from '../../types';

/**
 * Decodifica un JWT sin validar firma (solo lectura de payload)
 * ADVERTENCIA: Para validación real de firma, usar backend o librería especializada
 * @param token - JWT a decodificar
 * @returns JWTPayload decodificado
 * @throws Error si el token es inválido
 */
export const parseJWT = (token: string): JWTPayload => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('JWT inválido: debe tener 3 partes (header.payload.signature)');
    }

    // Decodificar payload (segunda parte)
    let payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    // Agregar padding si es necesario
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const decoded = atob(padded);
    const parsed = JSON.parse(decoded);

    if (!parsed.exp) {
      throw new Error('JWT inválido: falta exp');
    }

    return parsed as JWTPayload;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`No se pudo parsear JWT: ${error.message}`);
    }
    throw new Error('No se pudo parsear JWT: error desconocido');
  }
};

/**
 * Verifica si un JWT está expirado
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = parseJWT(token);
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    return currentTime >= expirationTime - 30000;
  } catch {
    return true;
  }
};

/**
 * Obtiene el tiempo de expiración en milisegundos desde ahora
 */
export const getTokenExpiresIn = (token: string): number => {
  try {
    const payload = parseJWT(token);
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    return Math.max(0, expirationTime - currentTime);
  } catch {
    return -1;
  }
};

const normalizarRol = (rol?: string): string =>
  String(rol ?? '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');

const PROFESSIONAL_ROLES = new Set(['profesional', 'medico', 'psicologo', 'odontologo', 'trabajador_social', 'trabajo_social']);
const ADMIN_ROLES = new Set(['admin', 'administrador']);

/**
 * Obtiene el primer rol del token
 */
export const getTokenRole = (token: string): string | null => {
  try {
    const payload = parseJWT(token);
    return normalizarRol(payload.rol) || null;
  } catch {
    return null;
  }
};

/**
 * Obtiene todos los roles del token
 */
export const getTokenRoles = (token: string): string[] => {
  try {
    const payload = parseJWT(token);
    return getRolesArray(payload);
  } catch {
    return [];
  }
};

/**
 * Valida si el token tiene el rol esperado (compatible M2M)
 * Acepta tanto roles del frontend (PROFESIONAL/ADMIN) como del backend (medico/psicologo/admin)
 */
export const validateTokenRole = (token: string, expectedRole: string): boolean => {
  try {
    const payload = parseJWT(token);
    const rolNormalizado = normalizarRol(payload.rol);

    const expectedUpper = expectedRole.toUpperCase();
    if (expectedUpper === 'PROFESIONAL') {
      return PROFESSIONAL_ROLES.has(rolNormalizado);
    }
    if (expectedUpper === 'ADMIN') {
      return ADMIN_ROLES.has(rolNormalizado);
    }

    return rolNormalizado === normalizarRol(expectedRole);
  } catch (error) {
    console.error('Error al validar rol del token:', error);
    return false;
  }
};
