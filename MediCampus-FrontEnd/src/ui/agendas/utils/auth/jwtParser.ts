/**
 * Funciones auxiliares para parsear JWT sin dependencias externas
 * Complementa a jwtValidator.ts
 */

import { JWTPayload } from '../../types';

/**
 * Extrae un único claim del JWT sin decodificar todo
 * @param token - JWT
 * @param claim - Nombre del claim (ej: "user_id", "email")
 * @returns Valor del claim o undefined
 */
export const getTokenClaim = (token: string, claim: string): unknown => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return undefined;
    }

    const payload = parts[1];
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const decoded = atob(padded);
    const parsed = JSON.parse(decoded);

    return parsed[claim];
  } catch (error) {
    return undefined;
  }
};

/**
 * Obtiene el tipo de token (normalmente "Bearer")
 * @param token - JWT
 * @returns Tipo del token del header o undefined
 */
export const getTokenType = (token: string): string | undefined => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return undefined;
    }

    const header = parts[0];
    const padded = header + '='.repeat((4 - (header.length % 4)) % 4);
    const decoded = atob(padded);
    const parsed = JSON.parse(decoded);

    return parsed.typ as string | undefined;
  } catch (error) {
    return undefined;
  }
};
