import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card } from '../../../ui/components/Card';
import { HistoriasClinicasDashboardLayout } from '../components/HistoriasClinicasDashboardLayout';
import { HistoriasClinicasHeader } from '../components/HistoriasClinicasHeader';
import { useHistoriasClinicasAuth } from '../hooks/useHistoriasClinicasAuth';

export const NuevaHistoriaClinicaPage = () => {
  const navigate = useNavigate();
  const { role, permissions, isAuthorized } = useHistoriasClinicasAuth();

  useEffect(() => {
    if (!isAuthorized) {
      navigate('/seguridad/login');
      return;
    }
    if (!role || !permissions) {
      return;
    }
    if (role === 'ADMINISTRADOR' || permissions.isAdminBlocked) {
      return;
    }
    if (role === 'MEDICO') {
      navigate('/historias', { replace: true });
      return;
    }
    if (role === 'PACIENTE') {
      navigate('/historias/mi-historia', { replace: true });
      return;
    }
  }, [role, permissions, isAuthorized, navigate]);

  return (
    <HistoriasClinicasDashboardLayout>
      <HistoriasClinicasHeader title="Nueva Historia Clínica" backTo="/historias" />
      <section className="flex min-h-0 items-center justify-center">
        <Card className="max-w-md text-center">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--hc-text)' }}>
            Acción no disponible
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--on-surface-variant)' }}>
            La creación de historias clínicas se realiza automáticamente desde el sistema.
          </p>
        </Card>
      </section>
    </HistoriasClinicasDashboardLayout>
  );
};

export default NuevaHistoriaClinicaPage;
