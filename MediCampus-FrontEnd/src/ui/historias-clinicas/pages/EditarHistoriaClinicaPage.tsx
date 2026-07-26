import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '../../../ui/components/Button';
import { Card } from '../../../ui/components/Card';
import { Input } from '../../../ui/components/Input';
import { Modal } from '../../../ui/components/Modal';
import { HistoriasClinicasDashboardLayout } from '../components/HistoriasClinicasDashboardLayout';
import { HistoriasClinicasHeader } from '../components/HistoriasClinicasHeader';
import { MessageBanner } from '../components/MessageBanner';
import AntecedentesClinicosList from '../components/AntecedentesClinicosList';
import DocumentosClinicosList from '../components/DocumentosClinicosList';
import { historiasClinicasService } from '../services/historiasClinicasService';
import { useHistoriasClinicasAuth } from '../hooks/useHistoriasClinicasAuth';
import { getNombreMedico } from '../utils/getNombreMedico';

import type { HistoriaClinica, HistoriaClinicaFormValues } from '../types/historiaClinica.types';
import type { AntecedenteClinico } from '../types/antecedenteClinico.types';
import type { ConsultaClinico } from '../types/consultaClinico.types';
import type { RegistroClinicoHistoria } from '../types/registroClinico.types';

const initialFormValues: HistoriaClinicaFormValues = {
  usuarioNombre: '',
  usuarioIdentificacion: '',
  alergia: '',
  condicionPreexistente: '',
  factorRiesgo: '',
};

