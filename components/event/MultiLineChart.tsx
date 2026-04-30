'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Radio, TrendingUp } from 'lucide-react'
import { subscribeToPriceChange } from '@/lib/ws/clob'
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
  const [liveConnected, setLiveConnected] = useState(false)
  // Set di label da NASCONDERE. Click sulla legenda per toggle.
  // Permette di escludere una serie dominante (es. "No change" 96%) per
  // vedere meglio la dinamica delle altre 4 minori.
  const [hidden, setHidden] = useState<Set<string>>(new Set())

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

  // Real-time: subscribe a price_change su tutti i tokenId. Aggiorna l'ultimo
  // punto della relativa serie ogni volta che arriva un trade.
  useEffect(() => {
    const tokenIds = markets.map((m) => m.tokenId).filter(Boolean)
    if (tokenIds.length === 0) return
    const unsubscribe = subscribeToPriceChange(tokenIds, (event) => {
      const price = parseFloat(event.price)
      if (!Number.isFinite(price)) return
      setLiveConnected(true)
      setSeries((prev) =>
        prev.map((s, i) => {
          const tokenId = markets[i]?.tokenId
          if (tokenId !== event.asset_id) return s
          const last = s.points[s.points.length - 1]
          if (!last) return s
          const now = Date.now()
          const lastTs = new Date(last.timestamp).getTime()
          const fresh: PricePoint = {
            timestamp: new Date(now).toISOString(),
            yes_price: price,
            no_price: 1 - price,
          }
          const newPoints =
            now - lastTs < 60_000
              ? [...s.points.slice(0, -1), fresh]
              : [...s.points, fresh].slice(-500)
          return { ...s, points: newPoints }
        })
      )
    })
    return unsubscribe
  }, [markets])

  const width = 100
  const height = 60

  // Auto-scale Y: prendi min/max SOLO delle serie visibili (escludi hidden)
  // con padding 5%. Hidden serie escluse dal calcolo range → escludendo il
  // dominante, le minori si espandono e diventano leggibili.
  const { yMin, yMax, paths } = useMemo(() => {
    const visibleSeries = series.filter((s) => !hidden.has(s.label))
    const allPrices = visibleSeries.flatMap((s) => s.points.map((p) => p.yes_price))
    const min = allPrices.length > 0 ? Math.max(0, Math.min(...allPrices) - 0.05) : 0
    const max = allPrices.length > 0 ? Math.min(1, Math.max(...allPrices) + 0.05) : 1
    const range = max - min || 1
    const built = series
      .filter((s) => !hidden.has(s.label))
      .map((s) => {
        const path = s.points
          .map((p, i) => {
            const x = (i / (s.points.length - 1)) * width
            const y = height - ((p.yes_price - min) / range) * height
            return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
          })
          .join(' ')
        return { label: s.label, color: s.color, d: path }
      })
    return { yMin: min, yMax: max, paths: built }
  }, [series, hidden])

  function toggleSeries(label: string) {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const periodLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? period.toUpperCase()

  return (
    <Container>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <SectionTitle>
            <TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} />
            Storia probabilità — {markets.length} candidati
            {liveConnected && (
              <span
                style={{
                  marginLeft: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 2,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  background: 'color-mix(in srgb, var(--color-success) 18%, transparent)',
                  color: 'var(--color-success)',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                <Radio size={8} /> LIVE
              </span>
            )}
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
            style={{ width: '100%', height: 320, display: 'block' }}
            role="img"
            aria-label="Multi-outcome probability chart"
          >
            {[0, 0.25, 0.5, 0.75, 1].map((y) => {
              const yPos = height - ((y - yMin) / (yMax - yMin)) * height
              if (yPos < 0 || yPos > height) return null
              return (
                <line
                  key={y}
                  x1={0}
                  y1={yPos}
                  x2={width}
                  y2={yPos}
                  stroke="var(--color-border-subtle)"
                  strokeWidth={0.2}
                  strokeDasharray="1,1"
                />
              )
            })}
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
              gap: 'var(--space-3)',
              marginTop: 8,
            }}
          >
            {series.map((s) => {
              const last = s.points[s.points.length - 1]?.yes_price ?? 0
              const isHidden = hidden.has(s.label)
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => toggleSeries(s.label)}
                  title={isHidden ? 'Mostra serie' : 'Nascondi serie (auto-zoom)'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 8px',
                    background: 'var(--color-bg-tertiary)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-xs)',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    opacity: isHidden ? 0.4 : 1,
                    textDecoration: isHidden ? 'line-through' : 'none',
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
                      maxWidth: 140,
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
                </button>
              )
            })}
          </div>
        </>
      )}
    </Container>
  )
}
