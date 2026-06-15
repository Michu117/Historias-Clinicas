import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card, CardTitle } from '../components/Card'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const userName = localStorage.getItem('currentUser')
    ? JSON.parse(localStorage.getItem('currentUser') || '{}').correo
    : 'Usuario'

  return (
    <div className="min-h-screen flex flex-col bg-hc-bg">
      <header className="bg-hc-primary text-hc-primaryText px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="font-bold">M</span>
          </div>
          <h1 className="text-lg font-semibold">MediCampus</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/80">{userName}</span>
          <Button variant="secondary" size="sm" onClick={() => { localStorage.clear(); navigate('/seguridad/login') }}>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <Card className="mb-6">
          <CardTitle>Bienvenido a MediCampus</CardTitle>
          <p className="text-slate-500 mt-2">
            Sistema de Bienestar Universitario de la Universidad Nacional de Loja.
          </p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-semibold text-slate-900">Mis Citas Médicas</h3>
            <p className="text-sm text-slate-500 mt-1">Programa y consulta tus citas médicas.</p>
            <Button variant="primary" className="mt-3" onClick={() => navigate('/AgendarCita')}>
              Ir a Citas
            </Button>
          </Card>
          <Card>
            <h3 className="font-semibold text-slate-900">Resultados de Exámenes</h3>
            <p className="text-sm text-slate-500 mt-1">Revisa los resultados de tus exámenes médicos.</p>
            <Button variant="primary" className="mt-3" onClick={() => navigate('/seguridad/login')}>
              Ver Resultados
            </Button>
          </Card>
          <Card>
            <h3 className="font-semibold text-slate-900">Solicitar Permiso Médico</h3>
            <p className="text-sm text-slate-500 mt-1">Tramita permisos médicos en línea.</p>
            <Button variant="primary" className="mt-3" onClick={() => navigate('/seguridad/login')}>
              Solicitar
            </Button>
          </Card>
          <Card>
            <h3 className="font-semibold text-slate-900">Notificaciones</h3>
            <p className="text-sm text-slate-500 mt-1">Revisa tus notificaciones pendientes.</p>
            <Button variant="primary" className="mt-3" onClick={() => navigate('/seguridad/login')}>
              Ver Notificaciones
            </Button>
          </Card>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-200">
        Universidad Nacional de Loja &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}

export default HomePage
