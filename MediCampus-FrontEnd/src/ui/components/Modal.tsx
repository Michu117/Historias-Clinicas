import React from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children?: React.ReactNode
}

export const Modal: React.FC<Props> = ({ open, onClose, title, children }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl shadow-lg overflow-hidden"
        style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--outline)' }}>
          <h3 className="font-medium text-sm" style={{ color: 'var(--hc-text)' }}>{title}</h3>
          <button onClick={onClose} style={{ color: 'var(--on-surface-variant)', background: 'none', borderRadius: '999px', padding: '0.25rem 0.5rem' }}>✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default Modal
