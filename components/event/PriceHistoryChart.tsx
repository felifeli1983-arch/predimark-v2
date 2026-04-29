'use client'

import { useEffect, useState, useMemo } from 'react'
import { Loader2, TrendingUp } from 'lucide-react'

interface PricePoint {
  timestamp: string
  yes_price: number
  no_price: number
}

type Period = '1d' | '7d' | '30d' | 'all'

interface Props {
  marketId: string
}

/**
 * Sprint 3.5.2 — Chart storia probabilità.
 * Custom SVG line chart (no recharts dep), legge price_history table.
 * Fallback Polymarket Gamma API se DB vuoto.
 */
export function PriceHistoryChart({ marketId }: Props) {
  const [period, setPeriod] = useState<Period>('7d')
  const [points, setPoints] = useState<PricePoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!marketId) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    ;(async () => {
      try {
        const res = await fetch(
          `/api/v1/markets/${encodeURIComponent(marketId)}/price-history?period=${period}`
        )
        if (!res.ok) {
          if (!cancelled) setPoints([])
          return
        }
        const data = (await res.json()) as { items: PricePoint[] }
        if (!cancelled) setPoints(data.items ?? [])
      } catch {
        if (!cancelled) setPoints([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [marketId, period])

  const chartData = useMemo(() => {
    if (points.length < 2) return null
    const width = 100
    const height = 60
    const ys = points.map((p) => p.yes_price)
    const min = Math.max(0, Math.min(...ys) - 0.05)
    const max = Math.min(1, Math.max(...ys) + 0.05)
    const range = max - min || 1
    const path = points
      .map((p, i) => {
        const x = (i / (points.length - 1)) * width
        const y = height - ((p.yes_price - min) / range) * height
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')
    const lastPrice = ys[ys.length - 1] ?? 0
    const firstPrice = ys[0] ?? 0
    const delta = lastPrice - firstPrice
    return { path, lastPrice, delta, min, max, width, height }
  }, [points])

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
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
            <TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} />
            Storia probabilità YES
          </h3>
          {chartData && (
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 'var(--font-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
              Attuale:{' '}
              <strong style={{ color: 'var(--color-text-primary)' }}>
                {(chartData.lastPrice * 100).toFixed(1)}%
              </strong>
              {' · '}
              <span
                style={{
                  color: chartData.delta >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                }}
              >
                {chartData.delta >= 0 ? '+' : ''}
                {(chartData.delta * 100).toFixed(1)}% ({period})
              </span>
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['1d', '7d', '30d', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              style={{
                padding: '4px 8px',
                background: period === p ? 'var(--color-cta)' : 'var(--color-bg-tertiary)',
                color: period === p ? '#fff' : 'var(--color-text-muted)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 9,
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
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
      ) : !chartData ? (
        <div
          style={{
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-xs)',
            lineHeight: 1.4,
            textAlign: 'center',
            padding: 'var(--space-2)',
          }}
        >
          Storia in raccolta. Cron daily sync popola price_history table — chart visibile dopo 24h.
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${chartData.width} ${chartData.height}`}
          preserveAspectRatio="none"
          style={{ width: '100%', height: 120 }}
          role="img"
          aria-label="Probability history chart"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((y) => {
            const yPos =
              chartData.height -
              ((y - chartData.min) / (chartData.max - chartData.min)) * chartData.height
            if (yPos < 0 || yPos > chartData.height) return null
            return (
              <line
                key={y}
                x1={0}
                y1={yPos}
                x2={chartData.width}
                y2={yPos}
                stroke="var(--color-border-subtle)"
                strokeWidth={0.2}
                strokeDasharray="1,1"
              />
            )
          })}
          {/* Area fill */}
          <path
            d={`${chartData.path} L${chartData.width},${chartData.height} L0,${chartData.height} Z`}
            fill="var(--color-cta)"
            fillOpacity={0.1}
          />
          {/* Line */}
          <path
            d={chartData.path}
            stroke="var(--color-cta)"
            strokeWidth={1}
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </div>
  )
}
