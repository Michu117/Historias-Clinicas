import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNotifications, useMarkAsRead } from '../api';

describe('api hooks', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    localStorage.setItem('access_token', 'test-token');
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.removeItem('access_token');
  });

  describe('useNotifications', () => {
    it('hace GET a /api/v1/notificaciones/', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      renderHook(() => useNotifications());
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        const callUrl = (global.fetch as any).mock.calls[0][0];
        expect(callUrl).toBe('/api/v1/notificaciones/');
      });
    });

    it('retorna notifications, isLoading y error', async () => {
      const mockData = [{ id: '1', tipo: 'creacion', mensaje: 'test', estado: 'no_leido', fecha_creacion: '2026-06-10T10:00:00Z' }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.notifications.length).toBe(1);
        expect(result.current.notifications[0].mensaje).toBe('test');
        expect(result.current.notifications[0].tipoBackend).toBe('creacion');
      });
    });
  });

  describe('useMarkAsRead', () => {
    it('hace PATCH a /api/v1/notificaciones/{id}/leer/', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useMarkAsRead());
      await result.current('1');

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        const callUrl = (global.fetch as any).mock.calls[0][0];
        expect(callUrl).toBe('/api/v1/notificaciones/1/leer/');
      });
    });
  });
});
