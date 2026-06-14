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
  });

  // Wrapper polimórfico detecta tipoServicio
  it('should render ConsultaMedicaForm for Medicina General service', () => {
    render(<ConsultaForm cita={mockCita} onSave={mockOnSave} />);
    expect(screen.getByTestId('consulta-medica-form')).toBeInTheDocument();
  });

  it('should render ConsultaOdontologicaForm for Odontología service', () => {
    const odontologiaCita = { ...mockCita, servicios: [{ id: 2, nombre: 'Odontología', descripcion: '', es_activo: true, fecha_creacion: '2026-01-01T00:00:00Z' }] };
    render(<ConsultaForm cita={odontologiaCita} onSave={mockOnSave} />);
    expect(screen.getByTestId('consulta-odontologica-form')).toBeInTheDocument();
  });

  it('should render ConsultaPsicologicaForm for Psicología service', () => {
    const psicologiaCita = { ...mockCita, servicios: [{ id: 3, nombre: 'Psicología', descripcion: '', es_activo: true, fecha_creacion: '2026-01-01T00:00:00Z' }] };
    render(<ConsultaForm cita={psicologiaCita} onSave={mockOnSave} />);
    expect(screen.getByTestId('consulta-psicologica-form')).toBeInTheDocument();
  });

  it('should render ConsultaSocialForm for Trabajo Social service', () => {
    const socialCita = { ...mockCita, servicios: [{ id: 4, nombre: 'Trabajo Social', descripcion: '', es_activo: true, fecha_creacion: '2026-01-01T00:00:00Z' }] };
    render(<ConsultaForm cita={socialCita} onSave={mockOnSave} />);
    expect(screen.getByTestId('consulta-social-form')).toBeInTheDocument();
  });

  it('should not render any specific form if service is not recognized', () => {
    const unknownServiceCita = { ...mockCita, servicios: [{ id: 5, nombre: 'Unknown', descripcion: '', es_activo: true, fecha_creacion: '2026-01-01T00:00:00Z' }] };
    render(<ConsultaForm cita={unknownServiceCita} onSave={mockOnSave} />);
    expect(screen.queryByTestId('consulta-medica-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('consulta-odontologica-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('consulta-psicologica-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('consulta-social-form')).not.toBeInTheDocument();
    expect(screen.getByText('Tipo de servicio no reconocido.')).toBeInTheDocument();
  });

  // Ejecuta onSave()
  it('should call onSave with correct data when subform submits', async () => {
    render(<ConsultaForm cita={mockCita} onSave={mockOnSave} />);
    const saveButton = screen.getByText('Guardar Médica');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({ anamnesis: 'test', observaciones: 'valid observations for medical' });
    });
  });
});