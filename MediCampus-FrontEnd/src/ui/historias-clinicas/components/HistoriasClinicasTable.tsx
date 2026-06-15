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
};

export const HistoriasClinicasTable = ({
  historias,
  startIndex = 0,
  onView,
  onEdit,
  onClose,
}: HistoriasClinicasTableProps) => {
  if (historias.length === 0) {
    return (
      <p className="p-6 text-sm text-slate-500">
        No hay historias clínicas registradas.
      </p>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <Table className="h-full table-fixed">
        <colgroup>
          <col className="w-[6%]" />
          <col className="w-[17%]" />
          <col className="w-[12%]" />
          <col className="w-[16%]" />
          <col className="w-[16%]" />
          <col className="w-[16%]" />
          <col className="w-[8%]" />
          <col className="w-[9%]" />
        </colgroup>

        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>Identificación</TableHead>
            <TableHead>Alergias</TableHead>
            <TableHead>Condición</TableHead>
            <TableHead>Riesgo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
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
                className="h-[118px] align-middle hover:bg-slate-50"
              >
                <TableCell className="align-middle">
                  <span className="inline-flex rounded-full bg-hc-primary/10 px-3 py-1 text-sm font-bold text-hc-primary">
                    {codigoVisual}
                  </span>
                </TableCell>

                <TableCell className="align-middle">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                      {iniciales}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-slate-900">
                        {nombrePaciente}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Paciente registrado
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="align-middle">
                  <p className="truncate text-sm font-medium text-slate-700">
                    {identificacion}
                  </p>
                </TableCell>

                <TableCell className="align-middle">
                  <p className="truncate text-sm text-slate-700">
                    {historia.alergia || 'Sin alergias registradas.'}
                  </p>
                </TableCell>

                <TableCell className="align-middle">
                  <p className="truncate text-sm text-slate-700">
                    {historia.condicionPreexistente ||
                      'Sin condición preexistente registrada.'}
                  </p>
                </TableCell>

                <TableCell className="align-middle">
                  <p className="truncate text-sm text-slate-700">
                    {historia.factorRiesgo ||
                      'Sin factor de riesgo registrado.'}
                  </p>
                </TableCell>

                <TableCell className="align-middle">
                  <span
                    className={
                      isActiva
                        ? 'inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700'
                        : 'inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600'
                    }
                  >
                    {estadoLabel}
                  </span>
                </TableCell>

                <TableCell className="align-middle">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => onView(historia)}
                    >
                      Ver
                    </Button>

                    <Button
                      type="button"
                      variant="tertiary"
                      size="sm"
                      onClick={() => onEdit(historia)}
                    >
                      Editar
                    </Button>

                    {onClose && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => onClose(historia)}
                      >
                        Cerrar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};