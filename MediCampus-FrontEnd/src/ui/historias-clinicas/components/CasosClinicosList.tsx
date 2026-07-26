import { useState } from 'react'
import type { ConsultaClinico } from '../types/consultaClinico.types'

type Props = {
  casos: ConsultaClinico[]
}

const ESTADO_BADGE: Record<string, { bg: string; text: string }> = {
  CERRADO: { bg: '#dcfce7', text: '#166534' },
  CANCELADO: { bg: '#fef2f2', text: '#991b1b' },
  NO_ASISTIO: { bg: '#fef9c3', text: '#854d0e' },
}

function formatFecha(fecha?: string) {
  if (!fecha) return { date: '', time: '' }
  const d = new Date(fecha)
  const date = d.toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' })
  const time = d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
  return { date, time }
}

export default function CasosClinicosList({ casos }: Props) {
  const [actual, setActual] = useState(0)
  const total = casos.length

  if (total === 0) {
    return <p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>Sin casos clínicos registrados</p>
  }

  const c = casos[actual]
  const { date, time } = formatFecha(c.fecha)
  const estadoVisual = c.estadoCaso || c.estado
  const badge = ESTADO_BADGE[estadoVisual] ?? { bg: '#e0f2fe', text: '#075985' }
  const servicios = c.servicios?.join(', ') || ''
  const profesional = c.profesional || ''
  const motivo = c.motivo || ''

  return (
    <div className="w-full">
      <style>{`
        @media (min-width: 640px) {
          .casos-grid {
            grid-template-columns: 1.2fr 1fr 1fr 1.2fr auto !important;
          }
        }
      `}</style>

      <div
        className="casos-grid grid grid-cols-2 items-center rounded-lg"
        style={{
          border: '1px solid var(--card-border)',
          backgroundColor: 'var(--card-bg)',
          padding: '18px 22px',
          gap: 24,
          minHeight: 90,
        }}
      >
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--card-text-muted)' }}>Fecha y hora</p>
          <p className="mt-0.5 text-sm font-medium leading-snug sm:text-base" style={{ color: 'var(--on-surface)' }}>{date}</p>
          {time && <p className="text-[11px] leading-snug" style={{ color: 'var(--card-text-muted)' }}>{time}</p>}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--card-text-muted)' }}>Servicio</p>
          <p className="mt-0.5 truncate text-sm font-medium leading-snug sm:text-base" style={{ color: 'var(--on-surface)' }}>{servicios || '—'}</p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--card-text-muted)' }}>Profesional</p>
          <p className="mt-0.5 truncate text-sm font-medium leading-snug sm:text-base" style={{ color: 'var(--on-surface)' }}>{profesional || '—'}</p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--card-text-muted)' }}>Motivo</p>
          <p className="mt-0.5 truncate text-sm font-medium leading-snug sm:text-base" style={{ color: 'var(--on-surface)' }}>{motivo || '—'}</p>
        </div>
        <div className="flex items-center justify-end">
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold sm:text-sm" style={{ backgroundColor: badge.bg, color: badge.text }}>
            {estadoVisual}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center" style={{ gap: 24, marginTop: 10 }}>
        <button
          type="button"
          disabled={actual === 0}
          onClick={() => setActual(prev => Math.max(0, prev - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-base transition-colors disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9 sm:text-lg"
          style={{ color: 'var(--on-surface)', border: '1px solid var(--card-border)' }}
          aria-label="Anterior"
        >
          ‹
        </button>

        <p className="text-sm font-medium" style={{ color: 'var(--card-text-muted)' }}>
          {actual + 1} de {total}
        </p>

        <button
          type="button"
          disabled={actual >= total - 1}
          onClick={() => setActual(prev => Math.min(total - 1, prev + 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-base transition-colors disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9 sm:text-lg"
          style={{ color: 'var(--on-surface)', border: '1px solid var(--card-border)' }}
          aria-label="Siguiente"
        >
          ›
        </button>
      </div>
    </div>
  )
}
