import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Card } from '../../../ui/components/Card';
import { HistoriaClinicaForm } from '../components/HistoriaClinicaForm';
import { historiasClinicasService } from '../services/historiasClinicasService';

import type {
  HistoriaClinica,
  HistoriaClinicaFormValues,
} from '../types/historiaClinica.types';

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

const mapHistoriaToFormValues = (
  historia: HistoriaClinica
): HistoriaClinicaFormValues => ({
  usuarioNombre: historia.usuario?.nombre ?? '',
  usuarioIdentificacion: historia.usuario?.identificacion ?? '',
  alergia: historia.alergia ?? '',
  condicionPreexistente: historia.condicionPreexistente ?? '',
  factorRiesgo: historia.factorRiesgo ?? '',
  antecedentes: '',
  casos: '',
  documentos: '',
  consultas: historia.consultas ?? '',
});

export default function EditarHistoriaClinicaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [historia, setHistoria] = useState<HistoriaClinica | null>(null);
  const [values, setValues] = useState<HistoriaClinicaFormValues>(initialValues);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const cargarHistoria = async () => {
      if (!id) {
        setError('No se recibió el ID de la historia clínica.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        setMessage('');

        const data = await historiasClinicasService.obtenerHistoriaClinicaPorId(id);

        setHistoria(data);
        setValues(mapHistoriaToFormValues(data));
      } catch (error) {
        console.error('Error al cargar historia clínica:', error);
        setError('No se pudo cargar la historia clínica para edición.');
      } finally {
        setLoading(false);
      }
    };

    cargarHistoria();
  }, [id]);

  const handleChange = (
    field: keyof HistoriaClinicaFormValues,
    value: string
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!id) {
      setMessage('No se recibió el ID de la historia clínica.');
      return;
    }

    if (!values.alergia.trim()) {
      setMessage('La alergia es obligatoria.');
      return;
    }

    if (!values.condicionPreexistente.trim()) {
      setMessage('La condición preexistente es obligatoria.');
      return;
    }

    if (!values.factorRiesgo.trim()) {
      setMessage('El factor de riesgo es obligatorio.');
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage('');

      const historiaActualizada =
        await historiasClinicasService.actualizarHistoriaClinica(id, {
          alergia: values.alergia,
          condicionPreexistente: values.condicionPreexistente,
          factorRiesgo: values.factorRiesgo,
          consultas: values.consultas,
        });

      setHistoria(historiaActualizada);
      setValues(mapHistoriaToFormValues(historiaActualizada));

      setMessage('Historia clínica actualizada correctamente.');
    } catch (error) {
      console.error('Error al actualizar historia clínica:', error);
      setMessage('No se pudo actualizar la historia clínica. Revisa la respuesta del API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/historias');
  };

  if (loading) {
    return (
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <Card>
          <p className="text-sm text-slate-600">
            Cargando historia clínica para edición...
          </p>
        </Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <Card>
          <h1 className="text-xl font-semibold text-slate-900">
            Editar Historia Clínica
          </h1>

          <p className="mt-3 text-sm text-rose-600">{error}</p>

          <button
            type="button"
            onClick={handleCancel}
            className="mt-4 rounded-global border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Volver
          </button>
        </Card>
      </main>
    );
  }

  if (!historia) {
    return (
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <Card>
          <h1 className="text-xl font-semibold text-slate-900">
            Editar Historia Clínica
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            No se encontró la historia clínica solicitada.
          </p>

          <button
            type="button"
            onClick={handleCancel}
            className="mt-4 rounded-global border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Volver
          </button>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 pb-24">
      <header className="space-y-3 rounded-global border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              Historias Clínicas / Edición
            </p>

            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Editar Historia Clínica
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Modificación preparada para la historia clínica seleccionada.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="rounded-global border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>

        </div>
      </header>

      {message && (
        <div className="rounded-global border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {message}
        </div>
      )}

      <Card>
        <HistoriaClinicaForm
          mode="edit"
          values={values}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </Card>
    </main>
  );
}