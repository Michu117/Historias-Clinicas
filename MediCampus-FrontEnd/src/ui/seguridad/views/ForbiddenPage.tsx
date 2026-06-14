import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'

const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9ff] p-4">
      <Card className="w-full max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#dc2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.636z" />
          </svg>
        </div>
        <h1 className="text-6xl font-bold text-slate-800 mb-2">403</h1>
        <h2 className="text-xl font-semibold text-[#424752] mb-2">Acceso Denegado</h2>
        <p className="text-[#424752] mb-6">
          No tienes permisos para acceder a este módulo. Contacta al administrador del sistema si consideras que esto es un error.
        </p>
        <Button variant="primary" onClick={() => navigate('/seguridad/dashboard')}>
          Volver al Dashboard
        </Button>
      </Card>
    </div>
  )
}

export default ForbiddenPage
