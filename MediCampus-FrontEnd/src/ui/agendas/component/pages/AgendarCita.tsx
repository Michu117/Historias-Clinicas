import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/Button';
import { ServiceSelector } from '../selectors/ServiceSelector';
import { ProfessionalSelector } from '../selectors/ProfessionalSelector';
import { DateTimeSlotSelector } from '../selectors/DateTimeSlotSelector';
import { useAgendamiento } from '../../hooks/useAgendamiento';
import { EstadoCita } from '../../types';
import { messages } from '../../utils/constants/messages';

export const AgendarCita: React.FC = () => {
  const agendamiento = useAgendamiento();
  const [servicios, setServicios] = useState(agendamiento.servicios);
  const [profesionales, setProfesionales] = useState(agendamiento.profesionales);
  const [citasExistentes, setCitasExistentes] = useState(agendamiento.citasExistentes);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [motivo, setMotivo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServicios = async () => {
      setIsLoading(true);
      await agendamiento.loadServicios();
      setServicios([...agendamiento.servicios]);
      setIsLoading(false);
    };

    fetchServicios();
  }, []);

  const handleServiceSelect = async (serviceId: number) => {
    setSelectedServiceId(serviceId);
    setSelectedProfessionalId(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setMessage(null);
    setError(null);
    setIsLoading(true);
    await agendamiento.loadProfesionales(serviceId);
    setProfesionales([...agendamiento.profesionales]);
    setIsLoading(false);
  };

  const handleProfessionalSelect = (professionalId: number) => {
    setSelectedProfessionalId(professionalId);
    setSelectedDate(null);
    setSelectedTime(null);
    setMessage(null);
    setError(null);
  };

  const handleDateTimeSelect = (data: { fecha: string; hora: string }) => {
    setSelectedDate(data.fecha || null);
    setSelectedTime(data.hora || null);
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async () => {
    setMessage(null);
    setError(null);

    const citaData = {
      paciente_id: 1,
      profesional_id: selectedProfessionalId ?? 0,
      servicio_id: selectedServiceId ?? 0,
      servicios_ids: selectedServiceId ? [selectedServiceId] : [],
      fecha: selectedDate ?? '',
      hora: selectedTime ?? '',
      duracion_minutos: 30,
      margen_minutos: 30,
      estado: EstadoCita.AGENDADA,
      motivo: motivo.trim(),
    };

    const cita = await agendamiento.crearCita(citaData as any);
    if (agendamiento.error) {
      setError(agendamiento.error);
      return;
    }

    setCitasExistentes([...agendamiento.citasExistentes]);
    setMessage('Cita creada con éxito.');
    setMotivo('');
    setSelectedServiceId(null);
    setSelectedProfessionalId(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setProfesionales([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{messages.titles.agendarCita}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Selecciona servicio, profesional, fecha y hora para agendar una nueva cita.
        </p>
      </div>

      <div className="space-y-4">
        <ServiceSelector
          servicios={servicios}
          selectedServiceId={selectedServiceId}
          onSelect={handleServiceSelect}
          isLoading={isLoading}
        />

        <ProfessionalSelector
          profesionales={profesionales}
          selectedProfessionalId={selectedProfessionalId}
          onSelect={handleProfessionalSelect}
          isLoading={isLoading}
        />

        <DateTimeSlotSelector
          profesionalId={selectedProfessionalId ?? 0}
          servicioId={selectedServiceId ?? 0}
          citasExistentes={citasExistentes}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSelect={handleDateTimeSelect}
          isLoading={isLoading}
        />

        <div>
          <label htmlFor="motivo" className="block text-sm font-medium text-slate-700">
            Motivo de la cita
          </label>
          <textarea
            id="motivo"
            value={motivo}
            onChange={(event) => setMotivo(event.target.value)}
            className="mt-1 w-full min-h-[120px] rounded-global border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            placeholder="Describe brevemente el motivo de la consulta"
          />
        </div>

        {error ? <div className="rounded-global border border-red-300 bg-red-50 p-3 text-red-700">{error}</div> : null}
        {message ? <div className="rounded-global border border-green-300 bg-green-50 p-3 text-green-700">{message}</div> : null}

        <div className="flex items-center gap-4">
          <Button onClick={handleSubmit} disabled={isLoading || !selectedServiceId || !selectedProfessionalId || !selectedDate || !selectedTime || motivo.trim().length === 0}>
            {messages.actions.guardar}
          </Button>
          <Button variant="secondary" onClick={() => {
            setSelectedServiceId(null);
            setSelectedProfessionalId(null);
            setSelectedDate(null);
            setSelectedTime(null);
            setMotivo('');
            setError(null);
            setMessage(null);
            setProfesionales([]);
          }}>
            {messages.actions.cancelar}
          </Button>
        </div>
      </div>
    </div>
  );
};
