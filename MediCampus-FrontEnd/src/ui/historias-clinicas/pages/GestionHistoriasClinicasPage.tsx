import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card } from '../../../ui/components/Card';
import { HistoriasClinicasDashboardLayout } from '../components/HistoriasClinicasDashboardLayout';
import { HistoriasClinicasFiltersPanel } from '../components/HistoriasClinicasFiltersPanel';
import { HistoriasClinicasPagination } from '../components/HistoriasClinicasPagination';
import { HistoriasClinicasStatsCards } from '../components/HistoriasClinicasStatsCards';
import { HistoriasClinicasTable } from '../components/HistoriasClinicasTable';
import { useHistoriasClinicas } from '../hooks/useHistoriasClinicas';
import { useHistoriasClinicasAuth } from '../hooks/useHistoriasClinicasAuth';

import type { HistoriaClinica } from '../types/historiaClinica.types';

const PAGE_SIZE = 3;

const UnauthorizedAccess = () => (
  <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
    <Card className="max-w-md text-center">
      <h1 className="text-xl font-semibold text-slate-900">
        Acceso no autorizado
      </h1>

      <p className="mt-2 text-sm text-slate-600">
        Debes iniciar sesión para gestionar historias clínicas.
      </p>
    </Card>
  </main>
);

const AuthorizedContent = () => {
  const navigate = useNavigate();
  const [actionMessage, setActionMessage] = useState('');
  const [page, setPage] = useState(1);

  const {
    historias,
    rawHistorias,
    stats,
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

  const handleNuevaHistoria = () => {
    navigate('/historias/nueva');
  };
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
    const confirmar = window.confirm(
      `¿Deseas cerrar la historia clínica del paciente ${historia.usuario.nombre}?`
    );

    if (!confirmar) return;

    setActionMessage(
      'El cierre de la historia clínica se conectará al backend autenticado en una fase posterior.'
    );
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

  const getStatValue = (label: string) => {
    const item = stats.find((stat) =>
      stat.label.toLowerCase().includes(label.toLowerCase())
    );

    return item?.value ?? 0;
  };

  const statCards = [
    {
      label: 'Historias registradas',
      value: getStatValue('registradas') || rawHistorias.length,
      badge: 'Total',
      icon: '▣',
      iconClass: 'bg-sky-100 text-sky-700',
      badgeClass: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'Historias activas',
      value: getStatValue('activas'),
      badge: 'Activas',
      icon: '✓',
      iconClass: 'bg-emerald-100 text-emerald-700',
      badgeClass: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Historias cerradas',
      value: getStatValue('cerradas'),
      badge: 'Cerradas',
      icon: '▤',
      iconClass: 'bg-indigo-100 text-indigo-700',
      badgeClass: 'bg-indigo-50 text-indigo-700',
    },
    {
      label: 'Actualizadas hoy',
      value: 0,
      badge: 'Hoy',
      icon: '◷',
      iconClass: 'bg-rose-100 text-rose-700',
      badgeClass: 'bg-rose-50 text-rose-700',
    },
  ];

  return (
    <HistoriasClinicasDashboardLayout>
      <header className="flex shrink-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Gestión de Historias Clínicas
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Administración de historias clínicas de usuarios atendidos por Bienestar Universitario.
          </p>
        </div>

        <button
            type="button"
            onClick={handleNuevaHistoria}
            className="rounded-lg bg-[#0056b3] px-6 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          + Nueva Historia Clínica
        </button>
      </header>

      <HistoriasClinicasStatsCards items={statCards} />

      <HistoriasClinicasFiltersPanel
          searchValue={searchValue}
          statusValue={statusValue}
          statusOptions={statusOptions}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onClearFilters={handleClearFilters}
      />

      {actionMessage && (
        <div className="shrink-0 rounded-global border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          {actionMessage}
        </div>
      )}

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
          <div className="flex h-full flex-col overflow-hidden rounded-global border border-slate-200 bg-white shadow-sm">
            <div className="min-h-0 flex-1 overflow-hidden">
              <HistoriasClinicasTable
                historias={paginatedHistorias}
                startIndex={startIndex}
                onView={handleView}
                onEdit={handleEdit}
                onClose={handleClose}
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
  const { isAuthorized } = useHistoriasClinicasAuth();

  return isAuthorized ? <AuthorizedContent /> : <UnauthorizedAccess />;
};

export default GestionHistoriasClinicasPage;