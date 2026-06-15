import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '../../../ui/components/Button';
import { Card } from '../../../ui/components/Card';
import { Input } from '../../../ui/components/Input';
import { HistoriasClinicasDashboardLayout } from '../components/HistoriasClinicasDashboardLayout';
import { HistoriasClinicasHeader } from '../components/HistoriasClinicasHeader';
import { MessageBanner } from '../components/MessageBanner';
import { historiasClinicasService } from '../services/historiasClinicasService';

import type { HistoriaClinica, HistoriaClinicaFormValues } from '../types/historiaClinica.types';
import type { AntecedenteClinico, TipoAntecedenteClinico } from '../types/antecedenteClinico.types';
import type { CasoClinico, EstadoCasoClinico, PrioridadCasoClinico } from '../types/casoClinico.types';

const initialFormValues: HistoriaClinicaFormValues = {
  usuarioNombre: '',
  usuarioIdentificacion: '',
  alergia: '',
  condicionPreexistente: '',
  factorRiesgo: '',
};

const TIPO_ANTECEDENTE_OPTIONS: { value: TipoAntecedenteClinico | ''; label: string }[] = [
  { value: '', label: 'Seleccione...' },
  { value: 'HEREDOFAMILIARES', label: 'Heredofamiliares' },
  { value: 'PERSONALES_NO_PATOLOGICOS', label: 'Personales no patológicos' },
  { value: 'PERSONALES_PATOLOGICOS', label: 'Personales patológicos' },
  { value: 'GINECO_OBSTETRICOS', label: 'Gineco obstétricos' },
];

const ESTADO_CASO_OPTIONS: { value: EstadoCasoClinico; label: string }[] = [
  { value: 'ABIERTO', label: 'Abierto' },
  { value: 'EN_SEGUIMIENTO', label: 'En seguimiento' },
  { value: 'CERRADO', label: 'Cerrado' },
];

const PRIORIDAD_OPTIONS: { value: PrioridadCasoClinico; label: string }[] = [
  { value: 'ALTA', label: 'Alta' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'BAJA', label: 'Baja' },
];

