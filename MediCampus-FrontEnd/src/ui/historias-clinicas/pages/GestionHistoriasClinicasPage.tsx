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
import type { ConsultaClinico } from '../types/consultaClinico.types';

const PAGE_SIZE = 3;

const AccessDenied = () => (
  <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
    <Card className="max-w-md text-center">
      <h1 className="text-xl font-semibold text-slate-900">
        Acceso denegado
      </h1>
      <p className="mt-2 text-sm text-slate-600">
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
      setTodosLosCasos([]);
      return;
    }
    Promise.all(
      rawHistorias.map((h) =>
        historiasClinicasService.listarCasosClinicosPorHistoria(h.id)
      )
    )
      .then((res) => setTodosLosCasos(res.flat()))
      .catch(() => {});
  }, [rawHistorias]);

  const esFechaDeHoy = (fecha?: string) => {
    if (!fecha) return false;
    const f = new Date(fecha);
    const h = new Date();
    return (
      f.getFullYear() === h.getFullYear() &&
      f.getMonth() === h.getMonth() &&
      f.getDate() === h.getDate()
    );
  };

  const historiasActualizadasHoy = rawHistorias.filter((h) =>
    esFechaDeHoy(h.ultimaActualizacion)
  ).length;

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

  console.log('todosLosCasos dashboard:', todosLosCasos);
  console.log('estados dashboard:', todosLosCasos.map((c) => c.estado));

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
            <p className="text-sm text-slate-600">
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
            <p className="text-sm text-slate-500">
              No hay historias clínicas registradas.
            </p>
          </Card>
        )}

        {!loading &&
          !error &&
          rawHistorias.length > 0 &&
          historias.length === 0 && (
            <Card>
              <p className="text-sm text-slate-500">
                No se encontraron resultados con los filtros actuales.
              </p>
            </Card>
          )}

        {!loading && !error && historias.length > 0 && (
          <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
      navigate('/seguridad/login');
      return;
    }
    if (role === 'PACIENTE') {
      navigate('/historias/mi-historia', { replace: true });
      return;
    }
  }, [isAuthorized, role, navigate]);

  if (!isAuthorized) return null;

  if (role === 'ADMINISTRADOR' || permissions?.isAdminBlocked) {
    return <AccessDenied />;
  }

  if (role === 'MEDICO') {
    return <MedicoContent />;
  }

  return <AccessDenied />;
};

export default GestionHistoriasClinicasPage;
