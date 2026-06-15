import React from 'react'

interface Props {
  title?: string
  children?: React.ReactNode
}

export const Topbar: React.FC<Props> = ({ title, children }) => (
  <header className="fixed top-0 right-0 w-full md:w-[calc(100%-280px)] h-16 bg-white flex items-center px-6 border-b border-[#c2c6d4] z-30">
    <div className="flex items-center gap-4 w-full">
      <h2 className="text-lg font-semibold text-[#141b2b]">{title}</h2>
      <div className="ml-auto">{children}</div>
    </div>
  </header>
)

export default Topbar
