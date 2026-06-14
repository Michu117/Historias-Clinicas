import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card } from '../../../ui/components/Card';
import { HistoriasClinicasDashboardLayout } from '../components/HistoriasClinicasDashboardLayout';
import { HistoriasClinicasHeader } from '../components/HistoriasClinicasHeader';
import { HistoriaClinicaForm } from '../components/HistoriaClinicaForm';
import { MessageBanner } from '../components/MessageBanner';
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
    <HistoriasClinicasDashboardLayout>
      <HistoriasClinicasHeader
        title="Nueva Historia Clínica"
        subtitle="Registro inicial de información clínica para la gestión del paciente."
        backTo="/historias"
        secondaryAction={{ label: 'Cancelar', onClick: handleCancel }}
      />

      {message && <MessageBanner type="success" message={message} />}

      {error && <MessageBanner type="error" message={error} />}

      <section className="min-h-0 flex-1">
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
      </section>
    </HistoriasClinicasDashboardLayout>
  );
};

export default NuevaHistoriaClinicaPage;
