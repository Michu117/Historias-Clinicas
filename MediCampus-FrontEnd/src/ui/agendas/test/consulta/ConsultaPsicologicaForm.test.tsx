import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConsultaPsicologicaForm } from '../../component/consulta/ConsultaPsicologicaForm';
import { Cita } from '../../types';
import * as consultaValidators from '../../utils/validators/consultaValidators';

describe("ConsultaPsicologicaForm", () => {
  const mockCita: Cita = {
    id: 1,
    usuario_id: 1,
    fecha_hora: "2026-06-15T10:00:00Z",
    estado: "AGENDADA",
    motivo: "Primera consulta",
    servicios: [
      { id: 3, nombre: "Psicología", descripcion: "", es_activo: true, fecha_creacion: "2026-01-01T00:00:00Z" },
    ],
    fecha_creacion: "2026-06-14T08:00:00Z",
    fecha_actualizacion: "2026-06-14T08:00:00Z",
  };
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(consultaValidators, "validateObservaciones").mockReturnValue(true);
    vi.spyOn(consultaValidators, "isConsultaEditable").mockReturnValue(true);
  });

  // Campos: NotasEvolucion, EstadoHumor, NivelAnsiedad (0-100), NivelAutoestima (0-100), Diagnóstico
  it("should render all required fields for ConsultaPsicologicaForm", () => {
    render(<ConsultaPsicologicaForm cita={mockCita} onSave={mockOnSave} isEditable={true} />);
    expect(screen.getByLabelText(/Notas de Evolución/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Estado de Humor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nivel de Ansiedad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nivel de Autoestima/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Diagnóstico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Observaciones/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Guardar Consulta/i })).toBeInTheDocument();
  });

  // Observaciones obligatorias (RN-007)
  it("should not call onSave if observations are invalid (RN-007)", async () => {
    vi.spyOn(consultaValidators, "validateObservaciones").mockReturnValue(false);
    render(<ConsultaPsicologicaForm cita={mockCita} onSave={mockOnSave} isEditable={true} />);

    fireEvent.change(screen.getByLabelText(/Notas de Evolución/i), { target: { value: "Some notes" } });
    fireEvent.change(screen.getByLabelText(/Diagnóstico/i), { target: { value: "Some diagnosis" } });

    fireEvent.click(screen.getByRole("button", { name: /Guardar Consulta/i }));

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
    expect(screen.getByText("Las observaciones deben tener al menos 10 caracteres.")).toBeInTheDocument();
  });

  // Campos deshabilitados post-guardado (RN-008)
  it("should disable fields if consulta is not editable (RN-008)", () => {
    vi.spyOn(consultaValidators, "isConsultaEditable").mockReturnValue(false);
    render(
      <ConsultaPsicologicaForm
        cita={mockCita}
        onSave={mockOnSave}
        initialData={{ observaciones: "Saved" }}
        isEditable={false}
      />
    );

    expect(screen.getByLabelText(/Notas de Evolución/i)).toBeDisabled();
    expect(screen.getByLabelText(/Estado de Humor/i)).toBeDisabled();
    expect(screen.getByLabelText(/Nivel de Ansiedad/i)).toBeDisabled();
    expect(screen.getByLabelText(/Nivel de Autoestima/i)).toBeDisabled();
    expect(screen.getByLabelText(/Diagnóstico/i)).toBeDisabled();
    expect(screen.getByLabelText(/Observaciones/i)).toBeDisabled();
    expect(screen.queryByRole("button", { name: /Guardar Consulta/i })).not.toBeInTheDocument();
  });

  it("should call onSave with correct data when all fields are valid", async () => {
    render(<ConsultaPsicologicaForm cita={mockCita} onSave={mockOnSave} isEditable={true} />);

    fireEvent.change(screen.getByLabelText(/Notas de Evolución/i), { target: { value: "Paciente muestra progreso significativo." } });
    fireEvent.change(screen.getByLabelText(/Estado de Humor/i), { target: { value: "Feliz" } });
    fireEvent.change(screen.getByLabelText(/Nivel de Ansiedad/i), { target: { value: "20" } });
    fireEvent.change(screen.getByLabelText(/Nivel de Autoestima/i), { target: { value: "80" } });
    fireEvent.change(screen.getByLabelText(/Diagnóstico/i), { target: { value: "Ansiedad leve" } });
    fireEvent.change(screen.getByLabelText(/Observaciones/i), { target: { value: "Se continuará con terapia cognitiva conductual." } });

    fireEvent.click(screen.getByRole("button", { name: /Guardar Consulta/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        notas_evolucion: "Paciente muestra progreso significativo.",
        estado_humor: "Feliz",
        nivel_ansiedad: 20,
        nivel_autoestima: 80,
        diagnostico: "Ansiedad leve",
        observaciones: "Se continuará con terapia cognitiva conductual.",
        cita: 1,
        historia_clinica_id: 1,
      });
    });
  });
});