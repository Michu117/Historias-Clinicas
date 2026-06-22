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
  const { role, permissions, isAuthorized } = useHistoriasClinicasAuth();

  const [historia, setHistoria] = useState<HistoriaClinica | null>(null);
  const [values, setValues] = useState<HistoriaClinicaFormValues>(initialFormValues);

  const [antecedentes, setAntecedentes] = useState<AntecedenteClinico[]>([]);
  const [documentosRefreshKey, setDocumentosRefreshKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!isAuthorized) {
      navigate('/seguridad/login', { replace: true });
      return;
    }
    if (!role || role !== 'MEDICO' || !permissions?.canEditHistoria) {
      setAccessDenied(true);
      return;
    }
  }, [role, permissions, isAuthorized, navigate]);

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

      const hc = await historiasClinicasService.obtenerHistoriaClinicaPorId(id);
      setHistoria(hc);
      setValues({
        usuarioNombre: hc.usuario?.nombre ?? '',
        usuarioIdentificacion: hc.usuario?.identificacion ?? '',
        alergia: hc.alergia ?? '',
        condicionPreexistente: hc.condicionPreexistente ?? '',
        factorRiesgo: hc.factorRiesgo ?? '',
      });

      const [ants] = await Promise.all([
        historiasClinicasService.listarAntecedentesPorHistoria(id),
      ]);
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

    if (!values.alergia.trim()) { setMessage('La alergia es obligatoria.'); return; }
    if (!values.condicionPreexistente.trim()) { setMessage('La condición preexistente es obligatoria.'); return; }
    if (!values.factorRiesgo.trim()) { setMessage('El factor de riesgo es obligatorio.'); return; }

    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      const hcActualizada = await historiasClinicasService.actualizarHistoriaClinica(id, {
        alergia: values.alergia,
        condicionPreexistente: values.condicionPreexistente,
        factorRiesgo: values.factorRiesgo,
      });
      setHistoria(hcActualizada);
      setMessage('Historia clínica actualizada correctamente.');
    } catch (err: any) {
      console.error('Error al actualizar:', err);
      setError(err?.message ?? 'No se pudo actualizar. Revisa la respuesta del API.');
    } finally {
      setIsSubmitting(false);
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

  if (accessDenied) {
    return (
      <HistoriasClinicasDashboardLayout>
        <HistoriasClinicasHeader title="Editar Historia Clínica" backTo="/historias" />
        <section className="flex min-h-0 items-center justify-center">
          <Card className="max-w-md text-center">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--hc-text)' }}>Acceso denegado</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--on-surface-variant)' }}>
              No tienes permisos para editar historias clínicas.
            </p>
          </Card>
        </section>
      </HistoriasClinicasDashboardLayout>
    );
  }

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
                  <Input value={values.usuarioNombre} placeholder="Nombre completo del usuario"
                    onChange={(e) => handleChange('usuarioNombre', e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium" style={{ color: 'var(--on-surface-variant)' }}>Identificación</label>
                  <Input value={values.usuarioIdentificacion} placeholder="Documento de identificación"
                    onChange={(e) => handleChange('usuarioIdentificacion', e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium" style={{ color: 'var(--on-surface-variant)' }}>Alergias</label>
                  <Input value={values.alergia} placeholder="Alergias reportadas"
                    onChange={(e) => handleChange('alergia', e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium" style={{ color: 'var(--on-surface-variant)' }}>Condición preexistente</label>
                  <Input value={values.condicionPreexistente} placeholder="Condiciones preexistentes"
                    onChange={(e) => handleChange('condicionPreexistente', e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium" style={{ color: 'var(--on-surface-variant)' }}>Factor de riesgo</label>
                  <Input value={values.factorRiesgo} placeholder="Factores de riesgo identificados"
                    onChange={(e) => handleChange('factorRiesgo', e.target.value)} />
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

          {/* ── Antecedentes clínicos ── */}
          <Card>
            <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--hc-text)' }}>Antecedentes clínicos</h2>
            <AntecedentesClinicosList
              items={antecedentes}
              onCreate={handleCrearAntecedente}
              onUpdate={handleActualizarAntecedente}
            />
          </Card>
        </div>

        {/* ── Documentos clínicos ── */}
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
      </Modal>
    </HistoriasClinicasDashboardLayout>
  );
}
