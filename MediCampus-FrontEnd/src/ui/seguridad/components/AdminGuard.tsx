import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import useAuthorization from '../hooks/useAuthorization'

const AdminGuard: React.FC = () => {
  const { isAuthenticated, userRole } = useAuthorization()

  if (!isAuthenticated()) {
    return <Navigate to="/seguridad/login" replace />
  }

  const adminRoles = ['Administrador', 'administrador', 'admin']
  if (!adminRoles.includes(userRole)) {
    return <Navigate to="/seguridad/403" replace />
  }

  return <Outlet />
}

export default AdminGuard
