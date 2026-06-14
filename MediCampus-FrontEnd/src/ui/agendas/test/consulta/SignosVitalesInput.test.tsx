import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignosVitalesInput } from '../../component/consulta/SignosVitalesInput';
import { SignosVitales } from '../../types';

describe('SignosVitalesInput', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Campos: Peso, Temperatura, PresionArterial, FrecuenciaCardiaca
  it('should render all input fields', () => {
    render(<SignosVitalesInput onUpdate={mockOnUpdate} />);

    expect(screen.getByLabelText(/Peso/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Temperatura/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Presión Arterial/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Frecuencia Cardíaca/i)).toBeInTheDocument();
  });

  // Valida rangos (implícitamente, ya que el componente debería manejarlo internamente o el hook que lo usa)
  it('should call onUpdate with validated data when inputs change', async () => {
    render(<SignosVitalesInput onUpdate={mockOnUpdate} />);

    fireEvent.change(screen.getByLabelText(/Peso/i), { target: { value: '70' } });
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({ peso_kg: 70 }));

    fireEvent.change(screen.getByLabelText(/Temperatura/i), { target: { value: '36.5' } });
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({ temperatura: 36.5 }));

    fireEvent.change(screen.getByLabelText(/Presión Arterial/i), { target: { value: '120/80' } });
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({ presion_arterial: '120/80' }));

    fireEvent.change(screen.getByLabelText(/Frecuencia Cardíaca/i), { target: { value: '75' } });
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({ frecuencia_cardiaca: 75 }));
  });

  it('should display initial data correctly', () => {
    const initialData: SignosVitales = {
      id: 0,
      peso_kg: 65.5,
      temperatura: 37.2,
      presion_arterial: '110/70',
      frecuencia_cardiaca: 68,
    };
    render(<SignosVitalesInput onUpdate={mockOnUpdate} initialData={initialData} />);

    expect(screen.getByLabelText(/Peso/i)).toHaveValue(65.5);
    expect(screen.getByLabelText(/Temperatura/i)).toHaveValue(37.2);
    expect(screen.getByLabelText(/Presión Arterial/i)).toHaveValue('110/70');
    expect(screen.getByLabelText(/Frecuencia Cardíaca/i)).toHaveValue(68);
  });
});