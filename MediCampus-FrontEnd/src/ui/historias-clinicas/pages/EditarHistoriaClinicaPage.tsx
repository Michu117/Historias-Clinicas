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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      setMessage('No se recibió el ID de la historia clínica.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      const hcActualizada = await historiasClinicasService.actualizarHistoriaClinica(id, {});
      setHistoria(hcActualizada);
      setMessage('Historia clínica actualizada correctamente.');
    } catch (err: any) {
      console.error('Error al actualizar:', err);
      setError(err?.message ?? 'No se pudo actualizar. Revisa la respuesta del API.');
    } finally {
      setIsSubmitting(false);
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
    setShowCancelModal(true);
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
          <form onSubmit={handleSubmit}>
            <Card>
              <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--hc-text)' }}>Datos generales</h2>
              <div className="space-y-3">
                <div className="grid gap-1">
                  <label className="text-xs font-medium" style={{ color: 'var(--on-surface-variant)' }}>Nombre del usuario</label>
                  <Input value={values.usuarioNombre} placeholder="Nombre completo del usuario" readOnly
                    className="bg-slate-100 text-slate-700 cursor-not-allowed" />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium" style={{ color: 'var(--on-surface-variant)' }}>Identificación</label>
                  <Input value={values.usuarioIdentificacion} placeholder="Documento de identificación" readOnly
                    className="bg-slate-100 text-slate-700 cursor-not-allowed" />
                </div>
                <div className="rounded-lg p-3" style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--card-text-muted)' }}>Condición preexistente</p>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--on-surface)' }}>
                    {(() => {
                      const atendidas = consultas.filter(c => c.estado === 'ATENDIDA');
                      if (atendidas.length === 0) return '—';
                      const ultima = atendidas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];
                      return ultima.diagnostico ?? ultima.observaciones ?? ultima.motivo ?? 'Sin resumen disponible';
                    })()}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button type="button" variant="danger" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </Card>
          </form>

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
      </section>

      <Modal open={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancelar edición">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>
            ¿Está seguro de que desea salir sin guardar? Los cambios no guardados se perderán.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowCancelModal(false)}>
              No, continuar editando
            </Button>
            <Button type="button" variant="danger" onClick={() => navigate('/historias')}>
              Sí, salir sin guardar
            </Button>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
                <Button type="button" variant="danger" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
      </Modal>
    </HistoriasClinicasDashboardLayout>
  );
}
