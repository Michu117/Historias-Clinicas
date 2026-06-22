import { useState, useEffect } from 'react';
import { INotification } from './types';
import { getToken } from '../agendas/services/storage/authStorage';

export const API_CONFIG = {
  GET_NOTIFICACIONES: '/api/v1/notificaciones/',
  MARK_AS_READ: '/api/v1/notificaciones/{id}/leer/',
};

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = getAuthHeaders();
  const mergedHeaders = { ...headers, ...(options.headers || {}) };
  return fetch(url, { ...options, headers: mergedHeaders });
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapNotificacion = (item: any): INotification => ({
    id: String(item.id),
    tipo: item.tipo === 'derivacion' ? 'derivacion' : 'cita',
    tipoBackend: item.tipo,
    mensaje: item.mensaje,
    estado: item.estado,
    fecha_creacion: item.fecha_creacion,
    timestamp: item.fecha_creacion || item.timestamp || '',
  });

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(API_CONFIG.GET_NOTIFICACIONES);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const rawList = Array.isArray(data) ? data : (data.notificaciones || []);
      const list = rawList.map(mapNotificacion);
      setNotifications(list);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return { notifications, isLoading, error, refetch: fetchNotifications };
};

export const useMarkAsRead = () => {
  const markAsRead = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const endpoint = API_CONFIG.MARK_AS_READ.replace('{id}', id);
      const response = await fetchWithAuth(endpoint, {
        method: 'PATCH',
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  };

  return markAsRead;
};

export const createNotificacion = async (data: {
  usuario_destinatario: number;
  tipo: string;
  mensaje: string;
  origen_evento: string;
  cita?: number | null;
  detalles?: Record<string, unknown>;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetchWithAuth(API_CONFIG.GET_NOTIFICACIONES, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
};
