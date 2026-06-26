import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../../../config';

export async function fetchJSON(url: string, token?: string, options?: RequestInit) {
  const baseUrl = getApiUrl();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const tk = token ?? await AsyncStorage.getItem('token');
  if (tk) headers['Authorization'] = `Bearer ${tk}`;

  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string>) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err: any = new Error(res.statusText || 'Fetch error');
    err.status = res.status;
    err.body = body;
    throw err;
  }
  if (res.status === 204) return undefined;
  return res.json();
}
