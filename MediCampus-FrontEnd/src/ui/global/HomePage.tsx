import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card, CardTitle } from '../components/Card'
import { NotificationBell } from '../notificaciones'
import { useNotifications, useMarkAsRead } from '../notificaciones'
import { useAuth } from '../agendas/hooks/useAuth'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { notifications, isLoading, error } = useNotifications()
  const markAsRead = useMarkAsRead()
  const { isProfessional } = useAuth()
  const userName = localStorage.getItem('currentUser')
    ? JSON.parse(localStorage.getItem('currentUser') || '{}').correo
    : 'Usuario'

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--hc-bg)' }}>
      <header className="text-white px-6 py-4 flex items-center justify-between" style={{ backgroundColor: 'var(--btn-primary-bg)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="font-bold">M</span>
          </div>
          <h1 className="text-lg font-semibold">MediCampus</h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell
            notifications={notifications}
            isLoading={isLoading}
            onMarkAsRead={markAsRead}
            error={error || undefined}
            buttonClassName="text-white/80 hover:text-white"
          />
          <span className="text-sm text-white/80">{userName}</span>
          <Button variant="secondary" size="sm" onClick={() => { localStorage.clear(); navigate('/seguridad/login') }}>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <Card className="mb-6">
          <CardTitle>Bienvenido a MediCampus</CardTitle>
          <p className="mt-2" style={{ color: 'var(--card-text-muted)' }}>
            Sistema de Bienestar Universitario de la Universidad Nacional de Loja.
          </p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-semibold" style={{ color: 'var(--hc-text)' }}>Mis Citas Médicas</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--card-text-muted)' }}>Programa y consulta tus citas médicas.</p>
            <Button variant="primary" className="mt-3" onClick={() => navigate('/AgendarCita')}>
              Ir a Citas
            </Button>
          </Card>
          <Card>
            <h3 className="font-semibold" style={{ color: 'var(--hc-text)' }}>Mis Citas</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--card-text-muted)' }}>Revisa, reprograma o cancela tus citas agendadas.</p>
            <Button variant="primary" className="mt-3" onClick={() => navigate('/mis-citas')}>
              Ver Mis Citas
            </Button>
          </Card>
          <Card>
            <h3 className="font-semibold" style={{ color: 'var(--hc-text)' }}>Mi Historia</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--card-text-muted)' }}>Revisa los detalles de tu historia clinica.</p>
            <Button variant="primary" className="mt-3" onClick={() => navigate('/historias/mi-historia')}>
              Ver Mi Historia
            </Button>
          </Card>
          {isProfessional && (
            <Card>
              <h3 className="font-semibold" style={{ color: 'var(--hc-text)' }}>Administración de Citas</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--card-text-muted)' }}>Gestiona la agenda diaria de atención a pacientes.</p>
              <Button variant="primary" className="mt-3" onClick={() => navigate('/agendas/mi-agenda')}>
                Ir a Mi Agenda
              </Button>
            </Card>
          )}
        </div>
      </main>

      <footer className="text-center text-xs py-4" style={{ color: 'var(--card-text-muted)', borderTop: '1px solid var(--card-border)' }}>
        Universidad Nacional de Loja &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}

export default HomePage
