import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--hc-bg)' }}>
      <header className="px-6 py-4 flex items-center justify-between w-full" style={{ backgroundColor: 'var(--btn-primary-bg)' }}>
        <div className="flex items-center gap-3 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20">
              <span style={{ color: 'var(--btn-primary-text)' }} className="font-bold">M</span>
            </div>
            <span className="font-semibold text-white">MediCampus</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <Link to="/seguridad/login">
              <Button variant="secondary" size="sm">Iniciar Sesión</Button>
            </Link>
            <Link to="/seguridad/register">
              <button
                className="px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'; }}
              >
                Registrarse
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-2xl">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'var(--btn-primary-bg)' }}>
            <span style={{ color: 'var(--btn-primary-text)' }} className="text-2xl font-bold">M</span>
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--hc-text)' }}>
            Bienestar Universitario
          </h1>
          <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--card-text-muted)' }}>
            Sistema integral de Bienestar Universitario de la Universidad Nacional de Loja.
            Gestiona citas médicas, permisos, exámenes y más.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/seguridad/login">
              <Button variant="primary" className="px-8 py-3 text-base">
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/seguridad/register">
              <Button variant="secondary" className="px-8 py-3 text-base">
                Crear Cuenta
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl w-full">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: 'var(--primary-container)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--on-primary-container)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="font-semibold" style={{ color: 'var(--hc-text)' }}>Citas Médicas</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--card-text-muted)' }}>Programa y gestiona tus citas en línea.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: 'var(--secondary-container)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--on-secondary-container)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="font-semibold" style={{ color: 'var(--hc-text)' }}>Resultados</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--card-text-muted)' }}>Consulta resultados de exámenes médicos.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: 'var(--primary-container)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--on-primary-container)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h3 className="font-semibold" style={{ color: 'var(--hc-text)' }}>Permisos</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--card-text-muted)' }}>Solicita permisos médicos en línea.</p>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs py-4" style={{ color: 'var(--card-text-muted)', borderTop: '1px solid var(--card-border)' }}>
        Universidad Nacional de Loja &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}

export default LandingPage
