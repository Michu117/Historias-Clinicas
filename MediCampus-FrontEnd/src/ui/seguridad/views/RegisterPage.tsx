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

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

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
      navigate('/seguridad/dashboard')
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
    <div className="min-h-screen flex items-center justify-center bg-hc-bg p-4">
      <Card className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-hc-primary rounded-full flex items-center justify-center mb-4">
            <span className="text-hc-primaryText text-xl font-bold">M</span>
          </div>
          <CardTitle>Crear Cuenta</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Regístrate en el sistema de MediCampus</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombres</label>
              <Input placeholder="Ana" value={form.nombre} onChange={handleChange('nombre')} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos</label>
              <Input placeholder="Pérez" value={form.apellido} onChange={handleChange('apellido')} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cédula</label>
            <Input placeholder="0102030405" value={form.cedula} onChange={handleChange('cedula')} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
            <Input type="email" placeholder="ana@example.com" value={form.correo} onChange={handleChange('correo')} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
              <Input type="password" placeholder="••••••••" value={form.clave} onChange={handleChange('clave')} required minLength={8} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar contraseña</label>
              <Input type="password" placeholder="••••••••" value={form.confirmarClave} onChange={handleChange('confirmarClave')} required minLength={8} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de nacimiento</label>
              <Input type="date" value={form.fechaNacimiento} onChange={handleChange('fechaNacimiento')} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
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

        <p className="text-center text-sm text-slate-500 mt-4">
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
