import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConsultaOdontologicaForm } from '../../component/consulta/ConsultaOdontologicaForm';
import { Cita } from '../../types';
import * as consultaValidators from '../../utils/validators/consultaValidators';

describe('ConsultaOdontologicaForm', () => {
  const mockCita: Cita = {
    id: 1,
    paciente_id: 1,
    profesional_id: 0,
    servicio_id: 2,
    fecha: '2026-06-15',
    hora: '10:00',
    duracion_minutos: 30,
    margen_minutos: 30,
    estado: 'AGENDADA' as any,
    motivo: 'Control anual',
    created_at: '2026-06-14T08:00:00Z',
    updated_at: '2026-06-14T08:00:00Z',
  };
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(consultaValidators, 'validateObservaciones').mockReturnValue(true);
    vi.spyOn(consultaValidators, 'isConsultaEditable').mockReturnValue(true);
  });

  // Campos: Odontograma, Procedimientos
  it('should render all required fields for ConsultaOdontologicaForm', () => {
    render(<ConsultaOdontologicaForm cita={mockCita} onSave={mockOnSave} isEditable={true} />);
    expect(screen.getByLabelText(/Odontograma/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Procedimientos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Observaciones/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar Consulta/i })).toBeInTheDocument();
  });

  // Observaciones obligatorias (RN-007)
  it('should not call onSave if observations are invalid (RN-007)', async () => {
    vi.spyOn(consultaValidators, 'validateObservaciones').mockReturnValue(false);
    render(<ConsultaOdontologicaForm cita={mockCita} onSave={mockOnSave} isEditable={true} />);

    fireEvent.change(screen.getByLabelText(/Odontograma/i), { target: { value: 'Some odontograma' } });
    fireEvent.change(screen.getByLabelText(/Procedimientos/i), { target: { value: 'Some procedures' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Consulta/i }));

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
    expect(screen.getByText('Las observaciones deben tener al menos 10 caracteres.')).toBeInTheDocument();
  });

  // Campos deshabilitados post-guardado (RN-008)
  it('should disable fields if consulta is not editable (RN-008)', () => {
    vi.spyOn(consultaValidators, 'isConsultaEditable').mockReturnValue(false);
    render(<ConsultaOdontologicaForm cita={mockCita} onSave={mockOnSave} initialData={{ observaciones: 'Saved' }} isEditable={false} />);

    expect(screen.getByLabelText(/Odontograma/i)).toBeDisabled();
    expect(screen.getByLabelText(/Procedimientos/i)).toBeDisabled();
    expect(screen.getByLabelText(/Observaciones/i)).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Guardar Consulta/i })).not.toBeInTheDocument();
  });

  it('should call onSave with correct data when all fields are valid', async () => {
    render(<ConsultaOdontologicaForm cita={mockCita} onSave={mockOnSave} isEditable={true} />);

    fireEvent.change(screen.getByLabelText(/Odontograma/i), { target: { value: 'Odontograma description' } });
    fireEvent.change(screen.getByLabelText(/Procedimientos/i), { target: { value: 'Limpieza y empaste' } });
    fireEvent.change(screen.getByLabelText(/Observaciones/i), { target: { value: 'Paciente refiere dolor leve.' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Consulta/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        odontograma: 'Odontograma description',
        procedimientos: 'Limpieza y empaste',
        observaciones: 'Paciente refiere dolor leve.',
        cita: 1,
        historia_clinica_id: 1,
      });
    });
  });
});