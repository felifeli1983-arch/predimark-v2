'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Loader2, Target } from 'lucide-react'

interface CalibrationBucket {
  predicted_range: string
  predicted_avg: number
  actual_rate: number
  count: number
}

/**
 * N1 — Calibration curve in /me/stats.
 * X-axis: probabilità predetta (0-100%). Y-axis: actual win rate.
 * Linea ideale = diagonale (perfect calibration). Scatter sopra la linea = under-confidence.
 */
export function CalibrationCurve() {
  const { ready, authenticated, getAccessToken } = usePrivy()
  const [buckets, setBuckets] = useState<CalibrationBucket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready || !authenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const res = await fetch('/api/v1/users/me/calibration', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok && !cancelled) {
          const data = (await res.json()) as { buckets: CalibrationBucket[] }
          setBuckets(data.buckets ?? [])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, authenticated, getAccessToken])

  const chart = useMemo(() => {
    if (buckets.length === 0) return null
    const width = 100
    const height = 100
    const points = buckets.map((b) => ({
      x: b.predicted_avg * 100,
      y: b.actual_rate * 100,
      count: b.count,
      label: b.predicted_range,
    }))
    return { points, width, height }
  }, [buckets])

  return (
    <div
      style={{
        padding: 'var(--space-3)',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 'var(--font-md)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
        }}
      >
        <Target size={14} style={{ display: 'inline', marginRight: 6 }} />
        Calibration curve
      </h3>
      <p
        style={{
          margin: '4px 0 12px',
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
        }}
      >
        Quanto sono accurate le tue predizioni? Dot vicini alla diagonale = ben calibrato.
      </p>

      {loading ? (
        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
      ) : !chart || chart.points.length === 0 ? (
        <div
          style={{
            padding: 'var(--space-3)',
            fontSize: 'var(--font-xs)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
          }}
        >
          Servono almeno 20 trade resolved per calcolare la curva. Continua a tradare!
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            maxWidth: 400,
            height: 'auto',
            display: 'block',
            margin: '0 auto',
          }}
          role="img"
          aria-label="Calibration curve"
        >
          {/* Quadrant grid */}
          {[25, 50, 75].map((tick) => (
            <g key={tick}>
              <line
                x1={tick}
                y1={0}
                x2={tick}
                y2={chart.height}
                stroke="var(--color-border-subtle)"
                strokeWidth={0.2}
                strokeDasharray="1,1"
              />
              <line
                x1={0}
                y1={chart.height - tick}
                x2={chart.width}
                y2={chart.height - tick}
                stroke="var(--color-border-subtle)"
                strokeWidth={0.2}
                strokeDasharray="1,1"
              />
            </g>
          ))}
          {/* Diagonal ideale */}
          <line
            x1={0}
            y1={chart.height}
            x2={chart.width}
            y2={0}
            stroke="var(--color-text-muted)"
            strokeWidth={0.4}
            strokeDasharray="2,2"
          />
          {/* Scatter user points */}
          {chart.points.map((p, i) => {
            const r = Math.min(2 + Math.log(p.count + 1) / 2, 4)
            return (
              <circle
                key={i}
                cx={p.x}
                cy={chart.height - p.y}
                r={r}
                fill="var(--color-cta)"
                fillOpacity={0.7}
                stroke="var(--color-cta)"
                strokeWidth={0.3}
              >
                <title>
                  {p.label}: predicted {p.x.toFixed(1)}%, actual {p.y.toFixed(1)}% (n={p.count})
                </title>
              </circle>
            )
          })}
        </svg>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 6,
          fontSize: 9,
          color: 'var(--color-text-muted)',
        }}
      >
        <span>0% predetta</span>
        <span>50%</span>
        <span>100% predetta</span>
      </div>
    </div>
  )
}
