import { useState, useEffect, useCallback } from 'react';
import {
  getToken,
  getTokenPayload,
  isTokenValid,
  clearToken,
  getUserId,
  getUser,
} from '../services/storage/authStorage';
import { JWTPayload, getRolesArray, isProfessional as checkIsProfessional } from '../types';

interface UseAuthResult {
  token: string | null;
  payload: JWTPayload | null;
  userId: number | null;
  userRole: string | null;
  userRoles: string[];
  isAuthenticated: boolean;
  isProfessional: boolean;
  userData: Record<string, unknown> | null;
  login: (accessToken: string) => void;
  logout: () => void;
}

export const useAuth = (): UseAuthResult => {
  const [token, setToken] = useState<string | null>(getToken);
  const [payload, setPayload] = useState<JWTPayload | null>(getTokenPayload);
  const [userId, setUserId] = useState<number | null>(getUserId);
  const [userData, setUserData] = useState<Record<string, unknown> | null>(getUser);

  const updateState = useCallback(() => {
    const currentToken = getToken();
    setToken(currentToken);
    setPayload(currentToken ? getTokenPayload() : null);
    setUserId(getUserId());
    setUserData(getUser());
  }, []);

  useEffect(() => {
    const handleStorageChange = () => updateState();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [updateState]);

  const isAuthenticated = token !== null && isTokenValid();
  const userRoles = getRolesArray(payload);
  const isProfessional = checkIsProfessional(payload);
  const userRole = userRoles[0] ?? null;

  const login = useCallback((accessToken: string) => {
    try {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('token', accessToken);
      updateState();
    } catch {
      console.error('Error al guardar token');
    }
  }, [updateState]);

  const logout = useCallback(() => {
    clearToken();
    updateState();
  }, [updateState]);

  return {
    token,
    payload,
    userId,
    userRole,
    userRoles,
    isAuthenticated,
    isProfessional,
    userData,
    login,
    logout,
  };
};

export default useAuth;
