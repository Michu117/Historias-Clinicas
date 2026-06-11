import React, { useEffect, useState, useCallback } from 'react'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { Card, CardTitle } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table'
import { Pagination } from '../../components/Pagination'
import { Button } from '../../components/Button'
import { listAuditLogs, AuditLogEntry } from '../utils/authApi'
import { useAuth } from '../hooks/useAuth'

const ITEMS_PER_PAGE = 8

const AuditDashboardPage: React.FC = () => {
  const { token } = useAuth()
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const isAuthenticated = !!token

  const loadLogs = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const data = await listAuditLogs()
      setLogs(data)
    } catch {
      // silent fallback
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const totalPages = Math.max(1, Math.ceil(logs.length / ITEMS_PER_PAGE))
  const paginatedLogs = logs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const totalAccesses = logs.length
  const blockedAttempts = logs.filter((l) => l.tipoAccion.toLowerCase().includes('fallido')).length
  const modifications = logs.filter((l) => l.tipoAccion.toLowerCase().includes('cambio') || l.tipoAccion.toLowerCase().includes('registro')).length
  const suspicious = logs.filter((l) => l.detalle?.toLowerCase().includes('sospech') || l.detalle?.toLowerCase().includes('unknown')).length

  return (
    <ProtectedRoute permission="audit.view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Auditoría y Logs de Seguridad</h1>
            <p className="text-sm text-slate-500 mt-1">Registro de actividades del sistema</p>
          </div>
          <Button variant="primary" onClick={loadLogs} disabled={loading}>
            {loading ? 'Cargando...' : 'Refrescar'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <span className="text-sm text-slate-500">Accesos Totales</span>
            <span className="text-3xl font-bold text-slate-900 mt-1">{totalAccesses}</span>
            <Badge variant="success">Registros en bitácora</Badge>
          </Card>
          <Card>
            <span className="text-sm text-slate-500">Modificaciones</span>
            <span className="text-3xl font-bold text-slate-900 mt-1">{modifications}</span>
            <Badge variant="success">Cambios y registros</Badge>
          </Card>
          <Card>
            <span className="text-sm text-slate-500">Intentos Bloqueados</span>
            <span className="text-3xl font-bold text-slate-900 mt-1">{blockedAttempts}</span>
            <Badge variant="danger">Fallidos</Badge>
          </Card>
          <Card>
            <span className="text-sm text-slate-500">Actividades Sospechosas</span>
            <span className="text-3xl font-bold text-slate-900 mt-1">{suspicious}</span>
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
                    <TableCell className="max-w-xs truncate">{log.detalle}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400">
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