export default function EditarHistoriaClinicaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [historia, setHistoria] = useState<HistoriaClinica | null>(null);
  const [values, setValues] = useState<HistoriaClinicaFormValues>(initialFormValues);

  const [antecedenteExistente, setAntecedenteExistente] = useState<AntecedenteClinico | null>(null);
  const [antTipo, setAntTipo] = useState<TipoAntecedenteClinico | ''>('');
  const [antDescripcion, setAntDescripcion] = useState('');
  const [antFecha, setAntFecha] = useState('');

  const [casoExistente, setCasoExistente] = useState<CasoClinico | null>(null);
  const [casoFechaApertura, setCasoFechaApertura] = useState('');
  const [casoFechaCierre, setCasoFechaCierre] = useState('');
  const [casoEstado, setCasoEstado] = useState<EstadoCasoClinico>('ABIERTO');
  const [casoPrioridad, setCasoPrioridad] = useState<PrioridadCasoClinico>('MEDIA');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
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

        const [ants, casos] = await Promise.all([
          historiasClinicasService.listarAntecedentesPorHistoria(id),
          historiasClinicasService.listarCasosPorHistoria(id),
        ]);

        const ant = ants[0] ?? null;
        setAntecedenteExistente(ant);
        setAntTipo((ant?.tipo as TipoAntecedenteClinico) ?? '');
        setAntDescripcion(ant?.descripcion ?? '');
        setAntFecha(ant?.fecha ?? '');

        const cs = casos[0] ?? null;
        setCasoExistente(cs);
        setCasoFechaApertura(cs?.fechaApertura ?? '');
        setCasoFechaCierre(cs?.fechaCierre ?? '');
        setCasoEstado((cs?.estado as EstadoCasoClinico) ?? 'ABIERTO');
        setCasoPrioridad((cs?.prioridad as PrioridadCasoClinico) ?? 'MEDIA');
      } catch (err) {
        console.error('Error al cargar:', err);
        setError('No se pudo cargar la información para edición.');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

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
      // 1. Actualizar historia clínica
      const hcActualizada = await historiasClinicasService.actualizarHistoriaClinica(id, {
        alergia: values.alergia,
        condicionPreexistente: values.condicionPreexistente,
        factorRiesgo: values.factorRiesgo,
      });
      setHistoria(hcActualizada);

      // 2. Antecedente — actualizar o crear
      const hayAntecedente = antTipo && antDescripcion.trim() && antFecha;
      if (antecedenteExistente && hayAntecedente) {
        await historiasClinicasService.actualizarAntecedente(antecedenteExistente.id, {
          tipo: antTipo,
          descripcion: antDescripcion.trim(),
          fecha: antFecha,
        });
      } else if (!antecedenteExistente && hayAntecedente) {
        const creado = await historiasClinicasService.crearAntecedenteClinico({
          historiaClinicaId: id,
          tipo: antTipo,
          descripcion: antDescripcion.trim(),
          fecha: antFecha,
        });
        setAntecedenteExistente(creado);
      }

      // 3. Caso — actualizar o crear
      if (casoExistente && casoFechaApertura) {
        await historiasClinicasService.actualizarCaso(casoExistente.id, {
          fechaApertura: casoFechaApertura,
          fechaCierre: casoFechaCierre || null,
          estado: casoEstado,
          prioridad: casoPrioridad,
        });
      } else if (!casoExistente && casoFechaApertura) {
        const creado = await historiasClinicasService.crearCasoClinico({
          historiaClinicaId: id,
          fechaApertura: casoFechaApertura,
          fechaCierre: casoFechaCierre || null,
          estado: casoEstado,
          prioridad: casoPrioridad,
        });
        setCasoExistente(creado);
      }

      setMessage('Historia clínica actualizada correctamente.');
    } catch (err: any) {
      console.error('Error al actualizar:', err);
      setError(err?.message ?? 'No se pudo actualizar. Revisa la respuesta del API.');
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
          <Card><p className="text-sm text-slate-600">Cargando historia clínica para edición...</p></Card>
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
          <Card><p className="text-sm text-slate-500">No se encontró la historia clínica solicitada.</p></Card>
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
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* ── Datos generales ── */}
            <Card>
              <h2 className="mb-3 text-base font-semibold text-slate-900">Datos generales</h2>
              <div className="space-y-3">
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-700">Nombre del usuario</label>
                  <Input value={values.usuarioNombre} placeholder="Nombre completo del usuario"
                    onChange={(e) => handleChange('usuarioNombre', e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-700">Identificación</label>
                  <Input value={values.usuarioIdentificacion} placeholder="Documento de identificación"
                    onChange={(e) => handleChange('usuarioIdentificacion', e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-700">Alergias</label>
                  <Input value={values.alergia} placeholder="Alergias reportadas"
                    onChange={(e) => handleChange('alergia', e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-700">Condición preexistente</label>
                  <Input value={values.condicionPreexistente} placeholder="Condiciones preexistentes"
                    onChange={(e) => handleChange('condicionPreexistente', e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-700">Factor de riesgo</label>
                  <Input value={values.factorRiesgo} placeholder="Factores de riesgo identificados"
                    onChange={(e) => handleChange('factorRiesgo', e.target.value)} />
                </div>
              </div>
            </Card>

            {/* ── Antecedentes clínicos ── */}
            <Card>
              <h2 className="mb-3 text-base font-semibold text-slate-900">Antecedentes clínicos</h2>
              <div className="space-y-3">
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-700">Tipo de antecedente</label>
                  <select value={antTipo}
                    onChange={(e) => setAntTipo(e.target.value as TipoAntecedenteClinico)}
                    className="block w-full rounded-global border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary">
                    {TIPO_ANTECEDENTE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-700">Descripción</label>
                  <textarea value={antDescripcion}
                    onChange={(e) => setAntDescripcion(e.target.value)} rows={3}
                    className="block w-full rounded-global border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary"
                    placeholder="Describa el antecedente" />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-700">Fecha</label>
                  <input type="date" value={antFecha}
                    onChange={(e) => setAntFecha(e.target.value)}
                    className="block w-full rounded-global border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary" />
                </div>
              </div>
            </Card>
          </div>

          {/* ── Casos clínicos ── */}
          <Card className="mt-4">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Casos clínicos</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-700">Fecha de apertura</label>
                  <input type="date" value={casoFechaApertura}
                    onChange={(e) => setCasoFechaApertura(e.target.value)}
                    className="block w-full rounded-global border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary" />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-700">
                    Fecha de cierre <span className="text-slate-400">(opcional)</span>
                  </label>
                  <input type="date" value={casoFechaCierre}
                    onChange={(e) => setCasoFechaCierre(e.target.value)}
                    className="block w-full rounded-global border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-700">Estado del caso</label>
                  <select value={casoEstado}
                    onChange={(e) => {
                      const val = e.target.value as EstadoCasoClinico;
                      setCasoEstado(val);
                      if (val !== 'CERRADO') setCasoFechaCierre('');
                    }}
                    className="block w-full rounded-global border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary">
                    {ESTADO_CASO_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-700">Prioridad</label>
                  <select value={casoPrioridad}
                    onChange={(e) => setCasoPrioridad(e.target.value as PrioridadCasoClinico)}
                    className="block w-full rounded-global border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary">
                    {PRIORIDAD_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* ── Botones ── */}
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="danger" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </section>
    </HistoriasClinicasDashboardLayout>
  );
}