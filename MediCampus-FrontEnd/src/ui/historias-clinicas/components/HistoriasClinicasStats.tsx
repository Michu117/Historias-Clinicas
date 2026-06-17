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
          <p className="text-3xl font-semibold text-slate-900">{item.value}</p>
          {item.description ? <p className="text-sm text-slate-500">{item.description}</p> : null}
        </Card>
      ))}
    </section>
  );
};
