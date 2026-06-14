import { Card, CardTitle } from '../../../ui/components/Card';
import type { HistoriaClinica } from '../types/historiaClinica.types';

interface HistoriaClinicaDetailProps {
  historia: HistoriaClinica | null;
}

export const HistoriaClinicaDetail = ({ historia }: HistoriaClinicaDetailProps) => {
  if (!historia) {
    return (
      <Card>
        <CardTitle>Detalle de historia clínica</CardTitle>
        <p className="text-sm text-slate-500">Seleccione una historia para ver la información.</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>Historia {historia.id}</CardTitle>
      <dl className="mt-4 grid gap-3 text-sm text-slate-700">
        <div>
          <dt className="font-medium text-slate-900">Usuario</dt>
          <dd>{historia.usuario.nombre}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Identificación</dt>
          <dd>{historia.usuario.identificacion}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Estado</dt>
          <dd>{historia.estado === 'ACTIVA' ? 'Activa' : 'Cerrada'}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Alergias</dt>
          <dd>{historia.alergia}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Condición preexistente</dt>
          <dd>{historia.condicionPreexistente}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Factor de riesgo</dt>
          <dd>{historia.factorRiesgo}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Antecedentes</dt>
          <dd>{historia.antecedentes}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Casos</dt>
          <dd>{historia.casos}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Documentos</dt>
          <dd>{historia.documentos}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Consultas</dt>
          <dd>{historia.consultas}</dd>
        </div>
      </dl>
    </Card>
  );
};
