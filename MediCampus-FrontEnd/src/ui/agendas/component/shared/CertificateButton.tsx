import { type FC, useState } from 'react';
import { useCertificado } from '../../hooks/useCertificado';
import { messages } from '../../utils/constants/messages';
import { canGenerateCertificate } from '../../utils/validators/certificadoValidators';

interface CertificateButtonProps {
  citaId: number;
  estado: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const CertificateButton: FC<CertificateButtonProps> = ({ citaId, estado, onSuccess, onError }) => {
  const { generarCertificado, descargarPDF, loading } = useCertificado();
  const [descargando, setDescargando] = useState(false);

  const puedeGenerar = canGenerateCertificate({ estado });

  if (!puedeGenerar) return null;

  const handleClick = async () => {
    setDescargando(true);
    try {
      const data = await generarCertificado(citaId, estado);
      if (data) {
        await descargarPDF(data);
      }
      onSuccess?.();
    } catch {
      onError?.(messages.certificados.errorGenerar);
    } finally {
      setDescargando(false);
    }
  };

  const isProcessing = descargando || loading;

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      disabled={isProcessing}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      aria-label={messages.certificados.descargarCertificado}
      aria-busy={isProcessing}
      role="button"
    >
      {isProcessing ? messages.certificados.generandoCertificado : messages.certificados.descargarCertificado}
    </button>
  );
};
