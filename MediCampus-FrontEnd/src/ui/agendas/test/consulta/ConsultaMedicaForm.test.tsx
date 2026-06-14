import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConsultaMedicaForm } from '../../component/consulta/ConsultaMedicaForm';
import { Cita } from '../../types';
import * as consultaValidators from '../../utils/validators/consultaValidators';

// Mock SignosVitalesInput
vi.mock('../../component/consulta/SignosVitalesInput', () => ({
  SignosVitalesInput: vi.fn(({ onUpdate }) => (
    <div data-testid="signos-vitales-input">
      <input type="number" data-testid="peso_kg" onChange={(e) => onUpdate({ peso_kg: parseFloat(e.target.value) })} />
      <input type="number" data-testid="temperatura" onChange={(e) => onUpdate({ temperatura: parseFloat(e.target.value) })} />
      <input type="text" data-testid="presion_arterial" onChange={(e) => onUpdate({ presion_arterial: e.target.value })} />
      <input type="number" data-testid="frecuencia_cardiaca" onChange={(e) => onUpdate({ frecuencia_cardiaca: parseFloat(e.target.value) })} />
    </div>
  )),
}));

describe('ConsultaMedicaForm', () => {
  const mockCita: Cita = {
    id: 1,
    usuario_id: 1,
    fecha_hora: '2026-06-15T10:00:00Z',
    estado: 'AGENDADA',
    motivo: 'Control anual',
    servicios: [{ id: 1, nombre: 'Medicina General', descripcion: '', es_activo: true, fecha_creacion: '2026-01-01T00:00:00Z' }],
    fecha_creacion: '2026-06-14T08:00:00Z',
    fecha_actualizacion: '2026-06-14T08:00:00Z',
  };
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(consultaValidators, 'validateObservaciones').mockReturnValue(true);
    vi.spyOn(consultaValidators, 'isConsultaEditable').mockReturnValue(true);
  });

  // Campos: Anamnesis, Diagnóstico, Tratamiento, SignosVitales
  it('should render all required fields for ConsultaMedicaForm', () => {
    render(<ConsultaMedicaForm cita={mockCita} onSave={mockOnSave} isEditable={true} />);
    expect(screen.getByLabelText(/Anamnesis/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Diagnóstico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tratamiento/i)).toBeInTheDocument();
    expect(screen.getByTestId('signos-vitales-input')).toBeInTheDocument();
    expect(screen.getByLabelText(/Observaciones/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar Consulta/i })).toBeInTheDocument();
  });

  // Observaciones obligatorias (RN-007)
  it('should not call onSave if observations are invalid (RN-007)', async () => {
    vi.spyOn(consultaValidators, 'validateObservaciones').mockReturnValue(false);
    render(<ConsultaMedicaForm cita={mockCita} onSave={mockOnSave} isEditable={true} />);

    fireEvent.change(screen.getByLabelText(/Anamnesis/i), { target: { value: 'Some anamnesis' } });
    fireEvent.change(screen.getByLabelText(/Diagnóstico/i), { target: { value: 'Some diagnosis' } });
    fireEvent.change(screen.getByLabelText(/Tratamiento/i), { target: { value: 'Some treatment' } });
    // Assume observations are left empty or too short, triggering validation failure

    fireEvent.click(screen.getByRole('button', { name: /Guardar Consulta/i }));

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
    expect(screen.getByText('Las observaciones deben tener al menos 10 caracteres.')).toBeInTheDocument();
  });

  // Campos deshabilitados post-guardado (RN-008)
  it('should disable fields if consulta is not editable (RN-008)', () => {
    vi.spyOn(consultaValidators, 'isConsultaEditable').mockReturnValue(false);
    render(<ConsultaMedicaForm cita={mockCita} onSave={mockOnSave} initialData={{ observaciones: 'Saved' }} isEditable={false} />);

    expect(screen.getByLabelText(/Anamnesis/i)).toBeDisabled();
    expect(screen.getByLabelText(/Diagnóstico/i)).toBeDisabled();
    expect(screen.getByLabelText(/Tratamiento/i)).toBeDisabled();
    expect(screen.getByLabelText(/Observaciones/i)).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Guardar Consulta/i })).not.toBeInTheDocument();
  });

  it('should call onSave with correct data when all fields are valid', async () => {
    render(<ConsultaMedicaForm cita={mockCita} onSave={mockOnSave} isEditable={true} />);

    fireEvent.change(screen.getByLabelText(/Anamnesis/i), { target: { value: 'Paciente con dolor de cabeza' } });
    fireEvent.change(screen.getByLabelText(/Diagnóstico/i), { target: { value: 'Cefalea tensional' } });
    fireEvent.change(screen.getByLabelText(/Tratamiento/i), { target: { value: 'Reposo y analgésicos' } });
    fireEvent.change(screen.getByLabelText(/Observaciones/i), { target: { value: 'Se recomienda seguimiento en 3 días.' } });

    fireEvent.change(screen.getByTestId('peso_kg'), { target: { value: '75' } });
    fireEvent.change(screen.getByTestId('temperatura'), { target: { value: '37.0' } });
    fireEvent.change(screen.getByTestId('presion_arterial'), { target: { value: '110/70' } });
    fireEvent.change(screen.getByTestId('frecuencia_cardiaca'), { target: { value: '72' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Consulta/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        anamnesis: 'Paciente con dolor de cabeza',
        tratamiento: 'Reposo y analgésicos',
        diagnostico: 'Cefalea tensional',
        observaciones: 'Se recomienda seguimiento en 3 días.',
        signos_vitales: {
          peso_kg: 75,
          temperatura: 37,
          presion_arterial: '110/70',
          frecuencia_cardiaca: 72,
        },
        cita: 1,
        historia_clinica_id: 1,
      });
    });
  });
});