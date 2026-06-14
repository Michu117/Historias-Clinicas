import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card } from '../../../ui/components/Card';
import { HistoriaClinicaForm } from '../components/HistoriaClinicaForm';
import { historiasClinicasService } from '../services/historiasClinicasService';

import type { HistoriaClinicaFormValues } from '../types/historiaClinica.types';

const initialValues: HistoriaClinicaFormValues = {
  usuarioNombre: '',
  usuarioIdentificacion: '',
  alergia: '',
  condicionPreexistente: '',
  factorRiesgo: '',
  antecedentes: '',
  casos: '',
  documentos: '',
  consultas: '',
};

export const NuevaHistoriaClinicaPage = () => {
  const navigate = useNavigate();

  const [values, setValues] = useState<HistoriaClinicaFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (field: keyof HistoriaClinicaFormValues, value: string) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
		console.log('ENVIANDO HISTORIA CLÍNICA:', values);
      setIsSubmitting(true);
      setMessage('');
      setError('');

      await historiasClinicasService.crearHistoriaClinica(values);

      setMessage('Historia clínica creada correctamente.');

      setTimeout(() => {
        navigate('/historias');
      }, 800);
    } catch (error) {
      console.error('Error al crear historia clínica:', error);
      setError('No se pudo crear la historia clínica. Revisa los datos enviados al API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/historias');
  };

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 pb-24">
      <header className="space-y-3 rounded-global border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Nueva Historia Clínica
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Registro inicial de información clínica para la gestión del paciente.
            </p>
          </div>

          <button
            type="button"
            className="rounded-global border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            onClick={handleCancel}
          >
            Cancelar
          </button>
        </div>
      </header>

      {message && (
        <div className="rounded-global border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-global border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <Card>
        <HistoriaClinicaForm
          mode="create"
          values={values}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </Card>
    </main>
  );
};

export default NuevaHistoriaClinicaPage;
