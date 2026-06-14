import React from 'react';
import ChartContainer from './ChartContainer';

const GENDER_CONFIG: Record<string, { label: string; color: string }> = {
  hombre: { label: 'Hombres', color: '#0056b3' },
  mujer: { label: 'Mujeres', color: '#003f87' },
  sin_registro: { label: 'Sin Registro', color: '#94a3b8' },
  male: { label: 'Hombres', color: '#0056b3' },
  female: { label: 'Mujeres', color: '#003f87' },
  other: { label: 'Sin Registro', color: '#94a3b8' },
};

export default function ChartConsultasGenero({ data, loading = false, error = null }: any): JSX.Element {

  console.log("DEBUG [1]: Datos crudos recibidos en componente:", data);

  let items: any[] = [];
  let total: number = 0;

  if (data) {
    const rawData = data.data || data;
    console.log("DEBUG [2]: Datos normalizados (rawData):", rawData);

    // Caso A: Formato Array (el esperado)
    if (rawData.items && Array.isArray(rawData.items)) {
      console.log("DEBUG [3]: Formato detectado: ARRAY (items)");
      items = rawData.items;
      total = Number(rawData.total_registros) || 0;
    }
    // Caso B: Formato Objeto
    else if (typeof rawData === 'object') {
      console.log("DEBUG [3]: Formato detectado: OBJETO");
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

  console.log("DEBUG [4]: Items finales para el gráfico:", items);
  console.log("DEBUG [5]: Total calculado:", total);

  if (loading) return <ChartContainer title="Consultas por Género" type="pie" data={null} loading />;

  const totalDisplay = typeof total === 'number' ? total : 0;

  // Preparamos los datos
  const labels = items.map(i => GENDER_CONFIG[i.genero]?.label || i.genero);
  const dataValues = items.map(i => i.cantidad);
  const backgroundColors = items.map(i => GENDER_CONFIG[i.genero]?.color || '#cbd5e1');

  console.log("DEBUG [6]: Datos listos para ChartContainer:", { labels, dataValues, backgroundColors });

  return (
    <div className="bg-white p-6 rounded-xl border border-[#c2c6d4] shadow-sm">
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

      <p className="mt-4 text-center text-[13px] font-semibold text-[#424752]">
        Total: {totalDisplay.toLocaleString()} consultas
      </p>
    </div>
  );
}