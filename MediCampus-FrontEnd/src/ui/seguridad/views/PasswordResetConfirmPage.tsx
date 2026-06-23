import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Card, CardTitle } from '../../components/Card'
import { confirmPasswordReset } from '../utils/authApi'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

const PasswordResetConfirmPage: React.FC = () => {
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>()
  const navigate = useNavigate()
  const [clave, setClave] = useState('')
  const [confirmClave, setConfirmClave] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!uidb64 || !token) {
      setError('Enlace inválido.')
      return
    }

    if (!PASSWORD_REGEX.test(clave)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.')
      return
    }

    if (clave !== confirmClave) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      await confirmPasswordReset({ uidb64, token, clave_nueva: clave })
      setDone(true)
    } catch (err: any) {
      if (err.body) {
        try {
          const body = JSON.parse(err.body)
          setError(body.detail || body.clave_nueva?.[0] || 'El enlace es inválido o ha expirado.')
        } catch {
          setError('El enlace es inválido o ha expirado.')
        }
      } else {
        setError(err.message || 'Error al restablecer la contraseña.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--hc-bg)] p-4">
        <Card className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center mb-4">
              <span className="text-hc-primaryText text-xl font-bold">M</span>
            </div>
            <CardTitle>Contraseña Restablecida</CardTitle>
            <p className="text-sm text-[var(--on-surface-variant)] mt-1">Tu contraseña se ha actualizado correctamente.</p>
          </div>
          <Link to="/seguridad/login">
            <Button variant="primary" className="w-full">Iniciar sesión</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--hc-bg)] p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center mb-4">
            <span className="text-hc-primaryText text-xl font-bold">M</span>
          </div>
          <CardTitle>Nueva Contraseña</CardTitle>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">Elige una nueva contraseña para tu cuenta.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Nueva contraseña <span className="text-red-500">*</span></label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                required
                minLength={8}
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
            <p className="text-xs text-[var(--on-surface-variant)] mt-1">Mínimo 8 caracteres, una mayúscula, una minúscula y un número.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Confirmar contraseña <span className="text-red-500">*</span></label>
            <Input type="password" placeholder="••••••••" value={confirmClave} onChange={(e) => setConfirmClave(e.target.value)} required minLength={8} />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-global p-3" role="alert">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Guardando...' : 'Restablecer contraseña'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default PasswordResetConfirmPage
