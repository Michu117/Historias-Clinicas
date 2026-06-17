import React from 'react';
import ChartContainer from './ChartContainer';

const PALETA = ['#0056B3', '#0D9488', '#4F46E5', '#94A3B8'];

interface ServicioTotal {
  servicio: string;
  total: number;
}

interface ChartConsultasFechaProps {
  data: ServicioTotal[] | null;
  loading?: boolean;
  error?: string | null;
}

export default function ChartConsultasFecha({
  data,
  loading = false,
  error = null,
}: ChartConsultasFechaProps): JSX.Element {

  if (loading || error) {
    return (
      <ChartContainer
        title="Consultas por Tipo de Servicio"
        type="bar"
        data={null}
        loading={loading}
        error={error}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartContainer
        title="Consultas por Tipo de Servicio"
        type="bar"
        data={{
          labels: ['Médica', 'Psicológica', 'Odontológica', 'Trabajo Social'],
          datasets: [{ label: 'Consultas', data: [0, 0, 0, 0], backgroundColor: '#e2e8f0' }],
        }}
      />
    );
  }

  const labels = data.map(d => d.servicio);
  const values = data.map(d => d.total);
  const colors = data.map((_, i) => PALETA[i % PALETA.length]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Cantidad de Consultas',
        data: values,
        backgroundColor: colors,
        borderRadius: 6,
      },
    ],
  };

  return (
    <ChartContainer
      title="Consultas por Servicio"
      type="bar"
      data={chartData}
      showLegend={false}
      height={300}
    />
  );
}