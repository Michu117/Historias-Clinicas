import React from 'react'

interface Props {
  page: number
  totalPages: number
  onPage: (n: number) => void
}

export const Pagination: React.FC<Props> = ({ page, totalPages, onPage }) => (
  <div className="flex items-center gap-2">
    <button
      disabled={page <= 1}
      onClick={() => onPage(page - 1)}
      className="px-3 py-1 rounded-lg text-sm font-medium"
      style={{
        backgroundColor: 'var(--btn-secondary-bg)',
        color: 'var(--btn-secondary-text)',
        border: '1px solid var(--outline)',
        opacity: page <= 1 ? 0.5 : 1,
      }}
    >
      Prev
    </button>
    <span className="px-2 text-sm" style={{ color: 'var(--on-surface-variant)' }}>{page} / {totalPages}</span>
    <button
      disabled={page >= totalPages}
      onClick={() => onPage(page + 1)}
      className="px-3 py-1 rounded-lg text-sm font-medium"
      style={{
        backgroundColor: 'var(--btn-secondary-bg)',
        color: 'var(--btn-secondary-text)',
        border: '1px solid var(--outline)',
        opacity: page >= totalPages ? 0.5 : 1,
      }}
    >
      Next
    </button>
  </div>
)

export default Pagination
