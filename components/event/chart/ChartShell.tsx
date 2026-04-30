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
 * Pulsing dot HTML/CSS — sostituisce il vecchio dot SVG che con
 * preserveAspectRatio="none" veniva stiracchiato in un'ellisse alta
 * (60→320px) e usciva fuori dall'area del chart.
 *
 * Rende un cerchio in PX puri (sempre perfettamente rotondo) sopra al
 * grafico. Il container deve essere `position: relative` + `overflow: hidden`
 * così il pulse non sfora la card.
 *
 * Posizione: `xPct`/`yPct` 0-100 rispetto al container in cui è renderizzato.
 * Il dot è centrato sulla coordinata (translate(-50%, -50%)).
 */
export function PulsingDotHtml({
  xPct,
  yPct,
  color,
  size = 8,
}: {
  /** 0-100, percentuale orizzontale dentro il container */
  xPct: number
  /** 0-100, percentuale verticale dentro il container */
  yPct: number
  color: string
  /** Diametro del dot statico in px (default 8). Il pulse è 2.2x → ~9px di raggio massimo. */
  size?: number
}) {
  // Padding minimo dai bordi = raggio pulse a piena espansione + 1px buffer.
  // size 8 → pulse 17.6px → raggio 8.8 → clamp 10px.
  const pad = Math.ceil((size * 2.2) / 2) + 1
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        // clamp tiene il centro del dot dentro [pad, container - pad] → pulse mai
        // fuori dalla card (anche con xPct=100, tipico per "ultimo punto").
        left: `clamp(${pad}px, ${xPct}%, calc(100% - ${pad}px))`,
        top: `clamp(${pad}px, ${yPct}%, calc(100% - ${pad}px))`,
        width: size,
        height: size,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      <span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: color,
          animation: 'auktora-chart-pulse 1.6s ease-out infinite',
          transformOrigin: 'center center',
        }}
      />
      <span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 0 1px var(--color-bg-secondary)`,
        }}
      />
    </span>
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
