import React from 'react'

interface Props {
  variant?: 'neutral' | 'success' | 'warning' | 'danger'
  children?: React.ReactNode
}

const map: Record<string, React.CSSProperties> = {
  neutral: { backgroundColor: 'var(--surface-container-low)', color: 'var(--on-surface)' },
  success: { backgroundColor: 'var(--secondary-container)', color: 'var(--on-secondary-container)' },
  warning: { backgroundColor: '#fef3c7', color: '#92400e' },
  danger: { backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)' },
}

export const Badge: React.FC<Props> = ({ variant = 'neutral', children }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs" style={map[variant]}>
      {children}
    </span>
  )
}

export default Badge
