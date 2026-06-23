import React from 'react'

interface Props {
  children?: React.ReactNode
}

export const Sidebar: React.FC<Props> = ({ children }) => (
  <aside
    className="hidden md:flex flex-col w-64 p-4 h-full"
    style={{
      backgroundColor: 'var(--surface-container-lowest)',
      borderRight: '1px solid var(--outline)',
    }}
  >
    {children}
  </aside>
)

export default Sidebar
