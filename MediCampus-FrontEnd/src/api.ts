export type ApiRootResponse = {
  success: boolean;
  message: string;
  endpoints: Record<string, unknown>;
};

const DEV_PROXY_PREFIX = '/backend';

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL?.trim() || '';
}

export function getApiRootUrl() {
  const base = getApiBaseUrl();
  if (!base) {
    return `${DEV_PROXY_PREFIX}/`;
  }
  return new URL('/', base).toString();
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
  const baseUrl = getApiBaseUrl();
  const url = baseUrl
    ? new URL('/backend/api/token/', baseUrl).toString()
    : '/backend/api/token/';
  const response = await fetch(url, {
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

