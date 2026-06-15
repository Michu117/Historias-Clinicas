import React from 'react'

interface Props {
  children?: React.ReactNode
}

export const Sidebar: React.FC<Props> = ({ children }) => (
  <aside className="hidden md:flex flex-col w-64 p-4 border-r border-slate-200 bg-white h-full">{children}</aside>
)

export default Sidebar