export default function EditarHistoriaClinicaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, isAuthorized } = useHistoriasClinicasAuth();

  const [historia, setHistoria] = useState<HistoriaClinica | null>(null);
  const [values, setValues] = useState<HistoriaClinicaFormValues>(initialFormValues);

  const [antecedentes, setAntecedentes] = useState<AntecedenteClinico[]>([]);
  const [documentosRefreshKey, setDocumentosRefreshKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [confirmationType, setConfirmationType] = useState<'save' | 'cancel' | null>(null);

  const [consultas, setConsultas] = useState<ConsultaClinico[]>([]);
  const [registros, setRegistros] = useState<RegistroClinicoHistoria[]>([]);
  const [nuevaAlergia, setNuevaAlergia] = useState('');
  const [nuevoFactorRiesgo, setNuevoFactorRiesgo] = useState('');

  useEffect(() => {
    if (!isAuthorized) {
      navigate('/', { replace: true });
      return;
    }

    if (role === 'PACIENTE') {
      navigate('/historias/mi-historia', { replace: true });
      return;
    }

    if (role !== 'MEDICO') {
      navigate('/historias', { replace: true });
      return;
    }
  }, [isAuthorized, role, navigate]);

  const cargarDatos = useCallback(async () => {
    if (!id) {
      setError('No se recibió el ID de la historia clínica.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const [hc, registrosData, ants, cs] = await Promise.all([
        historiasClinicasService.obtenerHistoriaClinicaPorId(id),
        historiasClinicasService.listarRegistrosClinicosPorHistoria(id),
        historiasClinicasService.listarAntecedentesPorHistoria(id),
        historiasClinicasService.listarCasosClinicosPorHistoria(id),
      ]);
      setHistoria(hc);
      setConsultas(cs);
      setValues({
        usuarioNombre: hc.usuario?.nombre ?? '',
        usuarioIdentificacion: hc.usuario?.identificacion ?? '',
        alergia: hc.alergia ?? '',
        condicionPreexistente: '',
        factorRiesgo: hc.factorRiesgo ?? '',
      });
      setRegistros(registrosData);
      setAntecedentes(ants);
    } catch (err) {
      console.error('Error al cargar:', err);
      setError('No se pudo cargar la información para edición.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const handleChange = (field: keyof HistoriaClinicaFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!id) {
      setMessage('No se recibió el ID de la historia clínica.');
      return;
    }
    setIsSaving(true);
    setMessage('');
    setError('');
    try {
      const hcActualizada = await historiasClinicasService.actualizarHistoriaClinica(id, {});
      setHistoria(hcActualizada);
      setConfirmationType(null);
      setMessage('Historia clínica actualizada correctamente.');
      setTimeout(() => navigate('/historias', { replace: true }), 1500);
    } catch (err: any) {
      console.error('Error al actualizar:', err);
      setConfirmationType(null);
      setError(err?.message ?? 'No se pudo actualizar. Revisa la respuesta del API.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAgregarAlergia = async () => {
    if (!id || !nuevaAlergia.trim()) return;
    try {
      await historiasClinicasService.crearRegistroClinico(id, {
        tipo: 'ALERGIA',
        descripcion: nuevaAlergia.trim(),
      });
      setNuevaAlergia('');
      const registrosData = await historiasClinicasService.listarRegistrosClinicosPorHistoria(id);
      setRegistros(registrosData);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo agregar la alergia.');
    }
  };

  const handleAgregarFactorRiesgo = async () => {
    if (!id || !nuevoFactorRiesgo.trim()) return;
    try {
      await historiasClinicasService.crearRegistroClinico(id, {
        tipo: 'FACTOR_RIESGO',
        descripcion: nuevoFactorRiesgo.trim(),
      });
      setNuevoFactorRiesgo('');
      const registrosData = await historiasClinicasService.listarRegistrosClinicosPorHistoria(id);
      setRegistros(registrosData);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo agregar el factor de riesgo.');
    }
  };

  const handleCrearAntecedente = async (payload: Partial<AntecedenteClinico>) => {
    if (!id) return;
    await historiasClinicasService.crearAntecedenteClinico({
      ...payload,
      historiaClinicaId: id,
    });
    const ants = await historiasClinicasService.listarAntecedentesPorHistoria(id);
    setAntecedentes(ants);
  };

  const handleActualizarAntecedente = async (anteId: string, payload: Partial<AntecedenteClinico>) => {
    await historiasClinicasService.actualizarAntecedente(anteId, payload);
    const ants = await historiasClinicasService.listarAntecedentesPorHistoria(id!);
    setAntecedentes(ants);
  };

  const handleCancel = () => {
    setConfirmationType('cancel');
  };

  const requestSaveConfirmation = () => {
    setConfirmationType('save');
  };

  const registrosAlergias = registros.filter((r) => r.tipo === 'ALERGIA');
  const registrosFactores = registros.filter((r) => r.tipo === 'FACTOR_RIESGO');

  if (!isAuthorized) return null;
  if (role !== 'MEDICO') return null;

  if (loading) {
    return (
      <HistoriasClinicasDashboardLayout>
        <HistoriasClinicasHeader title="Editar Historia Clínica" backTo="/historias" />
        <section className="min-h-0 flex-1">
          <Card><p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Cargando historia clínica para edición...</p></Card>
        </section>
      </HistoriasClinicasDashboardLayout>
    );
  }

  if (error && !historia) {
    return (
      <HistoriasClinicasDashboardLayout>
        <HistoriasClinicasHeader title="Editar Historia Clínica" backTo="/historias" />
        <section className="min-h-0 flex-1">
          <Card>
            <MessageBanner type="error" message={error} />
            <p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>No se pudo cargar la información de la historia clínica.</p>
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
          <Card><p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>No se encontró la historia clínica solicitada.</p></Card>
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
      />

      {message && <MessageBanner type="success" message={message} />}
      {error && <MessageBanner type="error" message={error} />}

      <section className="w-full">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
  <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--hc-text)' }}>
    Datos generales
  </h2>

  <div className="space-y-3">
    <div className="grid gap-1">
      <label
        className="text-xs font-medium"
        style={{ color: 'var(--on-surface-variant)' }}
      >
        Nombre del usuario
      </label>
      <Input
        value={values.usuarioNombre}
        placeholder="Nombre completo del usuario"
        readOnly
        className="hc-input-readonly"
      />
    </div>

    <div className="grid gap-1">
      <label
        className="text-xs font-medium"
        style={{ color: 'var(--on-surface-variant)' }}
      >
        Identificación
      </label>
      <Input
        value={values.usuarioIdentificacion}
        placeholder="Documento de identificación"
        readOnly
        className="hc-input-readonly"
      />
    </div>

    <div
      className="rounded-lg p-3"
      style={{
        border: '1px solid var(--card-border)',
        backgroundColor: 'var(--card-bg)',
      }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: 'var(--card-text-muted)' }}
      >
        Condición preexistente
      </p>

      <p
        className="mt-1 text-sm font-medium"
        style={{ color: 'var(--on-surface)' }}
      >
        {(() => {
          const conDiagnostico = consultas
            .filter((c) => c.estado === 'ATENDIDA' && c.tieneConsulta && c.diagnostico)
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

          if (conDiagnostico.length === 0) return 'Sin condición preexistente registrada';

          return conDiagnostico[0].diagnostico;
        })()}
      </p>
    </div>
  </div>
</Card>

          <Card>
            <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--hc-text)' }}>Alergias</h2>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={nuevaAlergia}
                  placeholder="Nueva alergia..."
                  onChange={(e) => setNuevaAlergia(e.target.value)}
                />
                <Button type="button" variant="primary" onClick={handleAgregarAlergia}
                  disabled={!nuevaAlergia.trim()}>
                  Agregar
                </Button>
              </div>
              <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                {registrosAlergias.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>Sin registros</p>
                ) : (
                  registrosAlergias.map((r) => (
                    <div key={r.id} className="rounded-lg p-2"
                      style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--on-surface)' }}>{r.descripcion}</p>
                      <p className="text-[11px]" style={{ color: 'var(--card-text-muted)' }}>
                        {new Date(r.fecha_registro).toLocaleDateString()}
                        {r.medico_registro_nombre ? ` — ${r.medico_registro_nombre}` : ''}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--hc-text)' }}>Factores de riesgo</h2>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={nuevoFactorRiesgo}
                  placeholder="Nuevo factor de riesgo..."
                  onChange={(e) => setNuevoFactorRiesgo(e.target.value)}
                />
                <Button type="button" variant="primary" onClick={handleAgregarFactorRiesgo}
                  disabled={!nuevoFactorRiesgo.trim()}>
                  Agregar
                </Button>
              </div>
              <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                {registrosFactores.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>Sin registros</p>
                ) : (
                  registrosFactores.map((r) => (
                    <div key={r.id} className="rounded-lg p-2"
                      style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--on-surface)' }}>{r.descripcion}</p>
                      <p className="text-[11px]" style={{ color: 'var(--card-text-muted)' }}>
                        {new Date(r.fecha_registro).toLocaleDateString()}
                        {r.medico_registro_nombre ? ` — ${r.medico_registro_nombre}` : ''}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--hc-text)' }}>Antecedentes clínicos</h2>
            <AntecedentesClinicosList
              items={antecedentes}
              onCreate={handleCrearAntecedente}
              onUpdate={handleActualizarAntecedente}
            />
          </Card>
        </div>

        <Card className="mt-4">
          <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--hc-text)' }}>Documentos clínicos</h2>
          <DocumentosClinicosList
            key={documentosRefreshKey}
            historiaClinicaId={id!}
            historia={historia}
            medicoNombre={getNombreMedico()}
            showFilters={false}
          />
        </Card>

        <div className="mt-4 rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="danger" onClick={handleCancel}>
              Cancelar
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={requestSaveConfirmation}
            >
              Guardar cambios
            </Button>
          </div>
        </div>
      </section>

      {/* Save confirmation modal */}
      <Modal
        open={confirmationType === 'save'}
        onClose={() => setConfirmationType(null)}
        title="Guardar cambios"
        titleId="save-modal-title"
        descriptionId="save-modal-desc"
        closeable={!isSaving}
        icon={
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/40">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          </div>
        }
      >
        <div className="space-y-4">
          <p id="save-modal-desc" className="text-sm leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
            ¿Está seguro de que desea guardar los cambios realizados en la historia clínica?
          </p>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmationType(null)}
              disabled={isSaving}
            >
              No, revisar de nuevo
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : 'Sí, guardar cambios'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel confirmation modal */}
      <Modal
        open={confirmationType === 'cancel'}
        onClose={() => setConfirmationType(null)}
        title="Cancelar edición"
        titleId="cancel-modal-title"
        descriptionId="cancel-modal-desc"
        icon={
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        }
      >
        <div className="space-y-4">
          <p id="cancel-modal-desc" className="text-sm leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
            ¿Está seguro de que desea salir sin guardar? Los cambios no guardados se perderán.
          </p>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmationType(null)}
            >
              No, continuar editando
            </Button>

            <Button
              type="button"
              variant="danger"
              onClick={() => navigate('/historias', { replace: true })}
            >
              Sí, salir sin guardar
            </Button>
          </div>
        </div>
      </Modal>
    </HistoriasClinicasDashboardLayout>
  );
}
