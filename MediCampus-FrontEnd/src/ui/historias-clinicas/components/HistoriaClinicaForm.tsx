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
  const submitLabel = mode === 'create' ? 'Guardar historia' : 'Actualizar historia';

  return (
    <form
      className="grid gap-4"
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
      <div className="grid gap-1">
        <label htmlFor="historia-antecedentes" className="text-sm font-medium text-slate-700">
          Antecedentes
        </label>
        <textarea
          id="historia-antecedentes"
          className="w-full px-3 py-2 border border-slate-300 rounded-global text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          rows={3}
          value={values.antecedentes}
          placeholder="Antecedentes relevantes"
          onChange={(event) => onChange('antecedentes', event.target.value)}
        />
      </div>
      <div className="grid gap-1">
        <label htmlFor="historia-casos" className="text-sm font-medium text-slate-700">
          Casos
        </label>
        <textarea
          id="historia-casos"
          className="w-full px-3 py-2 border border-slate-300 rounded-global text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          rows={3}
          value={values.casos}
          placeholder="Casos asociados"
          onChange={(event) => onChange('casos', event.target.value)}
        />
      </div>
      <div className="grid gap-1">
        <label htmlFor="historia-documentos" className="text-sm font-medium text-slate-700">
          Documentos
        </label>
        <textarea
          id="historia-documentos"
          className="w-full px-3 py-2 border border-slate-300 rounded-global text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          rows={3}
          value={values.documentos}
          placeholder="Documentos adjuntos"
          onChange={(event) => onChange('documentos', event.target.value)}
        />
      </div>
      <div className="grid gap-1">
        <label htmlFor="historia-consultas" className="text-sm font-medium text-slate-700">
          Consultas
        </label>
        <textarea
          id="historia-consultas"
          className="w-full px-3 py-2 border border-slate-300 rounded-global text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          rows={3}
          value={values.consultas}
          placeholder="Resumen de consultas"
          onChange={(event) => onChange('consultas', event.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4 justify-end pt-4 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="cursor-pointer text-sm">
          Cancelar
        </button>
        <Button type="submit" disabled={isSubmitting} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
