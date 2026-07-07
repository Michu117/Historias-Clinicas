import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_TOKEN = 'token';
const STORAGE_KEY_REFRESH = 'refreshToken';
const STORAGE_KEY_USER = 'currentUser';

export function useSession() {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<unknown | null>(null);

  const saveSession = useCallback(async (access: string, refresh: string, user?: unknown) => {
    setToken(access);
    setRefreshToken(refresh);
    if (user) setCurrentUser(user);
    const pairs: [string, string][] = [
      [STORAGE_KEY_TOKEN, access],
      [STORAGE_KEY_REFRESH, refresh],
    ];
    if (user) pairs.push([STORAGE_KEY_USER, JSON.stringify(user)]);
    await AsyncStorage.multiSet(pairs);
  }, []);

  const clearSession = useCallback(async () => {
    setToken(null);
    setRefreshToken(null);
    setCurrentUser(null);
    await AsyncStorage.multiRemove([STORAGE_KEY_TOKEN, STORAGE_KEY_REFRESH, STORAGE_KEY_USER]);
  }, []);

  return { token, refreshToken, currentUser, saveSession, clearSession };
}
