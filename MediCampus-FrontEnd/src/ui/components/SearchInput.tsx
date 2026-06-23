import React from 'react'
import { Input } from './Input'

interface Props {
  value?: string
  onChange?: (v: string) => void
  placeholder?: string
}

export const SearchInput: React.FC<Props> = ({ value = '', onChange, placeholder = 'Buscar...' }) => (
  <div className="relative w-full">
    <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--on-surface-variant)' }}>🔍</span>
    <Input className="pl-10" value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} />
  </div>
)

export default SearchInput
