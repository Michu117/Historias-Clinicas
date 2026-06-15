import React from 'react'

interface Props {
  children?: React.ReactNode
}

export const Sidebar: React.FC<Props> = ({ children }) => (
  <aside className="hidden md:flex flex-col w-[280px] p-6 border-r border-[#c2c6d4] bg-[#f1f3ff] h-full shrink-0">{children}</aside>
)

export default Sidebar
