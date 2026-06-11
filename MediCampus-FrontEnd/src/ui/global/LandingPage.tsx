import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-hc-bg">
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-hc-primary rounded-full flex items-center justify-center">
            <span className="text-hc-primaryText font-bold">M</span>
          </div>
          <span className="font-semibold text-slate-900">MediCampus</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/seguridad/login">
            <Button variant="tertiary">Iniciar Sesión</Button>
          </Link>
          <Link to="/seguridad/register">
            <Button variant="primary">Registrarse</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-2xl">
          <div className="w-16 h-16 bg-hc-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-hc-primaryText text-2xl font-bold">M</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Bienestar Universitario
          </h1>
          <p className="text-lg text-slate-500 mb-8 leading-relaxed">
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
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="font-semibold text-slate-900">Citas Médicas</h3>
            <p className="text-sm text-slate-500 mt-1">Programa y gestiona tus citas en línea.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="font-semibold text-slate-900">Resultados</h3>
            <p className="text-sm text-slate-500 mt-1">Consulta resultados de exámenes médicos.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h3 className="font-semibold text-slate-900">Permisos</h3>
            <p className="text-sm text-slate-500 mt-1">Solicita permisos médicos en línea.</p>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-200">
        Universidad Nacional de Loja &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}

export default LandingPage
