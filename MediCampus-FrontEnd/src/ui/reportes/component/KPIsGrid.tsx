import React from 'react';
import MetricCard from './MetricCard';

export interface MetricDef {
  value: number | null;
  highlight?: boolean;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  delta?: number;
  icon?: React.ReactNode;
}

interface KPIsGridProps {
  title?: string;
  metrics: MetricDef[];
}

export default function KPIsGrid({
  title = 'Métricas Principales (KPIs)',
  metrics
}: KPIsGridProps): JSX.Element {
  if (!metrics || metrics.length === 0) return <></>;

  return (
    <div>
      {title && (
        <h2 className="mb-4 text-xl font-semibold" style={{ color: 'var(--on-surface)' }}>{title}</h2>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, idx) => (
          <MetricCard
            key={idx}
            value={metric.value}
            label={metric.label}
            trend={metric.trend ?? 'neutral'}
            delta={metric.delta}
            icon={metric.icon}
          />
        ))}
      </div>
    </div>
  );
}
