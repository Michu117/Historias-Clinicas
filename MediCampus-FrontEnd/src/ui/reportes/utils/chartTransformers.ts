/**
 * chartTransformers.ts
 * Utilities for transforming backend data to chart.js format
 */

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

/**
 * Transforms gender statistics to chart format
 */
export function transformGenderDataToChart(
  genderData: any,
  chartType: 'bar' | 'pie' = 'bar'
): ChartData {
  const genderMap: Record<string, string> = {
    male: 'Hombres',
    female: 'Mujeres',
    other: 'Otro'
  };

  const colorMap: Record<string, string[]> = {
    male: ['rgba(59, 130, 246, 0.5)', 'rgb(59, 130, 246)'],
    female: ['rgba(236, 72, 153, 0.5)', 'rgb(236, 72, 153)'],
    other: ['rgba(107, 114, 128, 0.5)', 'rgb(107, 114, 128)']
  };

  if (!genderData || typeof genderData !== 'object') {
    return { labels: [], datasets: [{ label: 'Sin datos', data: [] }] };
  }

  const labels: string[] = [];
  const data: number[] = [];
  const colors: string[] = [];

  Object.entries(genderData).forEach(([key, value]: [string, any]) => {
    if (value && typeof value === 'object') {
      labels.push(genderMap[key] || key);
      data.push(chartType === 'pie' ? value.percent : value.count);
      colors.push(colorMap[key]?.[0] || 'rgba(128, 128, 128, 0.5)');
    }
  });

  const dataset: ChartDataset = {
    label: chartType === 'pie' ? 'Distribución' : 'Cantidad',
    data,
    backgroundColor: chartType === 'pie' ? colors : colors[0],
    borderColor: chartType === 'pie' ? '#fff' : 'rgb(59, 130, 246)',
    borderWidth: 1
  };

  return { labels, datasets: [dataset] };
}

/**
 * Transforms age range data to chart format
 */
export function transformAgeDataToChart(ageData: any[]): ChartData {
  if (!Array.isArray(ageData) || ageData.length === 0) {
    return { labels: [], datasets: [{ label: 'Sin datos', data: [] }] };
  }

  const labels = ageData.map(item => item.age_range || item.rango_edad);
  const data = ageData.map(item => item.count);

  const dataset: ChartDataset = {
    label: 'Consultas por Rango de Edad',
    data,
    backgroundColor: 'rgba(34, 197, 94, 0.5)',
    borderColor: 'rgb(34, 197, 94)',
    borderWidth: 1
  };

  return { labels, datasets: [dataset] };
}

/**
 * Transforms epidemiological data (temporal evolution)
 */
export function transformTemporalDataToChart(
  temporalData: any[],
  label: string = 'Evolución Temporal'
): ChartData {
  if (!Array.isArray(temporalData) || temporalData.length === 0) {
    return { labels: [], datasets: [{ label: 'Sin datos', data: [] }] };
  }

  const labels = temporalData.map(item => item.fecha || item.date);
  const data = temporalData.map(item => item.total || item.count);

  const dataset: ChartDataset = {
    label,
    data,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgb(168, 85, 247)',
    borderWidth: 2
  };

  return { labels, datasets: [dataset] };
}

