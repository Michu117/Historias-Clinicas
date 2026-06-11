import React, { PropsWithChildren } from 'react'
import useAuthorization from '../hooks/useAuthorization'

type Props = PropsWithChildren<{ permission: string }>

export const ProtectedRoute: React.FC<Props> = ({ permission, children }) => {
  const auth = useAuthorization()

  if (auth.canRender(permission)) {
    return <>{children}</>
  }

  return (
    <div className="p-6 text-center text-red-600" role="alert">
      <h1 className="text-2xl font-bold">403 Forbidden</h1>
      <p>Acceso denegado. No autorizado.</p>
    </div>
  )
}

export default ProtectedRoute
