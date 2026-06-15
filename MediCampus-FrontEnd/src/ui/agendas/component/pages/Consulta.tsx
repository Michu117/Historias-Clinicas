import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useConsulta } from '../../hooks/useConsulta';
import { useDerivacion } from '../../hooks/useDerivacion';
import { ConsultaMedicaForm } from '../consulta/ConsultaMedicaForm';
import { DerivacionModal } from '../derivacion/DerivacionModal';
import { SideNavBar } from '../shared/SideNavBar';
import { TopNavBar } from '../shared/TopNavBar';
import { Cita, Servicio } from '../../types';
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

  const handleSaveConsulta = useCallback(async (data: any) => {
    if (!citaId) return;
    if (consulta) {
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

  const handleDerivar = useCallback((data: { cita_origen_id: number; servicio_destino_id: number; motivo: string }) => {
    crearDerivacion({
      cita_origen_id: data.cita_origen_id,
      servicio_destino_id: data.servicio_destino_id,
      motivo: data.motivo,
      usuario_id: currentCita?.paciente_id,
    });
    setShowDerivacionModal(false);
    setSuccessMsg('Derivación creada correctamente.');
    setTimeout(() => setSuccessMsg(null), 5000);
  }, [currentCita, crearDerivacion]);

  if (!citaId) {
    return (
      <div className="min-h-screen bg-[#faf9ff] flex">
        <SideNavBar />
        <main className="flex-1 ml-60 h-screen overflow-y-auto">
          <TopNavBar />
          <div className="p-10 max-w-6xl mx-auto">
            <h1 className="text-3xl font-black text-[#141b2b] tracking-tight mb-2">Atención de Consulta</h1>
            <p className="text-[#424752] font-medium">Selecciona una cita desde Mi Agenda para registrar la consulta.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9ff] flex">
      <SideNavBar />

      <main className="flex-1 ml-60 h-screen overflow-y-auto">
        <TopNavBar />

        <div className="p-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#141b2b] tracking-tight mb-1">Registro de Consulta Médica</h1>
            <p className="text-[#424752] font-medium">Gestión de consultas y registro clínico institucional.</p>
          </div>

          {/* Success / Error Messages */}
          {successMsg && (
            <div className="mb-6 rounded-xl border border-green-300 bg-green-50 p-4 text-green-700 text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {successMsg}
            </div>
          )}

          {(error || derivError) && (
            <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700 text-sm font-medium">{error || derivError}</div>
          )}

          {/* Patient Info Card */}
          {currentCita && (
            <div className="bg-white border border-[#c2c6d4] rounded-2xl p-6 shadow-sm mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#d7e2ff] flex items-center justify-center text-[#001a40] font-black text-xl">
                  P{currentCita.paciente_id}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#141b2b]">Registro de Datos en la Consulta</h2>
                  <p className="text-sm text-[#424752]">
                    Paciente actual:{' '}
                    <span className="font-bold text-[#0056b3]">Paciente #{currentCita.paciente_id}</span>
                    <span className="ml-2 px-2 py-0.5 bg-[#f1f3ff] rounded border border-[#c2c6d4] text-[11px] font-mono">
                      (ID: HC-{currentCita.paciente_id})
                    </span>
                  </p>
                  <p className="text-xs text-[#424752] mt-1">
                    {String(currentCita.fecha)} {currentCita.hora} — {currentCita.motivo || 'Sin motivo'}
                  </p>
                </div>
              </div>
              {consultaCreada && (
                <button
                  onClick={() => setShowDerivacionModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#0056b3] text-[#0056b3] rounded-lg font-bold text-sm hover:bg-[#f1f3ff] transition-all shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Derivar Paciente
                </button>
              )}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#0056b3] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {currentCita && !loading && (
            <ConsultaMedicaForm
              cita={currentCita}
              initialData={consulta}
              onSave={handleSaveConsulta}
              isLoading={loading}
              isEditable={!consulta && !consultaCreada}
            />
          )}

          {consultaCreada && (
            <div className="mt-8 bg-white border border-[#c2c6d4] rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-6 h-6 text-[#0056b3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-bold text-[#141b2b]">Derivación Interdisciplinaria</h3>
              </div>
              <p className="text-sm text-[#424752] mb-6">
                Si el paciente requiere atención adicional, puedes crear una derivación a otro servicio.
              </p>
              <button
                onClick={() => setShowDerivacionModal(true)}
                className="h-12 px-8 bg-[#0056b3] text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all shadow-sm"
              >
                Derivar Paciente
              </button>

              <DerivacionModal
                citaId={citaId}
                servicioActualId={currentCita?.servicio_id || 0}
                servicios={servicios}
                open={showDerivacionModal}
                onSubmit={handleDerivar}
                onCancel={() => setShowDerivacionModal(false)}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
