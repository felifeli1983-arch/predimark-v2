'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface Props {
  /** Symbol Binance es. 'btcusdt' (case-insensitive). */
  symbol: string
  /** Intervallo Binance: 1m,5m,15m,1h,4h,1d. Default 1h. */
  interval?: string
  /** Numero candele da fetchare. Default 48. */
  limit?: number
}

interface Candle {
  t: number
  o: number
  h: number
  l: number
  c: number
}

const PERIODS: ReadonlyArray<{ label: string; interval: string; limit: number }> = [
  { label: '1H', interval: '1m', limit: 60 },
  { label: '6H', interval: '5m', limit: 72 },
  { label: '24H', interval: '15m', limit: 96 },
  { label: '7G', interval: '1h', limit: 168 },
  { label: '30G', interval: '4h', limit: 180 },
]

/**
 * Sprint "Make Event Page Real" — chart prezzo crypto sottostante da Binance.
 * Public REST API, no auth, fetch on mount + on period change.
 * Render: SVG area + line (close price). Tooltip su hover (basic).
 */
export function CryptoCandleChart({ symbol }: Props) {
  const [periodIdx, setPeriodIdx] = useState(2) // default 24H
  const [candles, setCandles] = useState<Candle[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const period = PERIODS[periodIdx]!

  useEffect(() => {
    if (!symbol) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCandles(null)
    setError(null)
    ;(async () => {
      try {
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${period.interval}&limit=${period.limit}`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as Array<
          [number, string, string, string, string, ...unknown[]]
        >
        if (cancelled) return
        const parsed: Candle[] = data
          .map((row) => ({
            t: row[0],
            o: parseFloat(row[1]),
            h: parseFloat(row[2]),
            l: parseFloat(row[3]),
            c: parseFloat(row[4]),
          }))
          .filter((c) => Number.isFinite(c.c))
        setCandles(parsed)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Errore')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [symbol, period.interval, period.limit])

  const chart = useMemo(() => {
    if (!candles || candles.length < 2) return null
    const width = 100
    const height = 60
    const closes = candles.map((c) => c.c)
    const min = Math.min(...closes)
    const max = Math.max(...closes)
    const range = max - min || 1
    const path = candles
      .map((c, i) => {
        const x = (i / (candles.length - 1)) * width
        const y = height - ((c.c - min) / range) * height
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')
    const first = closes[0] ?? 0
    const last = closes[closes.length - 1] ?? 0
    const change = first > 0 ? ((last - first) / first) * 100 : 0
    return { path, min, max, width, height, last, change }
  }, [candles])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 'var(--font-xs)',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          {symbol.toUpperCase()} · Binance
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {PERIODS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setPeriodIdx(i)}
              style={{
                padding: '3px 8px',
                background: i === periodIdx ? 'var(--color-cta)' : 'var(--color-bg-tertiary)',
                color: i === periodIdx ? '#fff' : 'var(--color-text-muted)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 9,
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {!candles && !error ? (
        <div
          style={{
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Loader2
            size={20}
            className="animate-spin"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </div>
      ) : error || !chart ? (
        <div
          style={{
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-xs)',
            textAlign: 'center',
            padding: 'var(--space-2)',
          }}
        >
          {error ? `Feed Binance non disponibile (${error}).` : 'Dati insufficienti.'}
        </div>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${chart.width} ${chart.height}`}
            preserveAspectRatio="none"
            style={{ width: '100%', height: 120 }}
            role="img"
            aria-label={`${symbol} price chart`}
          >
            {[0, 0.25, 0.5, 0.75, 1].map((y) => (
              <line
                key={y}
                x1={0}
                y1={chart.height - y * chart.height}
                x2={chart.width}
                y2={chart.height - y * chart.height}
                stroke="var(--color-border-subtle)"
                strokeWidth={0.2}
                strokeDasharray="1,1"
              />
            ))}
            <path
              d={`${chart.path} L${chart.width},${chart.height} L0,${chart.height} Z`}
              fill={chart.change >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}
              fillOpacity={0.1}
            />
            <path
              d={chart.path}
              stroke={chart.change >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}
              strokeWidth={1.2}
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div
            style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-muted)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            Min ${chart.min.toLocaleString('en-US', { maximumFractionDigits: 2 })} · Max $
            {chart.max.toLocaleString('en-US', { maximumFractionDigits: 2 })} ·{' '}
            <span
              style={{
                color: chart.change >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                fontWeight: 700,
              }}
            >
              {chart.change >= 0 ? '+' : ''}
              {chart.change.toFixed(2)}% finestra
            </span>
          </div>
        </>
      )}
    </div>
  )
}
