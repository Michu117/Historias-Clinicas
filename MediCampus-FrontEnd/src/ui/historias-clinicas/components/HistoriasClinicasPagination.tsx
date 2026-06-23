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
    <footer
      className="flex shrink-0 flex-col gap-3 px-5 py-4 text-sm md:flex-row md:items-center md:justify-between"
      style={{ borderTop: '1px solid var(--card-border)', backgroundColor: 'var(--hc-bg)', color: 'var(--on-surface-variant)' }}
    >
      <p>
        Mostrando {start}-{end} de {totalItems.toLocaleString()} registros
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg px-3 py-2 transition disabled:cursor-not-allowed disabled:opacity-50"
          style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--on-surface-variant)' }}
        >
          ‹
        </button>

        {visiblePages.map((item, index) => {
          const previous = visiblePages[index - 1];
          const showDots = previous && item - previous > 1;

          return (
            <span key={item} className="flex items-center gap-2">
              {showDots && <span className="px-1" style={{ color: 'var(--card-text-muted)' }}>...</span>}

              <button
                type="button"
                onClick={() => onPageChange(item)}
                className={
                  item === page
                    ? 'rounded-lg px-3 py-2 font-semibold'
                    : 'rounded-lg px-3 py-2 transition'
                }
                style={
                  item === page
                    ? { backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }
                    : { border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--on-surface-variant)' }
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
          className="rounded-lg px-3 py-2 transition disabled:cursor-not-allowed disabled:opacity-50"
          style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--on-surface-variant)' }}
        >
          ›
        </button>
      </div>
    </footer>
  );
};
