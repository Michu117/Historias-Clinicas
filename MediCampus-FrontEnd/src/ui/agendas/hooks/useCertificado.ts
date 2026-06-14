import { useState, useCallback } from 'react';
import { certificadoService, CertificadoData } from '../services/api/certificadoService';
import { canGenerateCertificate } from '../utils/validators/certificadoValidators';
import { getErrorMessage } from '../utils/errors/ErrorHandler';
import { messages } from '../utils/constants/messages';

interface UseCertificadoResult {
  certificadoData: CertificadoData | null;
  loading: boolean;
  error: string | null;
  generarCertificado: (citaId: number, estado?: string | null) => Promise<void>;
  descargarPDF: (data: CertificadoData) => Promise<void>;
}

export const useCertificado = (): UseCertificadoResult => {
  const [certificadoData, setCertificadoData] = useState<CertificadoData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generarCertificado = useCallback(async (citaId: number, estado?: string | null) => {
    setLoading(true);
    setError(null);

    if (estado && !canGenerateCertificate({ estado })) {
      setError(messages.certificados.soloAtendida);
      setLoading(false);
      return;
    }

    try {
      const response = await certificadoService.getCertificadoData(citaId);
      if (response.data) {
        setCertificadoData(response.data);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const descargarPDF = useCallback(async (data: CertificadoData | null) => {
    setLoading(true);
    setError(null);

    if (!data) {
      setLoading(false);
      throw new Error('No hay datos de certificado para descargar.');
    }

    try {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificado-${data.citaId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return { certificadoData, loading, error, generarCertificado, descargarPDF };
};
