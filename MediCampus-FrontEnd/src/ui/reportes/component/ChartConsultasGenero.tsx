import React from 'react';
import ChartContainer from './ChartContainer';

const GENDER_CONFIG: Record<string, { label: string; color: string }> = {
  hombre: { label: 'Hombres', color: '#006766' },
  mujer: { label: 'Mujeres', color: '#565e74' },
  sin_registro: { label: 'Sin Registro', color: '#595c5e' },
  male: { label: 'Hombres', color: '#006766' },
  female: { label: 'Mujeres', color: '#565e74' },
  other: { label: 'Sin Registro', color: '#595c5e' },
};

export default function ChartConsultasGenero({ data, loading = false, error = null }: any): JSX.Element {


  let items: any[] = [];
  let total: number = 0;

  if (data) {
    const rawData = data.data || data;

    // Caso A: Formato Array (el esperado)
    if (rawData.items && Array.isArray(rawData.items)) {
      items = rawData.items;
      total = Number(rawData.total_registros) || 0;
    }
    // Caso B: Formato Objeto
    else if (typeof rawData === 'object') {
      items = Object.entries(rawData)
        .filter(([key]) => key !== 'total_registros' && key !== 'filtros_aplicados')
        .map(([key, val]: [string, any]) => {
  // 1. Calculamos la cantidad
  const cantidad = typeof val === 'object'
    ? (val.cantidad || val.count || val.total || val.value || 0)
    : Number(val) || 0;

  // 2. Retornamos el objeto
  return { genero: key, cantidad: cantidad };
});

      total = items.reduce((acc, curr) => acc + (curr.cantidad || 0), 0);
    }
  }


  if (loading) return <ChartContainer title="Consultas por Género" type="pie" data={null} loading />;

  const totalDisplay = typeof total === 'number' ? total : 0;

  // Preparamos los datos
  const labels = items.map(i => GENDER_CONFIG[i.genero]?.label || i.genero);
  const dataValues = items.map(i => i.cantidad);
  const backgroundColors = items.map(i => GENDER_CONFIG[i.genero]?.color || '#cbd5e1');


  return (
    <div className="bg-white p-6 rounded-xl border border-[#bdc9c8] shadow-sm">
      <ChartContainer
        title="Consultas por Género"
        type="pie"
        data={{
           labels: labels,
           datasets: [{
             data: dataValues,
             backgroundColor: backgroundColors,
           }]
        }}
        showLegend
        height={240}
      />

      <p className="mt-4 text-center text-[13px] font-semibold text-[#3e4948]">
        Total: {totalDisplay.toLocaleString()} consultas
      </p>
    </div>
  );
}