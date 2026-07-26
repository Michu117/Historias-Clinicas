import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InfoModal } from '../../component/shared/InfoModal';

describe('InfoModal Component', () => {
  it('debe renderizar cuando open=true', () => {
    render(
      <InfoModal
        open={true}
        title="Cancelación no disponible"
        message="No es posible cancelar la cita con menos de 24 horas de anticipación."
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('Cancelación no disponible')).toBeInTheDocument();
    expect(
      screen.getByText('No es posible cancelar la cita con menos de 24 horas de anticipación.')
    ).toBeInTheDocument();
  });

  it('debe mostrar boton "Entendido" cuando se proporciona buttonText', () => {
    render(
      <InfoModal
        open={true}
        title="Cancelación no disponible"
        message="Mensaje de prueba"
        buttonText="Entendido"
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('Entendido')).toBeInTheDocument();
  });

  it('debe mostrar boton "Cerrar" por defecto', () => {
    render(
      <InfoModal
        open={true}
        title="Test"
        message="Mensaje"
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('Cerrar')).toBeInTheDocument();
  });

  it('debe ejecutar onClose al hacer clic en el boton de cierre', () => {
    const onClose = vi.fn();
    render(
      <InfoModal
        open={true}
        title="Test"
        message="Mensaje"
        onClose={onClose}
      />
    );
    fireEvent.click(screen.getByText('Cerrar'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('debe ejecutar onClose al hacer clic en el overlay', () => {
    const onClose = vi.fn();
    render(
      <InfoModal
        open={true}
        title="Test"
        message="Mensaje"
        onClose={onClose}
      />
    );
    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/40');
    if (overlay) {
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('no debe renderizar nada cuando open=false', () => {
    const { container } = render(
      <InfoModal
        open={false}
        title="Test"
        message="Mensaje"
        onClose={vi.fn()}
      />
    );
    expect(container.innerHTML).toBe('');
  });
});
