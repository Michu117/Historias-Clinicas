import { useState, useEffect } from 'react';
import { INotification } from './types';

export const API_CONFIG = {
  GET_NOTIFICACIONES: '/api/v1/notificaciones/',
  MARK_AS_READ: '/api/v1/notificaciones/{id}/leer/',
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(API_CONFIG.GET_NOTIFICACIONES);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setNotifications(data.notificaciones || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return { notifications, isLoading, error };
};

export const useMarkAsRead = () => {
  const markAsRead = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const endpoint = API_CONFIG.MARK_AS_READ.replace('{id}', id);
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
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
