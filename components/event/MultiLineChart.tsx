'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, TrendingUp } from 'lucide-react'
import {
  CenteredBox,
  Container,
  PERIOD_OPTIONS,
  PeriodTabs,
  SectionTitle,
  type Period,
  type PricePoint,
} from './chart/ChartShell'

const OUTCOME_COLORS = [
  'var(--color-cta)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-danger)',
  'var(--color-text-secondary)',
]

export interface MultiMarket {
  tokenId: string
  label: string
}

interface SeriesData {
  label: string
  color: string
  points: PricePoint[]
}

interface Props {
  markets: MultiMarket[]
}

/**
 * Sprint 3.5.5 — Chart multi-linea per multi_outcome.
 * Una curva per outcome (max 5 — top 5 per probabilità).
 * Asse Y normalizzato 0–1 (probabilità implicita).
 */
export function MultiLineChart({ markets }: Props) {
  const [period, setPeriod] = useState<Period>('7d')
  const [series, setSeries] = useState<SeriesData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (markets.length === 0) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    ;(async () => {
      const results = await Promise.all(
        markets.map(async (m, i) => {
          try {
            const res = await fetch(
              `/api/v1/markets/${encodeURIComponent(m.tokenId)}/price-history?period=${period}`
            )
            if (!res.ok) return null
            const data = (await res.json()) as { items: PricePoint[] }
            const color = OUTCOME_COLORS[i % OUTCOME_COLORS.length] ?? 'var(--color-cta)'
            return {
              label: m.label,
              color,
              points: data.items ?? [],
            } satisfies SeriesData
          } catch {
            return null
          }
        })
      )
      if (!cancelled) {
        setSeries(results.filter((r): r is SeriesData => r !== null && r.points.length >= 2))
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [markets, period])

  const width = 100
  const height = 60

  const paths = useMemo(() => {
    return series.map((s) => {
      const path = s.points
        .map((p, i) => {
          const x = (i / (s.points.length - 1)) * width
          const y = height - p.yes_price * height
          return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
        })
        .join(' ')
      return { label: s.label, color: s.color, d: path }
    })
  }, [series])

  const periodLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? period.toUpperCase()

  return (
    <Container>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <SectionTitle>
            <TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} />
            Storia probabilità — {markets.length} candidati
          </SectionTitle>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            Top {markets.length} per probabilità · finestra {periodLabel}
          </p>
        </div>
        <PeriodTabs period={period} onChange={setPeriod} />
      </div>

      {loading ? (
        <CenteredBox>
          <Loader2
            size={20}
            className="animate-spin"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </CenteredBox>
      ) : paths.length === 0 ? (
        <CenteredBox>
          <span
            style={{
              color: 'var(--color-text-muted)',
              fontSize: 'var(--font-xs)',
              lineHeight: 1.4,
              textAlign: 'center',
              padding: 'var(--space-2)',
            }}
          >
            Storia non ancora disponibile per questi candidati.
          </span>
        </CenteredBox>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            style={{ width: '100%', height: 120 }}
            role="img"
            aria-label="Multi-outcome probability chart"
          >
            {[0, 0.25, 0.5, 0.75, 1].map((y) => (
              <line
                key={y}
                x1={0}
                y1={height - y * height}
                x2={width}
                y2={height - y * height}
                stroke="var(--color-border-subtle)"
                strokeWidth={0.2}
                strokeDasharray="1,1"
              />
            ))}
            {paths.map((p) => (
              <path
                key={p.label}
                d={p.d}
                stroke={p.color}
                strokeWidth={1.5}
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
              marginTop: 4,
            }}
          >
            {series.map((s) => {
              const last = s.points[s.points.length - 1]?.yes_price ?? 0
              return (
                <span
                  key={s.label}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 'var(--font-xs)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <span
                    style={{
                      width: 12,
                      height: 2,
                      background: s.color,
                      display: 'inline-block',
                      borderRadius: 1,
                    }}
                  />
                  <span
                    style={{
                      maxWidth: 120,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.label}
                  </span>
                  <span style={{ color: s.color, fontWeight: 700 }}>
                    {(last * 100).toFixed(0)}%
                  </span>
                </span>
              )
            })}
          </div>
        </>
      )}
    </Container>
  )
}
