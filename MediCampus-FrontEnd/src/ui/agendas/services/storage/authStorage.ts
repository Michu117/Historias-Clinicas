/**
 * Almacenamiento de autenticación - JWT en localStorage
 * Zero-trust: Siempre valida que el token sea válido antes de usarlo
 */

import { isTokenExpired, parseJWT } from '../../utils/auth/jwtValidator';
import { JWTPayload } from '../../types';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

/**
 * Guarda el token JWT en localStorage
 * @param token - Token JWT a guardar
 * @throws Error si el token está vacío o expirado
 */
export const saveToken = (token: string): void => {
  if (!token || typeof token !== 'string') {
    throw new Error('Token inválido: debe ser un string no vacío');
  }

  if (isTokenExpired(token)) {
    throw new Error('Token expirado: no se puede guardar un token vencido');
  }

  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error al guardar token en localStorage:', error);
    throw new Error('No se pudo guardar el token');
  }
};

/**
 * Obtiene el token JWT del localStorage
 * @returns Token si existe y es válido, null si no está o está expirado
 */
export const getToken = (): string | null => {
  try {
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');

    if (!token) {
      return null;
    }

    // Validar que no esté expirado
    if (isTokenExpired(token)) {
      clearToken();
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error al obtener token de localStorage:', error);
    return null;
  }
};

/**
 * Verifica si existe un token válido
 * @returns true si el token existe y no está expirado
 */
export const isTokenValid = (): boolean => {
  const token = getToken();
  return token !== null && !isTokenExpired(token);
};

/**
 * Limpia el token y datos de usuario del almacenamiento
 */
export const clearToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error al limpiar tokens de localStorage:', error);
  }
};

/**
 * Obtiene el payload decodificado del token actual
 * @returns JWTPayload si el token es válido, null si no existe o está expirado
 */
export const getTokenPayload = (): JWTPayload | null => {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    return parseJWT(token);
  } catch (error) {
    console.error('Error al parsear token:', error);
    clearToken();
    return null;
  }
};

/**
 * Obtiene el user_id del token actual o del currentUser almacenado
 * @returns user_id si se encuentra, null si no existe
 */
export const getUserId = (): number | null => {
  const payload = getTokenPayload();
  if (payload?.user_id) return payload.user_id;

  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.id) return user.id;
    }
  } catch { /* noop */ }

  return null;
};

/**
 * Guarda datos del usuario en localStorage (no sensible)
 * @param userData - Datos del usuario a guardar
 */
export const saveUser = (userData: Record<string, unknown>): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error al guardar usuario en localStorage:', error);
  }
};

/**
 * Obtiene datos del usuario del almacenamiento
 * @returns Datos del usuario o null si no existen
 */
export const getUser = (): Record<string, unknown> | null => {
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error al obtener usuario de localStorage:', error);
    return null;
  }
};
