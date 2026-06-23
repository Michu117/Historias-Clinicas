/**
 * Manejador centralizado de errores
 * Convierte errores genéricos en ApiError con información consistente
 */

import { ApiError } from '../../types';

/**
 * Códigos de error estándar
 */
export enum ErrorCode {
  // Cliente (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Servidor (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Cliente local
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Procesa cualquier error y lo convierte en ApiError
 * @param error - Error a procesar
 * @returns ApiError normalizado
 */
export const handleError = (error: unknown): ApiError => {
  // Si ya es ApiError, devolverlo tal cual
  if (error instanceof ApiError) {
    return error;
  }

  // Si es Error genérico
  if (error instanceof Error) {
    return new ApiError(
      ErrorCode.UNKNOWN_ERROR,
      error.message || 'Error desconocido',
      undefined
    );
  }

  // Si es objeto con propiedades
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;

    if ('code' in errorObj && 'message' in errorObj) {
      return new ApiError(
        String(errorObj.code),
        String(errorObj.message),
        errorObj.statusCode as number | undefined,
        errorObj.details as Record<string, string[]> | undefined
      );
    }
  }

  // Fallback
  return new ApiError(
    ErrorCode.UNKNOWN_ERROR,
    'Error desconocido sin información adicional',
    undefined
  );
};

/**
 * Obtiene un mensaje de error user-friendly
 * @param error - Error a procesar
 * @returns Mensaje legible para el usuario
 */
export const getErrorMessage = (error: unknown): string => {
  const apiError = handleError(error);

  // Usar el mapping de mensajes si existe, sino el mensaje del error
  return getErrorMessageByCode(apiError.code) ?? apiError.message;
};

/**
 * Obtiene el mensaje correspondiente a un código de error
 * @param code - Código de error
 * @returns Mensaje user-friendly o undefined
 */
export const getErrorMessageByCode = (code: string): string | undefined => {
  const messages: Record<string, string> = {
    [ErrorCode.BAD_REQUEST]: 'Solicitud inválida. Revisa los datos ingresados.',
    [ErrorCode.UNAUTHORIZED]: 'No autorizado. Por favor inicia sesión.',
    [ErrorCode.FORBIDDEN]: 'No tienes permiso para acceder a esto.',
    [ErrorCode.NOT_FOUND]: 'El recurso solicitado no fue encontrado.',
    [ErrorCode.CONFLICT]: 'Conflicto: El recurso ya existe o hay un conflicto.',
    [ErrorCode.VALIDATION_ERROR]: 'Error de validación. Revisa los datos ingresados.',
    [ErrorCode.INTERNAL_SERVER_ERROR]: 'Error del servidor. Intenta más tarde.',
    [ErrorCode.SERVICE_UNAVAILABLE]: 'Servicio no disponible. Intenta más tarde.',
    [ErrorCode.NETWORK_ERROR]: 'Error de conexión. Verifica tu conexión a internet.',
    [ErrorCode.TIMEOUT]: 'La solicitud tardó demasiado. Intenta de nuevo.',
  };

  return messages[code];
};

/**
 * Log de error con contexto
 * @param error - Error a loguear
 * @param context - Contexto adicional (ej: "loadAgendas")
 */
export const logError = (error: unknown, context?: string): void => {
  const apiError = handleError(error);

  console.error(
    `[Error${context ? ` en ${context}` : ''}] ${apiError.code}: ${apiError.message}`,
    {
      statusCode: apiError.statusCode,
      details: apiError.details,
      originalError: error,
    }
  );
};
