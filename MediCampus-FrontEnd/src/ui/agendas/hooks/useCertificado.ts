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

  const generarCertificado = useCallback(async (citaId: number, estado?: string | null): Promise<CertificadoData | null> => {
    setLoading(true);
    setError(null);

    if (estado && !canGenerateCertificate({ estado })) {
      setError(messages.certificados.soloAtendida);
      setLoading(false);
      return null;
    }

    try {
      const response = await certificadoService.getCertificadoData(citaId);
      if (response.data) {
        setCertificadoData(response.data);
        return response.data;
      }
      return null;
    } catch (err: any) {
      setError(getErrorMessage(err));
      return null;
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
      const response = await certificadoService.downloadCertificadoPDF(data.citaId);
      if (response.data) {
        const html = await response.data.text();
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(html);
          win.document.close();
          win.focus();
          setTimeout(() => {
            win.print();
          }, 500);
        } else {
          const url = window.URL.createObjectURL(response.data);
          const link = document.createElement('a');
          link.href = url;
          link.download = `certificado-${data.citaId}.html`;
          link.click();
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { certificadoData, loading, error, generarCertificado, descargarPDF };
};
