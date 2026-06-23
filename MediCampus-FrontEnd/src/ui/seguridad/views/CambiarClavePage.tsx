import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Card, CardTitle } from '../../components/Card'
import { changePassword } from '../utils/authApi'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

const CambiarClavePage: React.FC = () => {
  const navigate = useNavigate()
  const [clave, setClave] = useState('')
  const [confirmClave, setConfirmClave] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

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
      await changePassword({ clave_nueva: clave })
      navigate('/home')
    } catch (err: any) {
      if (err.status === 400) {
        setError('La contraseña no cumple con los requisitos de seguridad.')
      } else {
        setError(err.message || 'Error al cambiar la contraseña.')
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
          <CardTitle>Cambiar Contraseña</CardTitle>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">Debes cambiar tu contraseña antes de continuar.</p>
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
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmClave}
                onChange={(e) => setConfirmClave(e.target.value)}
                required
                minLength={8}
                className="pr-10"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-global p-3" role="alert">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default CambiarClavePage
