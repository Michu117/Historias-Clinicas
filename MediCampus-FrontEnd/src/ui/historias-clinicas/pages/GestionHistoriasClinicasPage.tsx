import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card } from '../../../ui/components/Card';
import { HistoriasClinicasDashboardLayout } from '../components/HistoriasClinicasDashboardLayout';
import { HistoriasClinicasHeader } from '../components/HistoriasClinicasHeader';
import { HistoriasClinicasFiltersPanel } from '../components/HistoriasClinicasFiltersPanel';
import { HistoriasClinicasPagination } from '../components/HistoriasClinicasPagination';
import { HistoriasClinicasStatsCards } from '../components/HistoriasClinicasStatsCards';
import { HistoriasClinicasTable } from '../components/HistoriasClinicasTable';
import { MessageBanner } from '../components/MessageBanner';
import { ConfirmarCierreHistoriaModal } from '../components/ConfirmarCierreHistoriaModal';
import { useHistoriasClinicas } from '../hooks/useHistoriasClinicas';
import { useHistoriasClinicasAuth } from '../hooks/useHistoriasClinicasAuth';
import { historiasClinicasService } from '../services/historiasClinicasService';

import type { HistoriaClinica } from '../types/historiaClinica.types';
import type { AntecedenteClinico } from '../types/antecedenteClinico.types';
import type { DocumentoClinico } from '../types/documentoClinico.types';
import type { ConsultaClinico } from '../types/consultaClinico.types';

const PAGE_SIZE = 3;

const AccessDenied = () => (
  <main className="flex min-h-screen items-center justify-center px-6" style={{ backgroundColor: 'var(--hc-bg)' }}>
    <Card className="max-w-md text-center">
      <h1 className="text-xl font-semibold" style={{ color: 'var(--hc-text)' }}>
        Acceso denegado
      </h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--on-surface-variant)' }}>
        No tienes permisos para acceder a historias clínicas.
      </p>
    </Card>
  </main>
);

