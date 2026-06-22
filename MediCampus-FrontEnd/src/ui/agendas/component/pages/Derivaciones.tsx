import { type FC, useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useDerivacion } from '../../hooks/useDerivacion';
import { DerivacionInbox } from '../derivacion/DerivacionInbox';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const Derivaciones: FC = () => {
  const { user } = useAuth();
  const { pendientes, loading, error, loadPendientes, aceptarDerivacion, rechazarDerivacion } = useDerivacion();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadPendientes(user.id);
    }
  }, [user, loadPendientes]);

  const handleAccept = useCallback(async (id: number) => {
    await aceptarDerivacion(id);
    setSuccessMessage('Derivación aceptada');
    setTimeout(() => setSuccessMessage(null), 3000);
  }, [aceptarDerivacion]);

  const handleReject = useCallback(async (id: number) => {
    await rechazarDerivacion(id);
    setSuccessMessage('Derivación rechazada');
    setTimeout(() => setSuccessMessage(null), 3000);
  }, [rechazarDerivacion]);

  if (!user || user.rol !== 'PROFESIONAL') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" style={{ backgroundColor: 'var(--hc-bg, #f9fafb)' }}>
      <div className="max-w-4xl mx-auto">
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <DerivacionInbox
            derivaciones={pendientes}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}
      </div>
    </div>
  );
};
