import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Card, CardTitle } from '../../components/Card'
import { login } from '../utils/authApi'
import { useSession } from '../hooks/useSession'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { saveSession } = useSession()
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login({ correo, clave })
      saveSession(res.tokens.access, res.tokens.refresh, res.usuario)
      navigate('/seguridad/dashboard')
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
    <div className="min-h-screen flex items-center justify-center bg-hc-bg p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-hc-primary rounded-full flex items-center justify-center mb-4">
            <span className="text-hc-primaryText text-xl font-bold">M</span>
          </div>
          <CardTitle>Iniciar Sesión</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Accede al panel de seguridad de MediCampus</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-global p-3" role="alert">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
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
