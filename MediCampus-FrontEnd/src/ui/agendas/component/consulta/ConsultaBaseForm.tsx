import React, { useState, useEffect } from 'react';
import { Cita, Consulta } from '../../types';
import { validateObservaciones } from '../../utils/validators/consultaValidators';
import { messages } from '../../utils/constants/messages';

interface ConsultaBaseFormProps<T extends Consulta> {
  cita: Cita;
  initialData?: T | null;
  onSave: (data: any) => void;
  isLoading: boolean;
  isEditable: boolean;
  renderFields: () => React.ReactNode;
  getFormData: () => Partial<T>;
}

export const ConsultaBaseForm = <T extends Consulta>({
  cita,
  initialData,
  onSave,
  isLoading,
  isEditable,
  renderFields,
  getFormData,
}: ConsultaBaseFormProps<T>) => {
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      // Los estados se inicializan en cada subcomponente
    }
  }, [initialData]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!validateObservaciones(getFormData().observaciones || '')) {
      setFormError(messages.errors.observacionesMinLength);
      return;
    }

    onSave(getFormData());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && <p className="text-red-500 text-sm">{formError}</p>}
      {renderFields()}
      {isEditable && (
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isLoading ? 'Guardando...' : 'Guardar Consulta'}
        </button>
      )}
    </form>
  );
};