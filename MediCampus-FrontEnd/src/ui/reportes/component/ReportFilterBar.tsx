import React, { useState, useCallback, useEffect } from 'react';
import { isRangeValid } from '../reportesValidators';
import type { DateRangePreset } from '../types';
import { DATE_RANGE_OPTIONS } from '../types';
import reportService from '../service/reportService';

interface ReportFilterBarProps {
  onApply: (filters: {
    fecha_inicio: string;
    fecha_fin: string;
    dateRange: DateRangePreset;
    servicioId: string;
  }) => void;
  onReset?: () => void;
}

function computeDateRange(preset: DateRangePreset): { fecha_inicio: string; fecha_fin: string } {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const fecha_fin = `${yyyy}-${mm}-${dd}`;

  let start: Date;
  switch (preset) {
    case 'last30':
      start = new Date(today);
      start.setDate(start.getDate() - 30);
      break;
    case 'quarter':
      start = new Date(today);
      start.setMonth(start.getMonth() - 3);
      break;
    case 'year':
      start = new Date(yyyy, 0, 1);
      break;
    default:
      return { fecha_inicio: '', fecha_fin: '' };
  }

  const sy = start.getFullYear();
  const sm = String(start.getMonth() + 1).padStart(2, '0');
  const sd = String(start.getDate()).padStart(2, '0');
  return { fecha_inicio: `${sy}-${sm}-${sd}`, fecha_fin };
}

export default function ReportFilterBar({
  onApply,
  onReset
}: ReportFilterBarProps): JSX.Element {
  const [dateRange, setDateRange] = useState<DateRangePreset>('last30');
  const [startDate, setStartDate] = useState(() => computeDateRange('last30').fecha_inicio);
  const [endDate, setEndDate] = useState(() => computeDateRange('last30').fecha_fin);
  const [servicioId, setServicioId] = useState('');
  const [error, setError] = useState('');
  const [servicioOptions, setServicioOptions] = useState<{ value: string; label: string }[]>([]);
  const [serviciosLoading, setServiciosLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setServiciosLoading(true);
    reportService.getServiciosCatalogo().then((res) => {
      if (cancelled) return;
      if (res.success && res.data) {
        setServicioOptions(res.data);
      }
    }).finally(() => {
      if (!cancelled) setServiciosLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const isCustom = dateRange === 'custom';
  const isValid = isCustom
    ? startDate && endDate && isRangeValid(startDate, endDate).isValid
    : true;

  const handleDateRangeChange = useCallback((preset: DateRangePreset) => {
    setDateRange(preset);
    setError('');
    if (preset !== 'custom') {
      const range = computeDateRange(preset);
      setStartDate(range.fecha_inicio);
      setEndDate(range.fecha_fin);
    }
  }, []);

  const handleApply = () => {
    if (isCustom && !isValid) {
      setError('Rango de fechas inválido');
      return;
    }
    setError('');
    onApply({ fecha_inicio: startDate, fecha_fin: endDate, dateRange, servicioId });
  };

  const handleReset = () => {
    const preset: DateRangePreset = 'last30';
    const range = computeDateRange(preset);
    setDateRange(preset);
    setStartDate(range.fecha_inicio);
    setEndDate(range.fecha_fin);
    setServicioId('');
    setError('');
    onReset?.();
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Período
          </label>
          <select
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value as DateRangePreset)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {DATE_RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {isCustom && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Servicio
          </label>
          <select
            value={servicioId}
            onChange={(e) => setServicioId(e.target.value)}
            disabled={serviciosLoading}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-wait"
          >
            {serviciosLoading ? (
              <option value="">Cargando...</option>
            ) : (
              servicioOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleApply}
          disabled={!isValid}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}

