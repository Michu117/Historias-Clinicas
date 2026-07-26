import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Card, CardTitle } from '../../components/Card'
import { forgotPassword } from '../utils/authApi'

const ForgotPasswordPage: React.FC = () => {
  const [correo, setCorreo] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!correo.trim()) {
      setError('Ingresa tu correo electrónico.')
      return
    }

    setLoading(true)
    try {
      await forgotPassword({ correo: correo.trim() })
      setSuccess('Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.')
    } catch (err: any) {
      setSuccess('Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.')
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
          <CardTitle>Recuperar Contraseña</CardTitle>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
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

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-global p-3" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-global p-3" role="status">
              {success}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </Button>

          <div className="text-center">
            <Link to="/seguridad/login" className="text-sm text-hc-primary font-medium hover:underline">
              Volver a Iniciar Sesión
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default ForgotPasswordPage
