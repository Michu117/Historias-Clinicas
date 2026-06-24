import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Card, CardTitle } from '../../components/Card'
import { login, User } from '../utils/authApi'
import { useSession } from '../hooks/useSession'
import { normalizeRole } from '../../historias-clinicas/utils/historiaClinicaPermissions'

const PROFESSIONAL_ROLES = [
  'medico',
  'odontologo',
  'psicologo',
  'trabajador_social',
  'trabajo_social',
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { saveSession } = useSession()
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login({ correo, clave })
      saveSession(res.tokens.access, res.tokens.refresh, res.usuario)

      localStorage.setItem('access_token', res.tokens.access);

      if (res.usuario.mustChangePassword) {
        navigate('/seguridad/cambiar-clave');
        return;
      }

      const roleName = res.usuario.roles?.[0]?.nombre?.toLowerCase() || '';
      if (PROFESSIONAL_ROLES.includes(roleName)) {
        navigate('/agendas/mi-agenda');
      } else if (roleName === 'admin' || roleName === 'administrador') {
        navigate('/seguridad/dashboard');
      } else {
        navigate('/home');
      }
    } catch (err: any) {
      if (err.status === 400) {
        setError('Credenciales inválidas. Verifica tu correo y contraseña.')
      } else {
        setError(err.message || 'Error al iniciar sesión. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--hc-bg)] p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center mb-4">
            <span className="text-hc-primaryText text-xl font-bold">M</span>
          </div>
          <CardTitle>Iniciar Sesión</CardTitle>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">Accede al panel de seguridad de MediCampus</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Correo electrónico <span className="text-red-500">*</span></label>
            <Input
              type="email"
              placeholder="tu@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Contraseña <span className="text-red-500">*</span></label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 bg-transparent border-none outline-none text-[var(--on-surface-variant)] hover:text-[var(--hc-text)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] leading-none">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-global p-3" role="alert">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>

          <div className="text-center">
            <Link to="/seguridad/forgot-password" className="text-sm text-hc-primary font-medium hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>

        <p className="text-center text-sm text-[var(--on-surface-variant)] mt-4">
          ¿No tienes cuenta?{' '}
          <Link to="/seguridad/register" className="text-hc-primary font-medium hover:underline">
            Registrarse
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default LoginPage
