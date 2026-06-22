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
  const isUp = trend === 'up';
  const isDown = trend === 'down';
  const isNeutral = trend === 'neutral';

  const trendBgSemantic = isUp ? 'bg-green-50' : isDown ? 'bg-red-50' : '';
  const trendBgStyle = isNeutral ? { backgroundColor: 'var(--surface-container-low)' } : {};

  const trendColorClass = isUp ? 'text-green-600' : isDown ? 'text-red-600' : '';
  const trendColorStyle = isNeutral ? { color: 'var(--on-surface-variant)' } : {};

  return (
    <div
      className={`${trendBgSemantic} rounded-lg border p-6 shadow-sm`}
      style={{ borderColor: 'var(--outline-variant)', ...trendBgStyle }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: 'var(--on-surface-variant)' }}>{label}</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--on-surface)' }}>
            {formatMetricValue(value)}
          </p>
          {delta !== undefined && (
            <p className={`mt-2 text-sm font-semibold ${trendColorClass}`} style={trendColorStyle}>
              {delta > 0 ? '+' : ''}{delta}%
            </p>
          )}
        </div>
        {icon && (
          <div className={`ml-4 flex h-12 w-12 items-center justify-center rounded-lg ${trendBgSemantic}`} style={trendBgStyle}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
