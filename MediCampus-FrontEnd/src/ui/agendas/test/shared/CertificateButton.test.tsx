import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CertificateButton } from '../../component/shared/CertificateButton';

describe('CertificateButton Component - RN-009', () => {
  let mockOnSuccess: ReturnType<typeof vi.fn>;
  let mockOnError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSuccess = vi.fn();
    mockOnError = vi.fn();
  });

  describe('Visibility', () => {
    it('debe mostrar el botón cuando el estado es ATENDIDA', () => {
      render(
        <CertificateButton
          citaId={1}
          estado="ATENDIDA"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );
      expect(screen.getByRole('button', { name: /descargar certificado/i })).toBeInTheDocument();
    });

    it('debe ocultar el botón cuando el estado NO es ATENDIDA (RN-009)', () => {
      render(
        <CertificateButton
          citaId={1}
          estado="AGENDADA"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );
      expect(screen.queryByRole('button', { name: /descargar certificado/i })).not.toBeInTheDocument();
    });

    it('debe ocultar el botón cuando estado es CANCELADA', () => {
      render(
        <CertificateButton
          citaId={1}
          estado="CANCELADA"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );
      expect(screen.queryByRole('button', { name: /descargar certificado/i })).not.toBeInTheDocument();
    });

    it('debe ocultar el botón cuando estado es NO_ASISTIO', () => {
      render(
        <CertificateButton
          citaId={1}
          estado="NO_ASISTIO"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );
      expect(screen.queryByRole('button', { name: /descargar certificado/i })).not.toBeInTheDocument();
    });
  });

  describe('Acciones', () => {
    it('debe descargar PDF al hacer clic sin errores', async () => {
      render(
        <CertificateButton
          citaId={1}
          estado="ATENDIDA"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /descargar certificado/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('debe descargar PDF al presionar Enter (accesibilidad teclado)', async () => {
      render(
        <CertificateButton
          citaId={1}
          estado="ATENDIDA"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      fireEvent.keyDown(screen.getByRole('button', { name: /descargar certificado/i }), { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('debe mostrar loader durante la descarga', async () => {
      render(
        <CertificateButton
          citaId={1}
          estado="ATENDIDA"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /descargar certificado/i }));

      expect(screen.getByText(/generando certificado/i)).toBeInTheDocument();
    });
  });
});
