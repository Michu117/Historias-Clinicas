export type ApiRootResponse = {
  success: boolean;
  message: string;
  endpoints: Record<string, unknown>;
};

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000';
const DEV_PROXY_PREFIX = '/backend';

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;
}

export function getApiRootUrl() {
  if (!import.meta.env.VITE_API_BASE_URL?.trim() && import.meta.env.DEV) {
    return `${DEV_PROXY_PREFIX}/`;
  }

  return new URL('/', getApiBaseUrl()).toString();
}

export async function fetchApiRoot(): Promise<ApiRootResponse> {
  const response = await fetch(getApiRootUrl());

  if (!response.ok) {
    throw new Error(`No fue posible leer el backend: ${response.status}`);
  }

  return response.json() as Promise<ApiRootResponse>;
}

export type TokenRequestPayload = {
  correo: string;
  password: string;
};

// noinspection JSUnusedGlobalSymbols
export async function requestToken(payload: TokenRequestPayload) {
  const response = await fetch(new URL('/backend/api/token/', getApiBaseUrl()).toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      correo: payload.correo,
      password: payload.password
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((data as { detail?: string; message?: string }).detail || (data as { message?: string }).message || `No fue posible obtener el token: ${response.status}`);
  }

  return data as { access?: string; refresh?: string; token?: string };
}

