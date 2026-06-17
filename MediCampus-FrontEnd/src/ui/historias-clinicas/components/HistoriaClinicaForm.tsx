import { Button } from '../../../ui/components/Button';
import { Input } from '../../../ui/components/Input';
import type { HistoriaClinicaFormValues } from '../types/historiaClinica.types';

interface HistoriaClinicaFormProps {
  mode: 'create' | 'edit';
  values: HistoriaClinicaFormValues;
  onChange: (field: keyof HistoriaClinicaFormValues, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const HistoriaClinicaForm = ({
  mode,
  values,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting = false
}: HistoriaClinicaFormProps) => {
  const submitLabel = mode === 'create' ? 'Guardar' : 'Guardar cambios';

  return (
    <form
      className="mx-auto grid max-w-[960px] gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-1">
        <label htmlFor="historia-usuario" className="text-sm font-medium text-slate-700">
          Nombre del usuario
        </label>
        <Input
          id="historia-usuario"
          value={values.usuarioNombre}
          placeholder="Nombre completo del usuario"
          onChange={(event) => onChange('usuarioNombre', event.target.value)}
        />
      </div>
      <div className="grid gap-1">
        <label htmlFor="historia-identificacion" className="text-sm font-medium text-slate-700">
          Identificación
        </label>
        <Input
          id="historia-identificacion"
          value={values.usuarioIdentificacion}
          placeholder="Documento de identificación"
          onChange={(event) => onChange('usuarioIdentificacion', event.target.value)}
        />
      </div>
      <div className="grid gap-1">
        <label htmlFor="historia-alergia" className="text-sm font-medium text-slate-700">
          Alergias
        </label>
        <Input
          id="historia-alergia"
          value={values.alergia}
          placeholder="Alergias reportadas"
          onChange={(event) => onChange('alergia', event.target.value)}
        />
      </div>
      <div className="grid gap-1">
        <label htmlFor="historia-condicion" className="text-sm font-medium text-slate-700">
          Condición preexistente
        </label>
        <Input
          id="historia-condicion"
          value={values.condicionPreexistente}
          placeholder="Condiciones preexistentes"
          onChange={(event) => onChange('condicionPreexistente', event.target.value)}
        />
      </div>
      <div className="grid gap-1">
        <label htmlFor="historia-factor" className="text-sm font-medium text-slate-700">
          Factor de riesgo
        </label>
        <Input
          id="historia-factor"
          value={values.factorRiesgo}
          placeholder="Factores de riesgo identificados"
          onChange={(event) => onChange('factorRiesgo', event.target.value)}
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <Button type="submit" disabled={isSubmitting} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
