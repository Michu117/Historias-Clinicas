import { Button } from '../../../ui/components/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../ui/components/Table';
import type { HistoriaClinica } from '../types/historiaClinica.types';

type HistoriasClinicasTableProps = {
  historias: HistoriaClinica[];
  startIndex?: number;
  onView: (historia: HistoriaClinica) => void;
  onEdit: (historia: HistoriaClinica) => void;
  onClose?: (historia: HistoriaClinica) => void;
  canEdit?: boolean;
};

export const HistoriasClinicasTable = ({
  historias,
  startIndex = 0,
  onView,
  onEdit,
  onClose,
  canEdit = false,
}: HistoriasClinicasTableProps) => {
  if (historias.length === 0) {
    return (
      <p className="p-6 text-sm" style={{ color: 'var(--card-text-muted)' }}>
        No hay historias clínicas registradas.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table className="table-fixed">
        <colgroup>
          <col className="w-[6%]" />
          <col className="w-[18%]" />
          <col className="w-[14%]" />
          <col className="w-[18%]" />
          <col className="w-[18%]" />
          <col className="w-[18%]" />
          <col className="w-[8%]" />
        </colgroup>

        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>Identificación</TableHead>
            <TableHead>Alergias</TableHead>
            <TableHead>Condición</TableHead>
            <TableHead>Riesgo</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {historias.map((historia, index) => {
            const estadoLabel =
              historia.estado === 'ACTIVA' ? 'Activa' : 'Cerrada';

            const isActiva = historia.estado === 'ACTIVA';
            const codigoVisual = `H${startIndex + index + 1}`;

            const nombrePaciente =
              historia.usuario?.nombre || 'Sin registrar';

            const identificacion =
              historia.usuario?.identificacion || 'Sin registrar';

            const iniciales =
              nombrePaciente !== 'Sin registrar'
                ? nombrePaciente
                    .split(' ')
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
                : 'HC';

            return (
              <TableRow
                key={historia.id}
                className="align-middle hover:bg-slate-50"
              >
                <TableCell className="px-4 py-3 align-middle">
                  <span className="inline-flex rounded-full bg-hc-primary/10 px-3 py-1 text-sm font-bold text-hc-primary">
                    {codigoVisual}
                  </span>
                </TableCell>

                <TableCell className="px-4 py-3 align-middle">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ backgroundColor: 'var(--surface-container-low)', color: 'var(--on-surface-variant)' }}>
                      {iniciales}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold" style={{ color: 'var(--hc-text)' }}>
                        {nombrePaciente}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--card-text-muted)' }}>
                        Paciente registrado
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3 align-middle">
                  <p className="truncate text-sm font-medium" style={{ color: 'var(--on-surface-variant)' }}>
                    {identificacion}
                  </p>
                </TableCell>

                <TableCell className="px-4 py-3 align-middle">
                  <p className="truncate text-sm" style={{ color: 'var(--on-surface-variant)' }}>
                    {historia.alergia || 'Sin alergias registradas.'}
                  </p>
                </TableCell>

                <TableCell className="px-4 py-3 align-middle">
                  <p className="truncate text-sm" style={{ color: 'var(--on-surface-variant)' }}>
                    {historia.condicionPreexistente ||
                      'Sin condición preexistente registrada.'}
                  </p>
                </TableCell>

                <TableCell className="px-4 py-3 align-middle">
                  <p className="truncate text-sm" style={{ color: 'var(--on-surface-variant)' }}>
                    {historia.factorRiesgo ||
                      'Sin factor de riesgo registrado.'}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3 text-center align-middle">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onView(historia)}
                  >
                    Ver
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
