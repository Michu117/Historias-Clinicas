import React from 'react'

interface Props {
  title?: string
  children?: React.ReactNode
}

export const Topbar: React.FC<Props> = ({ title, children }) => (
  <header
    className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] h-16 flex items-center px-6 z-30"
    style={{
      backgroundColor: 'var(--surface-container-lowest)',
      borderBottom: '1px solid var(--outline)',
    }}
  >
    <div className="flex items-center gap-4 w-full">
      <h2 className="text-lg font-medium" style={{ color: 'var(--hc-text)' }}>{title}</h2>
      <div className="ml-auto">{children}</div>
    </div>
  </header>
)

export default Topbar
