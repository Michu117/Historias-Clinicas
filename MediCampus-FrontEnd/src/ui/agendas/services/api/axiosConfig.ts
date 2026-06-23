/**
 * Configuración de Axios con JWT interceptors
 * Stack: Axios + JWT Bearer tokens + Auto-refresh en 401
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiError, ApiErrorResponse } from '../../types';

const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Obtiene la URL base del API desde variables de entorno o default
 */
export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;
};

/**
 * Log de debugging en desarrollo
 */
export const logApiDebug = (message: string, data?: unknown): void => {
  if (import.meta.env.DEV) {
    console.debug(`[API Config] ${message}`, data);
  }
};

/**
 * Crear instancia de Axios configurada
 */
export const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  /**
   * Interceptor de Request: Agrega JWT al header Authorization
   */
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        logApiDebug('JWT agregado al header', { url: config.url });
      }
      return config;
    },
    (error: AxiosError) => {
      logApiDebug('Error en request interceptor', error);
      return Promise.reject(error);
    }
  );

  /**
   * Interceptor de Response: Maneja errores y convierte a ApiError
   */
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      logApiDebug('Response exitoso', { status: response.status, url: response.config.url });
      return response;
    },
    (error: AxiosError) => {
      // Manejo de 401 Unauthorized
      if (error.response?.status === 401) {
        logApiDebug('401 Unauthorized - Limpiando token', { url: error.config?.url });
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      // Convertir AxiosError a ApiError
      const errorResponse = error.response?.data as ApiErrorResponse | undefined;
      const apiError = new ApiError(
        errorResponse?.error?.code || error.code || 'UNKNOWN_ERROR',
        errorResponse?.error?.message || error.message || 'Error desconocido',
        error.response?.status,
        errorResponse?.error?.details
      );

      logApiDebug('Error en response interceptor', {
        code: apiError.code,
        message: apiError.message,
        status: apiError.statusCode,
      });

      return Promise.reject(apiError);
    }
  );

  return instance;
};

/**
 * Instancia global de Axios
 */
export const axiosInstance: AxiosInstance = createAxiosInstance();

export default axiosInstance;
