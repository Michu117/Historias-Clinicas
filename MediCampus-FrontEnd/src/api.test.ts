import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchApiRoot, getApiBaseUrl, getApiRootUrl } from './api';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('api helpers', () => {
  it('uses the configured backend url when available', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');

    expect(getApiBaseUrl()).toBe('http://localhost:8000');
    expect(getApiRootUrl()).toBe('http://localhost:8000/');
  });

  it('fetches the backend root endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'API HistoriasClinicas v1', endpoints: {} })
    });

    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');

    const result = await fetchApiRoot();

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/');
    expect(result.success).toBe(true);
    expect(result.message).toContain('HistoriasClinicas');
  });
});