import { useState, useEffect, useCallback } from 'react';
import {
  getToken,
  getTokenPayload,
  isTokenValid,
  clearToken,
  getUserId,
  getUser,
} from '../services/storage/authStorage';
import { JWTPayload, Usuario, RolUsuario } from '../types';

interface UseAuthResult {
  token: string | null;
  payload: JWTPayload | null;
  userId: number | null;
  userRole: RolUsuario | null;
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
  const isProfessional = payload
    ? payload.rol === RolUsuario.PROFESIONAL
    : false;

  const userRole = payload?.rol ?? null;

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
    isAuthenticated,
    isProfessional,
    userData,
    login,
    logout,
  };
};

export default useAuth;
