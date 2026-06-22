import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConsultaForm } from '../../component/consulta/ConsultaForm';
import { Cita, Servicio } from '../../types';

// Mock de los subformularios para evitar la complejidad de sus implementaciones en este test
vi.mock('../../component/consulta/ConsultaMedicaForm', () => ({
  ConsultaMedicaForm: vi.fn(({ onSave }) => (
    <div data-testid="consulta-medica-form">
      <input data-testid="anamnesis" onChange={(e) => {}} />
      <textarea data-testid="observaciones" onChange={(e) => {}} defaultValue="Initial observations for medical" />
      <button onClick={() => onSave({ anamnesis: 'test', observaciones: 'valid observations for medical' })}>Guardar Médica</button>
    </div>
  )),
}));
vi.mock('../../component/consulta/ConsultaOdontologicaForm', () => ({
  ConsultaOdontologicaForm: vi.fn(({ onSave }) => (
    <div data-testid="consulta-odontologica-form">
      <input data-testid="odontograma" onChange={(e) => {}} />
      <textarea data-testid="observaciones" onChange={(e) => {}} defaultValue="Initial observations for dental" />
      <button onClick={() => onSave({ odontograma: 'test', observaciones: 'valid observations for dental' })}>Guardar Odontológica</button>
    </div>
  )),
}));
vi.mock('../../component/consulta/ConsultaPsicologicaForm', () => ({
  ConsultaPsicologicaForm: vi.fn(({ onSave }) => (
    <div data-testid="consulta-psicologica-form">
      <input data-testid="diagnostico" onChange={(e) => {}} />
      <textarea data-testid="observaciones" onChange={(e) => {}} defaultValue="Initial observations for psychology" />
      <button onClick={() => onSave({ diagnostico: 'test', observaciones: 'valid observations for psychology' })}>Guardar Psicológica</button>
    </div>
  )),
}));
vi.mock('../../component/consulta/ConsultaSocialForm', () => ({
  ConsultaSocialForm: vi.fn(({ onSave }) => (
    <div data-testid="consulta-social-form">
      <input data-testid="nivel_socioeconomico" onChange={(e) => {}} />
      <textarea data-testid="observaciones" onChange={(e) => {}} defaultValue="Initial observations for social" />
      <button onClick={() => onSave({ nivel_socioeconomico: 'test', observaciones: 'valid observations for social' })}>Guardar Social</button>
    </div>
  )),
}));

describe('ConsultaForm', () => {
  const mockCita: any = {
    id: 1,
    paciente_id: 1,
    profesional_id: 0,
    servicio_id: 1,
    fecha: '2026-06-15',
    hora: '10:00',
    duracion_minutos: 30,
    margen_minutos: 30,
    estado: 'AGENDADA',
    motivo: 'Control anual',
    servicios: [{ id: 1, nombre: 'Medicina General', descripcion: '', es_activo: true, fecha_creacion: '2026-01-01T00:00:00Z' }],
    created_at: '2026-06-14T08:00:00Z',
    updated_at: '2026-06-14T08:00:00Z',
  };

  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const requiredProps = {
    isLoading: false,
    error: null,
    isEditable: true,
  };

  // Wrapper polimórfico detecta tipoServicio
  it('should render ConsultaMedicaForm for Medicina General service', () => {
    render(<ConsultaForm cita={mockCita} onSave={mockOnSave} {...requiredProps} serviceName="Medicina General" />);
    expect(screen.getByTestId('consulta-medica-form')).toBeInTheDocument();
  });

  it('should render ConsultaOdontologicaForm for Odontología service', () => {
    const odontologiaCita = { ...mockCita, servicio_id: 2 };
    render(<ConsultaForm cita={odontologiaCita} onSave={mockOnSave} {...requiredProps} serviceName="Odontología" />);
    expect(screen.getByTestId('consulta-odontologica-form')).toBeInTheDocument();
  });

  it('should render ConsultaPsicologicaForm for Psicología service', () => {
    const psicologiaCita = { ...mockCita, servicio_id: 3 };
    render(<ConsultaForm cita={psicologiaCita} onSave={mockOnSave} {...requiredProps} serviceName="Psicología" />);
    expect(screen.getByTestId('consulta-psicologica-form')).toBeInTheDocument();
  });

  it('should render ConsultaSocialForm for Trabajo Social service', () => {
    const socialCita = { ...mockCita, servicio_id: 4 };
    render(<ConsultaForm cita={socialCita} onSave={mockOnSave} {...requiredProps} serviceName="Trabajo Social" />);
    expect(screen.getByTestId('consulta-social-form')).toBeInTheDocument();
  });

  it('should not render any specific form if service is not recognized', () => {
    const unknownServiceCita = { ...mockCita, servicio_id: 5 };
    render(<ConsultaForm cita={unknownServiceCita} onSave={mockOnSave} {...requiredProps} />);
    expect(screen.queryByTestId('consulta-medica-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('consulta-odontologica-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('consulta-psicologica-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('consulta-social-form')).not.toBeInTheDocument();
    expect(screen.getByText('Tipo de servicio no reconocido.')).toBeInTheDocument();
  });

  // Ejecuta onSave()
  it('should call onSave with correct data when subform submits', async () => {
    render(<ConsultaForm cita={mockCita} onSave={mockOnSave} {...requiredProps} serviceName="Medicina General" />);
    const saveButton = screen.getByText('Guardar Médica');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({ anamnesis: 'test', observaciones: 'valid observations for medical' });
    });
  });
});