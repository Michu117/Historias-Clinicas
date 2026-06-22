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
        <p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>Seleccione una historia para ver la información.</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>Historia {historia.id}</CardTitle>
      <dl className="mt-4 grid gap-3 text-sm" style={{ color: 'var(--on-surface-variant)' }}>
        <div>
          <dt className="font-medium" style={{ color: 'var(--hc-text)' }}>Usuario</dt>
          <dd>{historia.usuario.nombre}</dd>
        </div>
        <div>
          <dt className="font-medium" style={{ color: 'var(--hc-text)' }}>Identificación</dt>
          <dd>{historia.usuario.identificacion}</dd>
        </div>
        <div>
          <dt className="font-medium" style={{ color: 'var(--hc-text)' }}>Estado</dt>
          <dd>{historia.estado === 'ACTIVA' ? 'Activa' : 'Cerrada'}</dd>
        </div>
        <div>
          <dt className="font-medium" style={{ color: 'var(--hc-text)' }}>Alergias</dt>
          <dd>{historia.alergia}</dd>
        </div>
        <div>
          <dt className="font-medium" style={{ color: 'var(--hc-text)' }}>Condición preexistente</dt>
          <dd>{historia.condicionPreexistente}</dd>
        </div>
        <div>
          <dt className="font-medium" style={{ color: 'var(--hc-text)' }}>Factor de riesgo</dt>
          <dd>{historia.factorRiesgo}</dd>
        </div>

      </dl>
    </Card>
  );
};
