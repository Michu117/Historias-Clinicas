import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../../ui/components/Button';
import { Card } from '../../../ui/components/Card';
import { Input } from '../../../ui/components/Input';
import { HistoriasClinicasDashboardLayout } from '../components/HistoriasClinicasDashboardLayout';
import { HistoriasClinicasHeader } from '../components/HistoriasClinicasHeader';
import { MessageBanner } from '../components/MessageBanner';
import { historiasClinicasService } from '../services/historiasClinicasService';

import type { HistoriaClinicaFormValues } from '../types/historiaClinica.types';
import type { TipoAntecedenteClinico } from '../types/antecedenteClinico.types';
import type { EstadoCasoClinico, PrioridadCasoClinico } from '../types/casoClinico.types';

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

export const NuevaHistoriaClinicaPage = () => {
  const navigate = useNavigate();

  // ── Datos generales ──
  const [values, setValues] = useState<HistoriaClinicaFormValues>(initialFormValues);

  const handleChange = (field: keyof HistoriaClinicaFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  // ── Antecedente ──
  const [antTipo, setAntTipo] = useState<TipoAntecedenteClinico | ''>('');
  const [antDescripcion, setAntDescripcion] = useState('');
  const [antFecha, setAntFecha] = useState('');

  // ── Caso ──
  const [casoFechaApertura, setCasoFechaApertura] = useState('');
  const [casoFechaCierre, setCasoFechaCierre] = useState('');
  const [casoEstado, setCasoEstado] = useState<EstadoCasoClinico>('ABIERTO');
  const [casoPrioridad, setCasoPrioridad] = useState<PrioridadCasoClinico>('MEDIA');

  // ── Envío ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      // 1. Crear historia clínica
      const historiaCreada = await historiasClinicasService.crearHistoriaClinica(values);

      const historiaId = historiaCreada.id;

      // 2. Crear antecedente si se llenaron campos
      if (antTipo && antDescripcion.trim() && antFecha) {
        await historiasClinicasService.crearAntecedenteClinico({
          historiaClinicaId: historiaId,
          tipo: antTipo,
          descripcion: antDescripcion.trim(),
          fecha: antFecha,
        });
      }

      // 3. Crear caso si se llenó la fecha de apertura
      if (casoFechaApertura) {
        await historiasClinicasService.crearCasoClinico({
          historiaClinicaId: historiaId,
          fechaApertura: casoFechaApertura,
          fechaCierre: casoFechaCierre || null,
          estado: casoEstado,
          prioridad: casoPrioridad,
        });
      }

      navigate('/historias');
    } catch (err: any) {
      console.error('Error al crear:', err);
      setError(err?.message ?? 'No se pudo completar la operación. Revisa los datos.');
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
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </section>
    </HistoriasClinicasDashboardLayout>
  );
};

export default NuevaHistoriaClinicaPage;
