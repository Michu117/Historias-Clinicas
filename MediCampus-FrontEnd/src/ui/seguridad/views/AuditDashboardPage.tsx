import React, { useEffect, useState, useCallback } from 'react'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { Card, CardTitle } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table'
import { Pagination } from '../../components/Pagination'
import { Button } from '../../components/Button'
import { listAuditLogs, exportAuditLogs, AuditLogEntry, AuditLogFilters } from '../utils/authApi'
import { useAuth } from '../hooks/useAuth'

const ITEMS_PER_PAGE = 8

const TIPO_ACCION_OPTIONS = [
  { value: '', label: 'Todas las acciones' },
  { value: 'registro', label: 'Registro' },
  { value: 'inicio_sesion', label: 'Inicio de sesión' },
  { value: 'inicio_sesion_fallido', label: 'Inicio fallido' },
  { value: 'refresco_token', label: 'Refresco de token' },
  { value: 'cambio_rol', label: 'Cambio de rol' },
]

const AuditDashboardPage: React.FC = () => {
  const { token } = useAuth()
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<AuditLogFilters>({
    fecha_desde: '',
    fecha_hasta: '',
    tipo_accion: '',
    usuario: '',
  })
  const [exporting, setExporting] = useState(false)
  const isAuthenticated = !!token

  const loadLogs = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const data = await listAuditLogs(filters)
      setLogs(data)
      setPage(1)
    } catch {
      // silent fallback
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, filters])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const totalPages = Math.max(1, Math.ceil(logs.length / ITEMS_PER_PAGE))
  const paginatedLogs = logs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const totalAccesses = logs.filter((l) => l.tipoAccion.toLowerCase().includes('inicio de sesi') || l.tipoAccion.toLowerCase().includes('acceso')).length
  const blockedAttempts = logs.filter((l) => l.tipoAccion.toLowerCase().includes('fallido')).length
  const modifications = logs.filter((l) => l.tipoAccion.toLowerCase().includes('cambio') || l.tipoAccion.toLowerCase().includes('registro')).length
  const suspicious = logs.filter((l) => l.detalle?.toLowerCase().includes('sospech') || l.detalle?.toLowerCase().includes('unknown')).length

  return (
    <ProtectedRoute permission="audit.view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--hc-text)]">Auditoría y Logs de Seguridad</h1>
            <p className="text-sm text-[var(--on-surface-variant)] mt-1">Registro de actividades del sistema</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { setExporting(true); exportAuditLogs({ ...filters, formato: 'csv' }).finally(() => setExporting(false)) }} disabled={exporting}>
              {exporting ? 'Exportando...' : 'CSV'}
            </Button>
            <Button variant="secondary" onClick={() => { setExporting(true); exportAuditLogs({ ...filters, formato: 'pdf' }).finally(() => setExporting(false)) }} disabled={exporting}>
              {exporting ? 'Exportando...' : 'PDF'}
            </Button>
            <Button variant="primary" onClick={loadLogs} disabled={loading}>
              {loading ? 'Cargando...' : 'Refrescar'}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-[var(--on-surface-variant)] mb-1">Fecha inicio</label>
            <Input type="date" value={filters.fecha_desde || ''} onChange={(e) => setFilters((p) => ({ ...p, fecha_desde: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--on-surface-variant)] mb-1">Fecha fin</label>
            <Input type="date" value={filters.fecha_hasta || ''} onChange={(e) => setFilters((p) => ({ ...p, fecha_hasta: e.target.value }))} />
          </div>
          <div className="w-48">
            <label className="block text-xs font-medium text-[var(--on-surface-variant)] mb-1">Tipo de acción</label>
            <Select options={TIPO_ACCION_OPTIONS} value={filters.tipo_accion || ''} onChange={(e) => setFilters((p) => ({ ...p, tipo_accion: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--on-surface-variant)] mb-1">Usuario</label>
            <Input type="text" placeholder="Filtrar por correo" value={filters.usuario || ''} onChange={(e) => setFilters((p) => ({ ...p, usuario: e.target.value }))} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <span className="text-sm text-[var(--on-surface-variant)]">Accesos Totales</span>
            <span className="text-3xl font-bold text-[var(--hc-text)] mt-1">{totalAccesses}</span>
            <Badge variant="success">Registros en bitácora</Badge>
          </Card>
          <Card>
            <span className="text-sm text-[var(--on-surface-variant)]">Modificaciones</span>
            <span className="text-3xl font-bold text-[var(--hc-text)] mt-1">{modifications}</span>
            <Badge variant="success">Cambios y registros</Badge>
          </Card>
          <Card>
            <span className="text-sm text-[var(--on-surface-variant)]">Intentos Bloqueados</span>
            <span className="text-3xl font-bold text-[var(--hc-text)] mt-1">{blockedAttempts}</span>
            <Badge variant="danger">Fallidos</Badge>
          </Card>
          <Card>
            <span className="text-sm text-[var(--on-surface-variant)]">Actividades Sospechosas</span>
            <span className="text-3xl font-bold text-[var(--hc-text)] mt-1">{suspicious}</span>
            <Badge variant="warning">Requiere revisión</Badge>
          </Card>
        </div>

        <Card>
          <CardTitle className="mb-4">Registros del Sistema</CardTitle>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Operación</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.fechaHora).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{log.correo}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.tipoAccion.toLowerCase().includes('fallido')
                            ? 'danger'
                            : log.tipoAccion.toLowerCase().includes('cambio')
                              ? 'warning'
                              : 'neutral'
                        }
                      >
                        {log.tipoAccion}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.moduloAfectado}</TableCell>
                    <TableCell className="font-mono text-xs">{log.direccionIp || '—'}</TableCell>
                    <TableCell className="max-w-xs truncate">{log.detalle}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[var(--on-surface-variant)]">
                    {loading ? 'Cargando registros...' : isAuthenticated ? 'No hay registros de auditoría' : 'Inicia sesión para ver los registros'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {logs.length > ITEMS_PER_PAGE && (
            <div className="mt-4 flex justify-end">
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </div>
          )}
        </Card>
      </div>
    </ProtectedRoute>
  )
}

export default AuditDashboardPage
