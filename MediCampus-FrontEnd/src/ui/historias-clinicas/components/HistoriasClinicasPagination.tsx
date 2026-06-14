interface HistoriasClinicasPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  currentItems: number;
  onPageChange: (page: number) => void;
}

export const HistoriasClinicasPagination = ({
  page,
  totalPages,
  totalItems,
  pageSize,
  currentItems,
  onPageChange,
}: HistoriasClinicasPaginationProps) => {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = totalItems === 0 ? 0 : start + currentItems - 1;

  const visiblePages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  ).filter((item) => {
    return item === 1 || item === totalPages || Math.abs(item - page) <= 1;
  });

  return (
    <footer className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-hc-surfaceAlt px-5 py-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
      <p>
        Mostrando {start}-{end} de {totalItems.toLocaleString()} registros
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-global border border-slate-200 bg-white px-3 py-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ‹
        </button>

        {visiblePages.map((item, index) => {
          const previous = visiblePages[index - 1];
          const showDots = previous && item - previous > 1;

          return (
            <span key={item} className="flex items-center gap-2">
              {showDots && <span className="px-1 text-slate-400">...</span>}

              <button
                type="button"
                onClick={() => onPageChange(item)}
                className={
                  item === page
                    ? 'rounded-global bg-hc-primary px-3 py-2 font-semibold text-hc-primaryText'
                    : 'rounded-global border border-slate-200 bg-white px-3 py-2 text-slate-600 transition hover:bg-slate-50'
                }
              >
                {item}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-global border border-slate-200 bg-white px-3 py-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ›
        </button>
      </div>
    </footer>
  );
};