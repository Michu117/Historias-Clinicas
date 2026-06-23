import { describe, it, expect } from 'vitest';
import { transformGenderDataToChart, transformAgeDataToChart } from '../utils/chartTransformers';

describe('Chart Data Transformers - Red Phase', () => {
  const mockGenderData = {
    male: { count: 100, percent: 50 },
    female: { count: 90, percent: 45 },
    other: { count: 10, percent: 5 }
  };

  const mockAgeData = [
    { age_range: '0-18', count: 25, percent: 12.5 },
    { age_range: '19-35', count: 80, percent: 40 },
    { age_range: '36-60', count: 70, percent: 35 },
    { age_range: '61+', count: 25, percent: 12.5 }
  ];

  it('transforms gender data to bar chart format', () => {
    const chartData = transformGenderDataToChart(mockGenderData);

    expect(chartData.labels).toEqual(['Hombres', 'Mujeres', 'Otro']);
    expect(chartData.datasets[0].data).toEqual([100, 90, 10]);
  });

  it('transforms gender data to pie chart format', () => {
    const chartData = transformGenderDataToChart(mockGenderData, 'pie');

    expect(chartData.labels.length).toBe(3);
    expect(chartData.datasets[0].data).toContain(50);
    expect(chartData.datasets[0].data).toContain(45);
  });

  it('transforms age range data to chart format', () => {
    const chartData = transformAgeDataToChart(mockAgeData);

    expect(chartData.labels).toEqual(['0-18', '19-35', '36-60', '61+']);
    expect(chartData.datasets[0].data).toEqual([25, 80, 70, 25]);
  });

  it('handles missing gender data gracefully', () => {
    const incompleteData = { male: { count: 50, percent: 100 } };
    const chartData = transformGenderDataToChart(incompleteData);

    expect(chartData.labels.length).toBeGreaterThan(0);
  });

  it('handles empty age data', () => {
    const chartData = transformAgeDataToChart([]);

    expect(chartData.labels.length).toBe(0);
    expect(chartData.datasets[0].data.length).toBe(0);
  });

  it('calculates percentages correctly for gender', () => {
    const chartData = transformGenderDataToChart(mockGenderData, 'pie');

    expect(chartData.datasets[0].data).toContain(50);
    expect(chartData.datasets[0].data).toContain(45);
    expect(chartData.datasets[0].data).toContain(5);
  });
});

