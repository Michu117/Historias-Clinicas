import React from 'react'

interface Props {
  variant?: 'neutral' | 'success' | 'warning' | 'danger'
  children?: React.ReactNode
}

export const Badge: React.FC<Props> = ({ variant = 'neutral', children }) => {
  const map = {
    neutral: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${map[variant]}`}>{children}</span>
}

export default Badge
