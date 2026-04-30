'use client'

import { useEffect, useRef, useState } from 'react'

/** Shared building blocks per i chart event-page. */

export type Period = '1h' | '6h' | '1d' | '7d' | 'all'

export const PERIOD_OPTIONS: ReadonlyArray<{ value: Period; label: string }> = [
  { value: '1h', label: '1H' },
  { value: '6h', label: '6H' },
  { value: '1d', label: '1G' },
  { value: '7d', label: '7G' },
  { value: 'all', label: 'MAX' },
]

export interface PricePoint {
  timestamp: string
  yes_price: number
  no_price: number
}

export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      {children}
    </div>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        margin: 0,
        fontSize: 'var(--font-sm)',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </h3>
  )
}

export function CenteredBox({
  children,
  height = 320,
}: {
  children: React.ReactNode
  height?: number
}) {
  return (
    <div
      style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-1)',
      }}
    >
      {children}
    </div>
  )
}

/* ============================================================
 *  PRIMITIVI INTERATTIVITÀ CHART (hover, pulsing dot, flash)
 * ============================================================ */

/**
 * Hook che ritorna la posizione del cursore relativa a un container chart
 * normalizzata 0-1 sull'asse X. Null quando il cursore esce.
 */
export function useChartHover(): {
  bind: { onMouseMove: (e: React.MouseEvent) => void; onMouseLeave: () => void }
  /** 0 = sinistra, 1 = destra. null se fuori. */
  xRatio: number | null
  /** Mouse Y in px relativo al container — utile per posizionare tooltip. */
  yPx: number | null
} {
  const [xRatio, setXRatio] = useState<number | null>(null)
  const [yPx, setYPx] = useState<number | null>(null)
  return {
    xRatio,
    yPx,
    bind: {
      onMouseMove: (e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        if (rect.width <= 0) return
        const x = (e.clientX - rect.left) / rect.width
        setXRatio(Math.max(0, Math.min(1, x)))
        setYPx(e.clientY - rect.top)
      },
      onMouseLeave: () => {
        setXRatio(null)
        setYPx(null)
      },
    },
  }
}

/**
 * Pulsing dot SVG keyframe. Da inserire come `<PulsingDot cx={...} cy={...}
 * fill="..." />` dentro un SVG. Doppia animazione: cerchio interno fisso,
 * alone esterno che si espande+fade.
 */
export function PulsingDot({
  cx,
  cy,
  color,
  radius = 1.2,
}: {
  cx: number
  cy: number
  color: string
  radius?: number
}) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={radius * 2.5}
        fill={color}
        opacity={0.35}
        style={{
          animation: 'auktora-chart-pulse 1.6s ease-out infinite',
          transformOrigin: `${cx}px ${cy}px`,
          transformBox: 'fill-box',
        }}
      />
      <circle cx={cx} cy={cy} r={radius} fill={color} />
    </g>
  )
}

/**
 * Hook che ritorna `true` per ~250ms ogni volta che `value` cambia.
 * Usato per applicare una classe "flash" al label valore.
 */
export function useFlashOnChange<T>(value: T): boolean {
  const [flash, setFlash] = useState(false)
  const prevRef = useRef<T>(value)
  useEffect(() => {
    if (prevRef.current === value) return
    prevRef.current = value
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlash(true)
    const t = setTimeout(() => setFlash(false), 280)
    return () => clearTimeout(t)
  }, [value])
  return flash
}

/**
 * Indicatore "Live" + timestamp ultimo update relativo che ticchetta ogni 1s.
 * Mostra "ora", "Xs fa", "Xm fa" — mai più di 60m perché oltre il chart
 * non è più "live" davvero.
 */
export function LastUpdateTicker({ lastUpdateMs }: { lastUpdateMs: number | null }) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  if (now === null) return null
  if (lastUpdateMs === null) return null
  const sec = Math.max(0, Math.floor((now - lastUpdateMs) / 1000))
  const label = sec < 2 ? 'ora' : sec < 60 ? `${sec}s fa` : `${Math.floor(sec / 60)}m fa`
  return (
    <span
      style={{
        fontSize: 9,
        color: sec < 5 ? 'var(--color-success)' : 'var(--color-text-muted)',
        letterSpacing: '0.04em',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {sec < 5 && '● '}
      {label}
    </span>
  )
}

export function PeriodTabs({
  period,
  onChange,
}: {
  period: Period
  onChange: (p: Period) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            padding: '4px 8px',
            background: period === opt.value ? 'var(--color-cta)' : 'var(--color-bg-tertiary)',
            color: period === opt.value ? '#fff' : 'var(--color-text-muted)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 9,
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
