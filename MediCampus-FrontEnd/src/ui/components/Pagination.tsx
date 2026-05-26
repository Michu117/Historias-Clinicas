import React from 'react'

interface Props {
  page: number
  totalPages: number
  onPage: (n: number) => void
}

export const Pagination: React.FC<Props> = ({ page, totalPages, onPage }) => (
  <div className="flex items-center gap-2">
    <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="px-3 py-1 rounded border">
      Prev
    </button>
    <span className="px-2 text-sm">{page} / {totalPages}</span>
    <button disabled={page >= totalPages} onClick={() => onPage(page + 1)} className="px-3 py-1 rounded border">
      Next
    </button>
  </div>
)

export default Pagination
