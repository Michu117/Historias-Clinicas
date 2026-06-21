import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNotifications, useMarkAsRead } from '../api';

describe('api hooks', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useNotifications', () => {
    it('hace GET a /api/v1/notificaciones/', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notificaciones: [] }),
      });

      renderHook(() => useNotifications());
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/v1/notificaciones/');
      });
    });

    it('retorna notifications, isLoading y error', async () => {
      const mockData = { notificaciones: [{ id: '1', tipo: 'cita' as const, mensaje: 'test', estado: 'no_leido' as const, timestamp: '2026-06-10T10:00:00Z' }] };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useNotifications());
      expect(result.current).toHaveProperty('notifications');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
    });

    it('maneja error HTTP', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
      expect(result.current.notifications).toEqual([]);
    });
  });

  describe('useMarkAsRead', () => {
    it('hace PATCH a /api/v1/notificaciones/{id}/leer/', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const markAsRead = useMarkAsRead();
      await markAsRead('1');
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/notificaciones/1/leer/', expect.any(Object));
    });

    it('envía body {}', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const markAsRead = useMarkAsRead();
      await markAsRead('1');
      const call = (global.fetch as any).mock.calls[0][1];
      expect(call.method).toBe('PATCH');
      expect(call.body).toBe('{}');
    });

    it('retorna success true cuando responde OK', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const markAsRead = useMarkAsRead();
      const result = await markAsRead('1');
      expect(result.success).toBe(true);
    });

    it('maneja error HTTP', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const markAsRead = useMarkAsRead();
      const result = await markAsRead('1');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
