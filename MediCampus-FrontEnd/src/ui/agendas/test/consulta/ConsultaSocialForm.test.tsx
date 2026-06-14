import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConsultaSocialForm } from '../../component/consulta/ConsultaSocialForm';
import { Cita } from '../../types';
import * as consultaValidators from '../../utils/validators/consultaValidators';

describe('ConsultaSocialForm', () => {
  const mockCita: Cita = {
    id: 1,
    usuario_id: 1,
    fecha_hora: '2026-06-15T10:00:00Z',
    estado: 'AGENDADA',
    motivo: 'Evaluación social',
    servicios: [
      { id: 4, nombre: 'Trabajo Social', descripcion: '', es_activo: true, fecha_creacion: '2026-01-01T00:00:00Z' },
    ],
    fecha_creacion: '2026-06-14T08:00:00Z',
    fecha_actualizacion: '2026-06-14T08:00:00Z',
  };
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(consultaValidators, 'validateObservaciones').mockReturnValue(true);
    vi.spyOn(consultaValidators, 'isConsultaEditable').mockReturnValue(true);
  });

  // Campos: NivelSocioeconomico, DescripcionVivienda
  it('should render all required fields for ConsultaSocialForm', () => {
    render(<ConsultaSocialForm cita={mockCita} onSave={mockOnSave} isEditable={true} />);
    expect(screen.getByLabelText(/Nivel Socioeconómico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción de Vivienda/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Observaciones/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar Consulta/i })).toBeInTheDocument();
  });

  // Observaciones obligatorias (RN-007)
  it('should not call onSave if observations are invalid (RN-007)', async () => {
    vi.spyOn(consultaValidators, 'validateObservaciones').mockReturnValue(false);
    render(<ConsultaSocialForm cita={mockCita} onSave={mockOnSave} isEditable={true} />);

    fireEvent.change(screen.getByLabelText(/Nivel Socioeconómico/i), { target: { value: 'Bajo' } });
    fireEvent.change(screen.getByLabelText(/Descripción de Vivienda/i), { target: { value: 'Rural' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Consulta/i }));

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
    expect(screen.getByText('Las observaciones deben tener al menos 10 caracteres.')).toBeInTheDocument();
  });

  // Campos deshabilitados post-guardado (RN-008)
  it('should disable fields if consulta is not editable (RN-008)', () => {
    vi.spyOn(consultaValidators, 'isConsultaEditable').mockReturnValue(false);
    render(
      <ConsultaSocialForm
        cita={mockCita}
        onSave={mockOnSave}
        initialData={{ observaciones: 'Saved' }}
        isEditable={false}
      />
    );

    expect(screen.getByLabelText(/Nivel Socioeconómico/i)).toBeDisabled();
    expect(screen.getByLabelText(/Descripción de Vivienda/i)).toBeDisabled();
    expect(screen.getByLabelText(/Observaciones/i)).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Guardar Consulta/i })).not.toBeInTheDocument();
  });

  it('should call onSave with correct data when all fields are valid', async () => {
    render(<ConsultaSocialForm cita={mockCita} onSave={mockOnSave} isEditable={true} />);

    fireEvent.change(screen.getByLabelText(/Nivel Socioeconómico/i), { target: { value: 'Medio' } });
    fireEvent.change(screen.getByLabelText(/Descripción de Vivienda/i), { target: { value: 'Casa con 3 habitaciones, 2 baños.' } });
    fireEvent.change(screen.getByLabelText(/Observaciones/i), { target: { value: 'Paciente vive con 4 familiares.' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Consulta/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        nivel_socioeconomico: 'Medio',
        descripcion_vivienda: 'Casa con 3 habitaciones, 2 baños.',
        observaciones: 'Paciente vive con 4 familiares.',
        cita: 1,
        historia_clinica_id: 1,
      });
    });
  });
});