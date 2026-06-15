/**
 * Validación y parseo de JWT (JSON Web Tokens)
 * Soporta HS256, HS512, RS256, etc.
 */

import { JWTPayload } from '../../types';

/**
 * Decodifica un JWT sin validar firma (solo lectura de payload)
 * ADVERTENCIA: Para validación real de firma, usar backend o librería especializada
 * @param token - JWT a decodificar
 * @returns JWTPayload decodificado
 * @throws Error si el token es inválido
 */
export const parseJWT = (token: string): JWTPayload => {
  try {
    // JWT tiene 3 partes: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('JWT inválido: debe tener 3 partes (header.payload.signature)');
    }

    // Decodificar payload (segunda parte)
    const payload = parts[1];
    // Agregar padding si es necesario
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const decoded = atob(padded); // Base64 decode
    const parsed = JSON.parse(decoded);

    // Validar que tenga exp (mínimo necesario)
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
 * Usa el timestamp 'exp' del payload
 * @param token - JWT a verificar
 * @returns true si el token está expirado
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = parseJWT(token);
    const expirationTime = payload.exp * 1000; // Convertir a milisegundos
    const currentTime = Date.now();

    // Agregar margen de 30 segundos para evitar race conditions
    return currentTime >= expirationTime - 30000;
  } catch (error) {
    // Si no se puede parsear, asumir que está expirado
    console.error('Error al verificar expiración del token:', error);
    return true;
  }
};

/**
 * Obtiene el tiempo de expiración en milisegundos desde ahora
 * @param token - JWT a verificar
 * @returns Milisegundos hasta expiración, o 0 si ya expiró, o -1 si error
 */
export const getTokenExpiresIn = (token: string): number => {
  try {
    const payload = parseJWT(token);
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const expiresIn = expirationTime - currentTime;

    return Math.max(0, expiresIn); // No devolver negativos
  } catch (error) {
    console.error('Error al obtener tiempo de expiración:', error);
    return -1;
  }
};

const PROFESSIONAL_ROLES = new Set(['PROFESIONAL', 'medico', 'psicologo']);
const ADMIN_ROLES = new Set(['ADMIN', 'admin', 'Administrador']);

/**
 * Verifica que el rol del token coincida con el esperado
 * Acepta tanto roles del frontend (PROFESIONAL/ADMIN) como del backend (medico/psicologo/admin)
 * @param token - JWT a verificar
 * @param expectedRole - Rol esperado
 * @returns true si el rol coincide
 */
export const getTokenRole = (token: string): string | null => {
  try {
    const payload = parseJWT(token);
    return payload.rol || null;
  } catch {
    return null;
  }
};

export const validateTokenRole = (token: string, expectedRole: string): boolean => {
  try {
    const payload = parseJWT(token);

    const expectedUpper = expectedRole.toUpperCase();
    if (expectedUpper === 'PROFESIONAL') {
      return PROFESSIONAL_ROLES.has(payload.rol);
    }
    if (expectedUpper === 'ADMIN') {
      return ADMIN_ROLES.has(payload.rol);
    }

    return payload.rol === expectedRole;
  } catch (error) {
    console.error('Error al validar rol del token:', error);
    return false;
  }
};