const MedicoContent = () => {
  const navigate = useNavigate();
  const [actionMessage, setActionMessage] = useState('');
  const [page, setPage] = useState(1);
  const [closeTarget, setCloseTarget] = useState<HistoriaClinica | null>(null);
  const [todosLosAntecedentes, setTodosLosAntecedentes] = useState<AntecedenteClinico[]>([]);
  const [todosLosDocumentos, setTodosLosDocumentos] = useState<DocumentoClinico[]>([]);
  const [todosLosCasos, setTodosLosCasos] = useState<ConsultaClinico[]>([]);

  const {
    historias,
    rawHistorias,
    statusOptions,
    statusValue,
    setSearchValue,
    setStatusValue,
    searchValue,
    loading,
    error,
  } = useHistoriasClinicas();

  const totalPages = Math.max(1, Math.ceil(historias.length / PAGE_SIZE));

  const paginatedHistorias = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return historias.slice(start, start + PAGE_SIZE);
  }, [historias, page]);

  const startIndex = (page - 1) * PAGE_SIZE;

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  const handleView = (historia: HistoriaClinica) => {
    navigate(`/historias/${historia.id}`);
  };

  const handleEdit = (historia: HistoriaClinica) => {
    navigate(`/historias/${historia.id}/editar`);
  };

  const handleClose = (historia: HistoriaClinica) => {
    setCloseTarget(historia);
  };

  const handleConfirmCierre = () => {
    setActionMessage(
      'El cierre de la historia clínica se conectará al backend autenticado en una fase posterior.'
    );
    setCloseTarget(null);
  };

  const handleCancelCierre = () => {
    setCloseTarget(null);
  };

  const handleStatusChange = (value: string) => {
    setStatusValue(value as typeof statusValue);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchValue('');
    setStatusValue('todas');
    setPage(1);
  };

  useEffect(() => {
    if (!rawHistorias.length) {
      setTodosLosAntecedentes([]);
      setTodosLosDocumentos([]);
      setTodosLosCasos([]);
      return;
    }
    const cargarActividadRelacionada = async () => {
      const [antecedentes, documentos, casosPorHistoria] = await Promise.all([
        historiasClinicasService.listarTodosLosAntecedentes(),
        historiasClinicasService.listarTodosLosDocumentos(),
        Promise.all(
          rawHistorias.map((h) =>
            historiasClinicasService
              .listarCasosClinicosPorHistoria(h.id)
              .then((casos) =>
                casos.map((c) => ({ ...c, historiaClinicaId: h.id }))
              )
          )
        ),
      ])
      setTodosLosAntecedentes(antecedentes)
      setTodosLosDocumentos(documentos)
      setTodosLosCasos(casosPorHistoria.flat())
    }
    cargarActividadRelacionada().catch(() => {
      setTodosLosAntecedentes([]);
      setTodosLosDocumentos([]);
      setTodosLosCasos([]);
    });
  }, [rawHistorias]);

  const esFechaDeHoy = (fecha?: string) => {
    if (!fecha) return false;
    const f = new Date(fecha);
    const h = new Date();
    if (Number.isNaN(f.getTime())) return false;
    return (
      f.getFullYear() === h.getFullYear() &&
      f.getMonth() === h.getMonth() &&
      f.getDate() === h.getDate()
    );
  };

  const obtenerFechaHistoria = (historia: HistoriaClinica) =>
    historia.ultimaActualizacion ??
    (historia as any).updated_at ??
    (historia as any).updatedAt ??
    (historia as any).fechaActualizacion ??
    historia.fechaApertura ??
    (historia as any).created_at ??
    (historia as any).createdAt

  const obtenerFechasRelacionadas = (item: any): string[] =>
    [
      item?.ultimaActualizacion,
      item?.updated_at,
      item?.updatedAt,
      item?.fechaActualizacion,
      item?.fechaCreacion,
      item?.fechaApertura,
      item?.created_at,
      item?.createdAt,
      item?.creadoEn,
      item?.actualizadoEn,
      item?.fecha,
    ].filter(Boolean)

  const obtenerHistoriaIdRelacionada = (item: any): string =>
    String(
      item?.historiaClinicaId ??
        item?.historia_clinica_id ??
        item?.historia_clinica ??
        item?.historiaClinica ??
        ''
    )

  const historiaTieneActividadHoy = (historia: HistoriaClinica) => {
    const historiaId = String(historia.id)

    if (esFechaDeHoy(obtenerFechaHistoria(historia))) return true

    const actividadAntecedentes = todosLosAntecedentes
      .filter((a) => obtenerHistoriaIdRelacionada(a) === historiaId)
      .some((a) => obtenerFechasRelacionadas(a).some(esFechaDeHoy))

    if (actividadAntecedentes) return true

    const actividadDocumentos = todosLosDocumentos
      .filter((d) => obtenerHistoriaIdRelacionada(d) === historiaId)
      .some((d) => obtenerFechasRelacionadas(d).some(esFechaDeHoy))

    if (actividadDocumentos) return true

    const actividadCasos = todosLosCasos
      .filter((c) => String(c.historiaClinicaId ?? '') === historiaId)
      .some((c) => obtenerFechasRelacionadas(c).some(esFechaDeHoy))

    return actividadCasos
  }

  const historiasActualizadasHoy = rawHistorias.filter(historiaTieneActividadHoy).length

  const normalizarEstadoCaso = (estado?: string) =>
    String(estado ?? '')
      .toUpperCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');

  const esCasoCerrado = (estado?: string) =>
    ['ATENDIDA', 'CANCELADA', 'NO_ASISTIDA'].includes(
      normalizarEstadoCaso(estado)
    );

  const casosCerrados = todosLosCasos.filter((caso) =>
    esCasoCerrado(caso.estado)
  ).length;

  const statCards = [
    {
      label: 'Historias registradas',
      value: rawHistorias.length,
      badge: 'Total',
      icon: '▣',
      iconClass: 'bg-sky-100 text-sky-700',
      badgeClass: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'Historias activas',
      value: rawHistorias.length,
      badge: 'Activas',
      icon: '✓',
      iconClass: 'bg-emerald-100 text-emerald-700',
      badgeClass: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Casos cerrados',
      value: casosCerrados,
      badge: 'Cerrados',
      icon: '▤',
      iconClass: 'bg-indigo-100 text-indigo-700',
      badgeClass: 'bg-indigo-50 text-indigo-700',
    },
    {
      label: 'Actualizadas hoy',
      value: historiasActualizadasHoy,
      badge: 'Hoy',
      icon: '◷',
      iconClass: 'bg-rose-100 text-rose-700',
      badgeClass: 'bg-rose-50 text-rose-700',
    },
  ];

  return (
    <HistoriasClinicasDashboardLayout>
      <HistoriasClinicasHeader
        title="Gestión de Historias Clínicas"
        subtitle="Administración de historias clínicas de usuarios atendidos por Bienestar Universitario."
      />

      <HistoriasClinicasStatsCards items={statCards} />

      <HistoriasClinicasFiltersPanel
        searchValue={searchValue}
        statusValue={statusValue}
        statusOptions={statusOptions}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onClearFilters={handleClearFilters}
      />

      {actionMessage && <MessageBanner type="info" message={actionMessage} />}

      <ConfirmarCierreHistoriaModal
        isOpen={closeTarget !== null}
        historia={closeTarget}
        onConfirm={handleConfirmCierre}
        onCancel={handleCancelCierre}
      />

      <section className="min-h-0 flex-1">
        {loading && (
          <Card>
            <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>
              Cargando historias clínicas...
            </p>
          </Card>
        )}

        {error && (
          <Card>
            <p className="text-sm font-medium text-rose-600">
              {error}
            </p>
          </Card>
        )}

        {!loading && !error && rawHistorias.length === 0 && (
          <Card>
            <p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>
              No hay historias clínicas registradas.
            </p>
          </Card>
        )}

        {!loading &&
          !error &&
          rawHistorias.length > 0 &&
          historias.length === 0 && (
            <Card>
              <p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>
                No se encontraron resultados con los filtros actuales.
              </p>
            </Card>
          )}

        {!loading && !error && historias.length > 0 && (
          <div className="w-full overflow-hidden rounded-xl shadow-sm"
            style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
            <div className="w-full overflow-x-auto">
              <HistoriasClinicasTable
                historias={paginatedHistorias}
                startIndex={startIndex}
                onView={handleView}
                onEdit={handleEdit}
                onClose={handleClose}
                canEdit={true}
              />
            </div>

            <HistoriasClinicasPagination
              page={page}
              totalPages={totalPages}
              totalItems={historias.length}
              pageSize={PAGE_SIZE}
              currentItems={paginatedHistorias.length}
              onPageChange={setPage}
            />
          </div>
        )}
      </section>
    </HistoriasClinicasDashboardLayout>
  );
};

export const GestionHistoriasClinicasPage = () => {
  const navigate = useNavigate();
  const { isAuthorized, role, permissions } = useHistoriasClinicasAuth();

  useEffect(() => {
    if (!isAuthorized) {
      navigate('/seguridad/login', { replace: true });
      return;
    }
    if (role === 'PACIENTE') {
      navigate('/historias/mi-historia', { replace: true });
      return;
    }
    if (role === 'ADMINISTRADOR' || permissions?.isAdminBlocked) {
      navigate('/home', { replace: true });
      return;
    }
    if (role !== 'MEDICO') {
      navigate('/home', { replace: true });
      return;
    }
  }, [isAuthorized, role, permissions, navigate]);

  if (!isAuthorized) return null;
  if (role !== 'MEDICO') return null;

  return <MedicoContent />;
};

export default GestionHistoriasClinicasPage;
