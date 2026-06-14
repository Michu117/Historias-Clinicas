import React from 'react';
import { formatMetricValue } from '../reportesValidators';

interface MetricCardProps {
  value: number | null;
  label: string;
  delta?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export default function MetricCard({
  value,
  label,
  delta,
  trend = 'neutral',
  icon
}: MetricCardProps): JSX.Element {
  const trendColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  }[trend];

  const trendBg = {
    up: 'bg-green-50',
    down: 'bg-red-50',
    neutral: 'bg-gray-50'
  }[trend];

  return (
    <div className={`${trendBg} rounded-lg border border-gray-200 p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {formatMetricValue(value)}
          </p>
          {delta !== undefined && (
            <p className={`mt-2 text-sm font-semibold ${trendColor}`}>
              {delta > 0 ? '+' : ''}{delta}%
            </p>
          )}
        </div>
        {icon && (
          <div className={`ml-4 flex h-12 w-12 items-center justify-center rounded-lg ${trendBg}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

