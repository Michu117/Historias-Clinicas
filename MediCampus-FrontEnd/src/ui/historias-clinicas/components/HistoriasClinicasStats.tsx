import { Card, CardTitle } from '../../../ui/components/Card';

interface HistoriasClinicasStatItem {
  label: string;
  value: number;
  description?: string;
}

interface HistoriasClinicasStatsProps {
  items: HistoriasClinicasStatItem[];
}

export const HistoriasClinicasStats = ({ items }: HistoriasClinicasStatsProps) => {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} className="flex flex-col gap-2">
          <CardTitle>{item.label}</CardTitle>
          <p className="text-3xl font-semibold" style={{ color: 'var(--hc-text)' }}>{item.value}</p>
          {item.description ? <p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>{item.description}</p> : null}
        </Card>
      ))}
    </section>
  );
};
