import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Card } from '../../../ui/components/Card';
import { HistoriasClinicasDashboardLayout } from '../components/HistoriasClinicasDashboardLayout';
import { HistoriasClinicasHeader } from '../components/HistoriasClinicasHeader';
import { HistoriaClinicaForm } from '../components/HistoriaClinicaForm';
import { MessageBanner } from '../components/MessageBanner';
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
      <HistoriasClinicasDashboardLayout>
        <HistoriasClinicasHeader title="Editar Historia Clínica" backTo="/historias" />
        <section className="min-h-0 flex-1">
          <Card>
            <p className="text-sm text-slate-600">
              Cargando historia clínica para edición...
            </p>
          </Card>
        </section>
      </HistoriasClinicasDashboardLayout>
    );
  }

  if (error) {
    return (
      <HistoriasClinicasDashboardLayout>
        <HistoriasClinicasHeader title="Editar Historia Clínica" backTo="/historias" />
        <section className="min-h-0 flex-1">
          <Card>
            <MessageBanner type="error" message={error} />
            <p className="text-sm text-slate-500">No se pudo cargar la información de la historia clínica.</p>
          </Card>
        </section>
      </HistoriasClinicasDashboardLayout>
    );
  }

  if (!historia) {
    return (
      <HistoriasClinicasDashboardLayout>
        <HistoriasClinicasHeader title="Editar Historia Clínica" backTo="/historias" />
        <section className="min-h-0 flex-1">
          <Card>
            <p className="text-sm text-slate-500">
              No se encontró la historia clínica solicitada.
            </p>
          </Card>
        </section>
      </HistoriasClinicasDashboardLayout>
    );
  }

  return (
    <HistoriasClinicasDashboardLayout>
      <HistoriasClinicasHeader
        title="Editar Historia Clínica"
        subtitle="Modificación preparada para la historia clínica seleccionada."
        backTo="/historias"
        secondaryAction={{ label: 'Cancelar', onClick: handleCancel }}
      />

      {message && <MessageBanner type="info" message={message} />}

      <section className="min-h-0 flex-1">
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
      </section>
    </HistoriasClinicasDashboardLayout>
  );
}