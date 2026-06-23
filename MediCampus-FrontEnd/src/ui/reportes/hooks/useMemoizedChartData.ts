/**
 * useMemoizedChartData.ts
 * Hook optimizado con memoización para rendimiento de gráficos
 */

import { useMemo, useCallback } from 'react';
import { transformGenderDataToChart, transformAgeDataToChart, transformTemporalDataToChart } from '../utils/chartTransformers';

export function useMemoizedChartData(
  data: any,
  transformType: 'gender' | 'age' | 'temporal' = 'gender',
  dependencies: any[] = []
) {
  const memoizedChart = useMemo(() => {
    if (!data) return null;

    switch (transformType) {
      case 'gender':
        return transformGenderDataToChart(data, 'pie');
      case 'age':
        return transformAgeDataToChart(data);
      case 'temporal':
        return transformTemporalDataToChart(data);
      default:
        return null;
    }
  }, [data, transformType, ...dependencies]);

  return memoizedChart;
}

export function useChartTooltip() {
  return useCallback(
    (context: any) => {
      if (!context.tooltip.opacity) return;
      const cxypos = context.chart.canvas.getBoundingClientRect();
      const canvasPosition = {
        x: cxypos.left + context.tooltip.caretX,
        y: cxypos.top + context.tooltip.caretY
      };

      const tooltipModel = context.tooltip;
      if (!tooltipModel.body) return;

      const lines = tooltipModel.body.map((bodyItem: any) => bodyItem.lines);
      return { lines, canvasPosition };
    },
    []
  );
}

