import { useMemo } from 'react';
import {
  getStoredUserRole,
  getCurrentUserPermissions,
  getStoredUser,
  type UserRole,
  type HistoriaClinicaPermissions,
} from '../utils/historiaClinicaPermissions';

export const useHistoriasClinicasAuth = () => {
  const role = useMemo<UserRole | null>(() => getStoredUserRole(), []);
  const permissions = useMemo<HistoriaClinicaPermissions | null>(
    () => getCurrentUserPermissions(),
    []
  );
  const storedUser = useMemo<Record<string, unknown> | null>(
    () => getStoredUser(),
    []
  );
  const isAuthorized = useMemo(() => {
    const token = localStorage.getItem('token');
    return !!token;
  }, []);

  const userCedula = useMemo<string | null>(() => {
    const usuario = storedUser?.usuario as Record<string, unknown> | null;
    return (usuario?.cedula as string) ?? null;
  }, [storedUser]);

  return {
    role,
    permissions,
    storedUser,
    userCedula,
    isAuthorized,
  };
};
