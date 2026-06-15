import { useMemo } from 'react';

const hasJwtToken = () => Boolean(localStorage.getItem('token'));

/*export const useHistoriasClinicasAuth = () => {
  const isAuthorized = useMemo(() => hasJwtToken(), []);

  return { isAuthorized };
};*/
export const useHistoriasClinicasAuth = () => {
  return {
    isAuthorized: true,
  };
}