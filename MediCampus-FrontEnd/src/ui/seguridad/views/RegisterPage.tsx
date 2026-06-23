import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Card, CardTitle } from '../../components/Card'
import { register } from '../utils/authApi'
import { useSession } from '../hooks/useSession'

const SEXO_OPTIONS = [
  { value: 'H', label: 'Hombre' },
  { value: 'M', label: 'Mujer' },
]

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { saveSession } = useSession()
  const [form, setForm] = useState({
    correo: '',
    clave: '',
    confirmarClave: '',
    nombre: '',
    apellido: '',
    cedula: '',
    fechaNacimiento: '',
    sexo: '' as string,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const validatePassword = (pw: string): string[] => {
    const errors: string[] = []
    if (pw.length < 8) errors.push('Mínimo 8 caracteres')
    if (!/[A-Z]/.test(pw)) errors.push('Al menos una mayúscula')
    if (!/[a-z]/.test(pw)) errors.push('Al menos una minúscula')
    if (!/\d/.test(pw)) errors.push('Al menos un número')
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setPasswordErrors([])

    const pwErrors = validatePassword(form.clave)
    if (pwErrors.length > 0) {
      setPasswordErrors(pwErrors)
      return
    }

    if (form.clave !== form.confirmarClave) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      const res = await register({
        correo: form.correo,
        clave: form.clave,
        nombre: form.nombre,
        apellido: form.apellido,
        cedula: form.cedula,
        fechaNacimiento: form.fechaNacimiento,
        sexo: form.sexo,
      })
      saveSession(res.tokens.access, res.tokens.refresh, res.usuario)
      navigate(res.usuario.roles?.[0]?.nombre === 'Administrador' ? '/seguridad/dashboard' : '/home')
    } catch (err: any) {
      if (err.body) {
        try {
          const body = JSON.parse(err.body)
          const messages = Object.values(body).flat().join('. ')
          setError(messages || 'Error al registrarse.')
        } catch {
          setError(err.body || 'Error al registrarse.')
        }
      } else {
        setError(err.message || 'Error al registrarse.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--hc-bg)] p-4">
      <Card className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center mb-4">
            <span className="text-hc-primaryText text-xl font-bold">M</span>
          </div>
          <CardTitle>Crear Cuenta</CardTitle>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">Regístrate en el sistema de MediCampus</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Nombres <span className="text-red-500">*</span></label>
              <Input placeholder="Ana" value={form.nombre} onChange={handleChange('nombre')} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Apellidos <span className="text-red-500">*</span></label>
              <Input placeholder="Pérez" value={form.apellido} onChange={handleChange('apellido')} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Cédula <span className="text-red-500">*</span></label>
            <Input placeholder="0102030405" value={form.cedula} onChange={handleChange('cedula')} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Correo electrónico <span className="text-red-500">*</span></label>
            <Input type="email" placeholder="ana@example.com" value={form.correo} onChange={handleChange('correo')} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Contraseña <span className="text-red-500">*</span></label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.clave} onChange={handleChange('clave')} required className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 bg-transparent border-none outline-none text-[var(--on-surface-variant)] hover:text-[var(--hc-text)] cursor-pointer">
                  <span className="material-symbols-outlined text-[18px] leading-none">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {passwordErrors.length > 0 && (
                <ul className="mt-1 text-xs text-red-600 space-y-0.5">
                  {passwordErrors.map((msg, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <span>✗</span> {msg}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Confirmar contraseña <span className="text-red-500">*</span></label>
              <div className="relative">
                <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={form.confirmarClave} onChange={handleChange('confirmarClave')} required className="pr-10" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 bg-transparent border-none outline-none text-[var(--on-surface-variant)] hover:text-[var(--hc-text)] cursor-pointer">
                  <span className="material-symbols-outlined text-[18px] leading-none">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Fecha de nacimiento <span className="text-red-500">*</span></label>
              <Input type="date" value={form.fechaNacimiento} onChange={handleChange('fechaNacimiento')} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Sexo <span className="text-red-500">*</span></label>
              <Select options={SEXO_OPTIONS} value={form.sexo} onChange={handleChange('sexo')} required />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-global p-3" role="alert">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--on-surface-variant)] mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link to="/seguridad/login" className="text-hc-primary font-medium hover:underline">
            Iniciar Sesión
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default RegisterPage
