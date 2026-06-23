import React from 'react'

interface Props {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}

export const ToggleSwitch: React.FC<Props> = ({ checked, onChange, disabled }) => (
  <button
    aria-pressed={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className="inline-flex items-center p-0.5 rounded-full focus:outline-none"
    style={{ backgroundColor: checked ? 'var(--primary)' : 'var(--surface-container-high)' }}
  >
    <span className={`inline-block w-4 h-4 rounded-full transform transition-transform ${checked ? 'translate-x-3' : 'translate-x-0'}`} style={{ backgroundColor: 'var(--surface-container-lowest)' }} />
  </button>
)

export default ToggleSwitch
