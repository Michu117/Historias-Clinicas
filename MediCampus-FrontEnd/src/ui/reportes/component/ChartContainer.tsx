import React from 'react';
import LoadingState from './LoadingState';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

interface ChartContainerProps {
  title: string;
  type: 'bar' | 'pie' | 'line';
  data: any;
  showLegend?: boolean;
  height?: number;
  loading?: boolean;
  error?: string | null;
}

export default function ChartContainer({ title, type, data, showLegend = false, height = 300, loading = false, error = null }: ChartContainerProps): JSX.Element {
  if (loading) return <LoadingState message="Cargando gráfico..." />;
  if (error) return <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>;

  // Si no hay datos, mostrar aviso vacío
  if (!data || !data.datasets || data.datasets.length === 0) {
    return <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center text-gray-600">No hay datos para mostrar</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Vital para que use la altura definida
    plugins: {
      legend: { display: showLegend, position: 'bottom' as const },
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-[16px] font-bold text-[#181c1c] mb-4">{title}</h3>
      {/* Contenedor con altura fija forzada */}
      <div style={{ height: `${height}px`, width: '100%', position: 'relative' }}>
        {/* LA CLAVE: el atributo 'key' fuerza a Chart.js a redibujar si los datos cambian */}
        {type === 'pie' && <Pie key={JSON.stringify(data)} data={data} options={options} />}
        {type === 'bar' && <Bar key={JSON.stringify(data)} data={data} options={options} />}
        {type === 'line' && <Line key={JSON.stringify(data)} data={data} options={options} />}
      </div>
    </div>
  );
}