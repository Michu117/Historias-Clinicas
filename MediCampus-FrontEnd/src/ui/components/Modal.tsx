import React, { useCallback, useEffect, useRef } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  titleId?: string
  descriptionId?: string
  icon?: React.ReactNode
  closeable?: boolean
  children?: React.ReactNode
}

export const Modal: React.FC<Props> = ({
  open,
  onClose,
  title,
  titleId,
  descriptionId,
  icon,
  closeable = true,
  children,
}) => {
  const prevFocusRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const safeClose = useCallback(() => {
    if (closeable) onClose()
  }, [closeable, onClose])

  useEffect(() => {
    if (!open) return
    prevFocusRef.current = document.activeElement as HTMLElement
    const timer = setTimeout(() => contentRef.current?.focus(), 50)
    return () => {
      clearTimeout(timer)
      prevFocusRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open || !closeable) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, closeable, onClose])

  if (!open) return null

  const tid = titleId ?? 'modal-title'
  const did = descriptionId ?? 'modal-description'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={tid}
      aria-describedby={did}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={safeClose}
      />

      {/* Card */}
      <div
        ref={contentRef}
        tabIndex={-1}
        className="relative w-full max-w-[520px] rounded-xl shadow-2xl outline-none overflow-hidden"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          animation: 'modalIn 0.2s ease-out',
        }}
      >
        {/* Close button */}
        {closeable && (
          <button
            type="button"
            aria-label="Cerrar"
            onClick={safeClose}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-150 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            style={{ color: 'var(--on-surface-variant)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {/* Icon */}
        {icon && (
          <div className="flex justify-center pt-6">
            {icon}
          </div>
        )}

        {/* Header */}
        {title && (
          <div className={`px-6 ${icon ? 'pt-3' : 'pt-6'}`}>
            <h3
              id={tid}
              className="text-base font-semibold leading-6"
              style={{ color: 'var(--hc-text)' }}
            >
              {title}
            </h3>
          </div>
        )}

        {/* Body */}
        <div id={did} className="px-6 pb-6 pt-3">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default Modal
