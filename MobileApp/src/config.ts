import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'customApiUrl';
let runtimeApiUrl: string | null = null;

const envUrl = process.env.EXPO_PUBLIC_API_URL;
const extraUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;
const fallback = 'http://YOUR_SERVER_IP:8000';

export async function loadSavedApiUrl(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) runtimeApiUrl = saved;
  } catch {}
}

export async function setApiUrl(url: string): Promise<void> {
  runtimeApiUrl = url;
  await AsyncStorage.setItem(STORAGE_KEY, url);
  if (__DEV__) console.log('[config] API URL updated to:', url);
}

export function getApiUrl(): string {
  return runtimeApiUrl || envUrl || extraUrl || fallback;
}

export function getApiUrlDebug(): string {
  return `runtime:${runtimeApiUrl ?? '-'} | env:${envUrl ?? '-'} | extra:${extraUrl ?? '-'} | fallback:${fallback}`;
}
