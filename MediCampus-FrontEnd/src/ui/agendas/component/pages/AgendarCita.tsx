import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, CardTitle } from '../../../components';
import { ServiceSelector } from '../selectors/ServiceSelector';
import { ProfessionalSelector } from '../selectors/ProfessionalSelector';
import { DateTimeSlotSelector } from '../selectors/DateTimeSlotSelector';
import { useAgendamiento } from '../../hooks/useAgendamiento';
import { citaService } from '../../services/api/citaService';
import { EstadoCita } from '../../types';
import { messages } from '../../utils/constants/messages';
import { getUserId } from '../../services/storage/authStorage';
import { HamburgerMenu } from '../shared/HamburgerMenu';

export const AgendarCita: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reprogramCita = (location.state as any)?.reprogramCita as
    | { id: number; servicio_id: number; profesional_id: number; motivo: string }
    | undefined;

  const agendamiento = useAgendamiento();
  const [servicios, setServicios] = useState(agendamiento.servicios);
  const [profesionales, setProfesionales] = useState(agendamiento.profesionales);
  const [citasExistentes, setCitasExistentes] = useState(agendamiento.citasExistentes);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(reprogramCita?.servicio_id ?? null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(reprogramCita?.profesional_id ?? null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [motivo, setMotivo] = useState(reprogramCita?.motivo || '');
  const [isLoading, setIsLoading] = useState(false);
  const [citaEstado, setCitaEstado] = useState<string>(reprogramCita ? 'AGENDADA' : 'EN CREACIÓN');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = useMemo(() => getUserId() ?? 0, []);

  useEffect(() => {
    const fetchServicios = async () => {
      setIsLoading(true);
      await agendamiento.loadServicios();
      setServicios([...agendamiento.servicios]);
      setIsLoading(false);
    };

    fetchServicios();
  }, []);

  useEffect(() => {
    if (!reprogramCita || servicios.length === 0) return;
    const servicio = servicios.find((s) => s.id === reprogramCita.servicio_id);
    if (servicio) {
      agendamiento.loadProfesionales(reprogramCita.servicio_id, servicio.nombre).then(() => {
        setProfesionales([...agendamiento.profesionales]);
        if (reprogramCita.profesional_id > 0) {
          agendamiento.loadCitasPorProfesional(reprogramCita.profesional_id).then(() => {
            setCitasExistentes([...agendamiento.citasExistentes]);
          });
        }
      });
    }
  }, [servicios.length]);

  const handleServiceSelect = async (serviceId: number) => {
    setSelectedServiceId(serviceId);
    setSelectedProfessionalId(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setMessage(null);
    setError(null);
    setCitasExistentes([]);
    setIsLoading(true);
    const servicio = servicios.find((s) => s.id === serviceId);
    await agendamiento.loadProfesionales(serviceId, servicio?.nombre);
    setProfesionales([...agendamiento.profesionales]);
    setIsLoading(false);
  };

  const handleProfessionalSelect = async (professionalId: number) => {
    setSelectedProfessionalId(professionalId);
    setSelectedDate(null);
    setSelectedTime(null);
    setMessage(null);
    setError(null);
    if (professionalId > 0) {
      setIsLoading(true);
      await agendamiento.loadCitasPorProfesional(professionalId);
      setCitasExistentes([...agendamiento.citasExistentes]);
      setIsLoading(false);
    }
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
    setIsLoading(true);

    const citaData = {
      paciente_id: currentUserId,
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

    if (reprogramCita) {
      const fecha_hora = `${citaData.fecha}T${citaData.hora}:00`;
      try {
        await citaService.actualizar(reprogramCita.id, { estado: EstadoCita.REAGENDADA });
        await citaService.crear({
          usuario_id: currentUserId,
          profesional_id: reprogramCita.profesional_id || null,
          fecha_hora,
          motivo: citaData.motivo,
          servicios: [reprogramCita.servicio_id],
        });
        setMessage('Cita reprogramada con éxito.');
      } catch {
        setError('Error al reprogramar la cita.');
        setIsLoading(false);
        return;
      }
    } else {
      await agendamiento.crearCita(citaData as any);
      if (agendamiento.error) {
        setError(agendamiento.error);
        setIsLoading(false);
        return;
      }
      setCitasExistentes([...agendamiento.citasExistentes]);
    }

    setCitaEstado(EstadoCita.AGENDADA);
    setMessage(reprogramCita ? 'Cita reprogramada con éxito.' : 'Cita creada con éxito.');
    setMotivo('');
    setSelectedServiceId(null);
    setSelectedProfessionalId(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setProfesionales([]);
    setIsLoading(false);
  };

  const canSubmit = selectedServiceId && selectedProfessionalId && selectedDate && selectedTime && motivo.trim().length > 0;

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--hc-bg)' }}>
      <header className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between" style={{ backgroundColor: 'var(--btn-primary-bg)' }}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <span className="font-bold text-sm sm:text-base text-white">M</span>
          </div>
          <h1 className="text-base sm:text-lg font-semibold truncate text-white">MediCampus</h1>
        </div>
        <HamburgerMenu />
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto max-w-4xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
        <Card>
          <CardTitle>{messages.titles.agendarCita}</CardTitle>
          <p className="mt-2 text-xs sm:text-sm" style={{ color: 'var(--card-text-muted)' }}>
            Complete los detalles para programar una nueva atenci&oacute;n m&eacute;dica.
          </p>
        </Card>

        <Card className="space-y-6 sm:space-y-10">
          <section aria-labelledby="service-details">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--btn-primary-bg)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 id="service-details" className="text-base sm:text-lg font-bold" style={{ color: 'var(--hc-text)' }}>1. Detalles del Servicio</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-bold" style={{ color: 'var(--on-surface)' }}>Especialidad</label>
                <ServiceSelector
                  servicios={servicios}
                  selectedServiceId={selectedServiceId}
                  onSelect={handleServiceSelect}
                  isLoading={isLoading}
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-bold" style={{ color: 'var(--on-surface)' }}>Profesional Asignado</label>
                <ProfessionalSelector
                  profesionales={profesionales}
                  selectedProfessionalId={selectedProfessionalId}
                  onSelect={handleProfessionalSelect}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </section>

          <section aria-labelledby="date-time">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--btn-primary-bg)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 id="date-time" className="text-base sm:text-lg font-bold" style={{ color: 'var(--hc-text)' }}>2. Fecha y Hora</h3>
            </div>
            <DateTimeSlotSelector
              profesionalId={selectedProfessionalId ?? 0}
              servicioId={selectedServiceId ?? 0}
              citasExistentes={citasExistentes}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSelect={handleDateTimeSelect}
              isLoading={isLoading}
            />
          </section>

          <section aria-labelledby="additional-details">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--btn-primary-bg)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h3 id="additional-details" className="text-base sm:text-lg font-bold" style={{ color: 'var(--hc-text)' }}>3. Detalles Adicionales</h3>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="motivo" className="text-xs sm:text-sm font-bold" style={{ color: 'var(--on-surface)' }}>
                Motivo de la cita <span className="text-red-500">*</span>
              </label>
              <textarea
                id="motivo"
                value={motivo}
                onChange={(event) => setMotivo(event.target.value)}
                className="w-full min-h-[80px] sm:min-h-[100px] px-3 sm:px-4 py-2 sm:py-3 rounded-lg border text-sm focus:ring-2 focus:ring-[var(--btn-primary-bg)] focus:border-transparent outline-none transition-all resize-y"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--outline)',
                  color: 'var(--hc-text)',
                }}
                placeholder="Describe brevemente el motivo de la consulta..."
              />
            </div>
          </section>

          {(error || message) && (
            <div className="space-y-2 sm:space-y-3">
              {error ? (
                <div className="rounded-lg border p-3 sm:p-4 text-xs sm:text-sm flex items-center gap-2 font-medium" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2', color: '#991b1b' }}>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              ) : null}
              {message ? (
                <div className="rounded-lg border p-3 sm:p-4 text-xs sm:text-sm flex items-center gap-2 font-medium" style={{ borderColor: '#bbf7d0', backgroundColor: '#f0fdf4', color: '#166534' }}>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {message}
                </div>
              ) : null}
            </div>
          )}

          <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4" style={{ borderTop: '1px solid var(--card-border)' }}>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border" style={{ backgroundColor: 'var(--primary-container)', borderColor: 'var(--outline-variant)' }}>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--on-primary-container)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--on-primary-container)' }}>
                Estado: {citaEstado}
              </span>
            </div>

            <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
              <Button variant="secondary" onClick={() => {
                setSelectedServiceId(null);
                setSelectedProfessionalId(null);
                setSelectedDate(null);
                setSelectedTime(null);
                setMotivo('');
                setError(null);
                setMessage(null);
              }}>
                {messages.actions.cancelar}
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading || !canSubmit}>
                {messages.actions.guardar}
              </Button>
            </div>
          </div>
        </Card>
      </main>

      <footer className="text-center text-[10px] sm:text-xs py-3 sm:py-4" style={{ color: 'var(--on-surface-variant)', borderTop: '1px solid var(--card-border)' }}>
        Universidad Nacional de Loja &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};
