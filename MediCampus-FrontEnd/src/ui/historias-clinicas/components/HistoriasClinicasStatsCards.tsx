interface StatCardItem {
  label: string;
  value: number;
  badge: string;
  icon: string;
  iconClass: string;
  badgeClass: string;
}

interface HistoriasClinicasStatsCardsProps {
  items: StatCardItem[];
}

export const HistoriasClinicasStatsCards = ({
  items,
}: HistoriasClinicasStatsCardsProps) => {
  return (
    <section className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.label}
          className="rounded-global border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold ${item.iconClass}`}
            >
              {item.icon}
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${item.badgeClass}`}
            >
              {item.badge}
            </span>
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
            {item.label}
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-900">
            {item.value.toLocaleString()}
          </p>
        </article>
      ))}
    </section>
  );
};