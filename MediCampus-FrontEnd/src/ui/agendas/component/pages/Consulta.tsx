import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useConsulta } from '../../hooks/useConsulta';
import { useDerivacion } from '../../hooks/useDerivacion';
import { useCertificado } from '../../hooks/useCertificado';

import { ConsultaForm } from '../consulta/ConsultaForm';
import { DerivacionModal } from '../derivacion/DerivacionModal';
import { CertificateButton } from '../shared/CertificateButton';
import { HamburgerMenuDropdown } from '../../../components/HamburgerMenuDropdown';
import { TopNavBar } from '../shared/TopNavBar';
import { Cita, Servicio, EstadoCita } from '../../types';
import { citaService } from '../../services/api/citaService';
import { servicioService } from '../../services/api/servicioService';
import { startedConsultaStorage } from '../../services/storage/startedConsultaStorage';

const SERVICE_NAME_MAP: Record<number, string> = {
  1: 'Medicina General',
  2: 'Odontología',
  3: 'Trabajo Social',
  4: 'Psicología',
};

export const Consulta: React.FC = () => {
  const { citaId: citaIdParam } = useParams<{ citaId: string }>();
  const citaId = parseInt(citaIdParam || '0', 10);

  const { consulta, loading, error, cita, crearConsulta, guardarConsulta } = useConsulta(citaId || undefined);
  const { crearDerivacion, error: derivError } = useDerivacion();

  const [citaData, setCitaData] = useState<Cita | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [showDerivacionModal, setShowDerivacionModal] = useState(false);
  const [consultaCreada, setConsultaCreada] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [certError, setCertError] = useState<string | null>(null);
  const { enviarCertificadoEmail, loading: certLoading } = useCertificado();
  useEffect(() => {
    if (citaId) {
      startedConsultaStorage.markStarted(citaId);
    }
  }, [citaId]);

  useEffect(() => {
    if (citaId && !cita) {
      citaService.obtener(citaId).then(setCitaData).catch(() => {});
    }
  }, [citaId, cita]);

  useEffect(() => {
    if (cita) setCitaData(cita);
  }, [cita]);

  useEffect(() => {
    servicioService.listar().then(setServicios).catch(() => {});
  }, []);

  const currentCita = cita || citaData;

  const serviceName = currentCita ? SERVICE_NAME_MAP[currentCita.servicio_id] || 'Medicina General' : 'Medicina General';

  const puedeDescargarCertificado = currentCita?.estado === EstadoCita.ATENDIDA || consultaCreada;

  const handleSaveConsulta = useCallback(async (data: any) => {
    if (!citaId) return;
    if (consulta) {
      if (!consulta.id) return;
      const result = await guardarConsulta(consulta.id, serviceName, data);
      if (result) {
        setSuccessMsg('Consulta actualizada correctamente.');
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } else {
      const result = await crearConsulta(citaId, serviceName, data);
      if (result) {
        startedConsultaStorage.markCompleted(citaId);
        setConsultaCreada(true);
        setSuccessMsg('Consulta registrada correctamente.');
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    }
  }, [citaId, serviceName, crearConsulta, guardarConsulta, consulta]);

  const handleDerivar = useCallback(async (data: { cita_origen_id: number; servicio_destino_id: number; motivo: string }) => {
    setShowDerivacionModal(false);
    try {
      const cita = await crearDerivacion({
        cita_origen_id: data.cita_origen_id,
        servicio_destino_id: data.servicio_destino_id,
        motivo: data.motivo,
        usuario_id: currentCita?.paciente_id,
      });
      if (cita) {
        const profesional = cita.profesional_nombre || `Profesional #${cita.profesional_id}`;
        setSuccessMsg(`Derivación creada. Cita asignada con ${profesional} para el ${String(cita.fecha)} a las ${cita.hora}.`);
      } else {
        setSuccessMsg('Derivación externa creada correctamente.');
      }
    } catch {
      setSuccessMsg(null);
    }
  }, [currentCita, crearDerivacion]);

  if (!citaId) {
    return (
      <div className="min-h-screen bg-[var(--hc-bg)] flex flex-col">
        <header
          className="h-16 flex items-center gap-3 px-6 shrink-0"
          style={{ backgroundColor: 'var(--surface-container-lowest)', borderBottom: '1px solid var(--outline)' }}
        >
          <HamburgerMenuDropdown />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--hc-text)' }}>Atención de Consulta</h2>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-10 max-w-6xl mx-auto">
            <h1 className="text-3xl font-black text-[var(--hc-text)] tracking-tight mb-2">Atención de Consulta</h1>
            <p className="text-[var(--on-surface-variant)] font-medium">Selecciona una cita desde Mi Agenda para registrar la consulta.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--hc-bg)] flex flex-col">
      <header
        className="h-16 flex items-center gap-3 px-6 shrink-0"
        style={{ backgroundColor: 'var(--surface-container-lowest)', borderBottom: '1px solid var(--outline)' }}
      >
        <HamburgerMenuDropdown />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--hc-text)' }}>Registro de Consulta</h2>
      </header>

      <main className="flex-1 overflow-y-auto">
        <TopNavBar />

        <div className="p-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-[var(--hc-text)] tracking-tight mb-1">Registro de Consulta - {serviceName}</h1>
            <p className="text-[var(--on-surface-variant)] font-medium">Gestión de consultas y registro clínico institucional.</p>
          </div>

          {/* Success / Error Messages */}
          {successMsg && (
            <div className="mb-6 rounded-xl border p-4 text-sm font-medium flex items-center gap-2 hc-banner-success">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="flex-1">{successMsg}</span>
              <button
                onClick={() => setSuccessMsg(null)}
                className="shrink-0 p-1 rounded transition-colors hc-banner-close"
                aria-label="Cerrar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {(error || derivError || certError) && (
            <div className="mb-6 rounded-xl border p-4 text-sm font-medium hc-banner-error">{error || derivError || certError}</div>
          )}

          {/* Patient Info Card */}
          {currentCita && (
            <div className="rounded-2xl p-6 shadow-sm mb-8" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[var(--primary-container)] flex items-center justify-center text-[var(--on-primary-container)] font-black text-xl">
                    P{currentCita.paciente_id}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--hc-text)]">Registro de Datos en la Consulta</h2>
                    <p className="text-sm text-[var(--on-surface-variant)]">
                      Paciente actual:{' '}
                      <span className="font-bold text-[var(--primary)]">{currentCita.paciente_nombre || `Paciente #${currentCita.paciente_id}`}</span>
                    </p>
                    <p className="text-xs text-[var(--on-surface-variant)] mt-1">
                      {String(currentCita.fecha)} {currentCita.hora} — {currentCita.motivo || 'Sin motivo'}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${
                    currentCita.estado === EstadoCita.ATENDIDA || consultaCreada
                      ? 'hc-badge-success'
                      : 'hc-badge-warning'
                  }`}
                >
                  {currentCita.estado === EstadoCita.ATENDIDA || consultaCreada ? 'COMPLETADO' : 'EN CURSO'}
                </span>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Consultation Form - dynamic per service type */}
          {currentCita && !loading && (
            <ConsultaForm
              cita={currentCita}
              initialData={consulta}
              onSave={handleSaveConsulta}
              isLoading={loading}
              error={error}
              isEditable={!consulta && !consultaCreada}
              serviceName={serviceName}
            />
          )}

          {/* Derivación Section - always visible, optional */}
          {currentCita && (
            <div className="mt-8 rounded-2xl p-8 shadow-sm" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-bold text-[var(--hc-text)]">Derivación Interdisciplinaria</h3>
              </div>
              <p className="text-sm text-[var(--on-surface-variant)] mb-6">
                Si el paciente requiere atención adicional, puedes crear una derivación a otro servicio. (Opcional)
              </p>
              <button
                onClick={() => setShowDerivacionModal(true)}
                className="h-12 px-8 bg-[var(--primary)] text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all shadow-sm"
              >
                Derivar Paciente
              </button>

              <DerivacionModal
                citaId={citaId}
                servicioActualId={currentCita.servicio_id}
                servicios={servicios}
                open={showDerivacionModal}
                onSubmit={handleDerivar}
                onCancel={() => setShowDerivacionModal(false)}
              />
            </div>
          )}

          {/* Certificado Section - only when cita is ATENDIDA */}
          {currentCita && puedeDescargarCertificado && (
            <div className="mt-8 rounded-2xl p-8 shadow-sm" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-bold text-[var(--hc-text)]">Certificado de Atención</h3>
              </div>
              <p className="text-sm text-[var(--on-surface-variant)] mb-6">
                Descarga o envía el certificado de atención para esta consulta.
              </p>
              <div className="flex gap-3">
                <CertificateButton
                  citaId={citaId}
                  estado={currentCita.estado}
                  onSuccess={() => {
                    setSuccessMsg('Certificado descargado correctamente.');
                    setTimeout(() => setSuccessMsg(null), 5000);
                  }}
                  onError={(msg) => {
                    setSuccessMsg(null);
                  }}
                />
                <button
                  type="button"
                  onClick={async () => {
                    const result = await enviarCertificadoEmail(citaId);
                    setCertError(null);
                    if (result.success) {
                      setSuccessMsg(result.message || 'Certificado enviado por correo.');
                      setTimeout(() => setSuccessMsg(null), 5000);
                    } else {
                      setCertError(result.message || 'Error al enviar certificado');
                    }
                  }}
                  disabled={certLoading}
                  className="px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}
                  onMouseEnter={(e) => { if (!certLoading) e.currentTarget.style.backgroundColor = 'var(--primary-container)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)' }}
                >
                  {certLoading ? 'Enviando...' : 'Enviar Certificado'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
