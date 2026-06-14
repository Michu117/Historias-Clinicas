import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, TooltipItem } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import LoadingState from './LoadingState';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const PALETA: Record<string, string> = {
  medica: '#0056B3',
  psicologica: '#0D9488',
  odontologica: '#4F46E5',
  social: '#94A3B8',
};

const BAR_WIDTH_PER_DAY = 50;

interface RangoItem {
  fecha: string;
  medica: number;
  psicologica: number;
  odontologica: number;
  social: number;
  total: number;
}

interface ChartConsultasRangoProps {
  data: { items: RangoItem[]; total_consultas: number; total_dias: number } | null;
  loading?: boolean;
  error?: string | null;
}

export default function ChartConsultasRango({
  data,
  loading = false,
  error = null,
}: ChartConsultasRangoProps): JSX.Element {
  if (loading) {
    return <LoadingState message="Cargando gráfico de consultas..." />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  if (!data || !data.items || data.items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-600">No hay datos para el rango seleccionado</p>
      </div>
    );
  }

  const labels = data.items.map((item) => item.fecha);
  const chartWidth = Math.max(labels.length * BAR_WIDTH_PER_DAY, 600);

  const datasets = [
    {
      label: 'Médica',
      data: data.items.map((item) => item.medica),
      backgroundColor: PALETA.medica,
      borderRadius: 2,
    },
    {
      label: 'Psicológica',
      data: data.items.map((item) => item.psicologica),
      backgroundColor: PALETA.psicologica,
      borderRadius: 2,
    },
    {
      label: 'Odontológica',
      data: data.items.map((item) => item.odontologica),
      backgroundColor: PALETA.odontologica,
      borderRadius: 2,
    },
    {
      label: 'T. Social',
      data: data.items.map((item) => item.social),
      backgroundColor: PALETA.social,
      borderRadius: 2,
    },
  ];

  const chartData = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          font: { size: 11, family: 'Inter' },
          color: '#424752',
        },
      },
      tooltip: {
        backgroundColor: '#141b2b',
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          title: (items: TooltipItem<'bar'>[]) => items[0].label,
          label: (item: TooltipItem<'bar'>) => {
            const datasetLabel = item.dataset.label || '';
            const value = item.raw as number;
            const total = (item.chart.data.datasets as typeof datasets).reduce(
              (sum, ds) => sum + (ds.data[item.dataIndex] as number),
              0,
            );
            return `${datasetLabel}: ${value} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: {
          color: '#424752',
          font: { family: 'Inter', size: 10 },
          maxTicksLimit: 20,
          maxRotation: 45,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: '#f1f3ff' },
        ticks: {
          color: '#424752',
          font: { family: 'Inter', size: 11 },
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="rounded-xl border border-[#c2c6d4] bg-white shadow-sm p-6">
      <h3 className="text-[16px] font-bold text-[#141b2b] mb-4">
        Consultas por Día
      </h3>
      <p className="text-sm text-[#424752] mb-4">
        {data.total_dias} días · {data.total_consultas} consultas totales
      </p>
      <div style={{ width: `${chartWidth}px`, height: '360px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
