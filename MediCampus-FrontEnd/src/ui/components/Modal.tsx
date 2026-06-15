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
      <div className="relative w-full max-w-2xl bg-white rounded-global shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#c2c6d4] flex items-center justify-between">
          <h3 className="font-medium text-sm">{title}</h3>
          <button onClick={onClose} className="text-[#424752]">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default Modal
