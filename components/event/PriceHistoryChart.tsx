'use client'

import { useEffect, useState, useMemo } from 'react'
import { Loader2, TrendingUp, Activity, Coins } from 'lucide-react'
import type { CardKind } from '@/lib/polymarket/mappers'
import { useLiveMidpoint } from '@/lib/ws/hooks/useLiveMidpoint'

interface PricePoint {
  timestamp: string
  yes_price: number
  no_price: number
}

type Period = '1h' | '6h' | '1d' | '7d' | 'all'

const PERIOD_OPTIONS: ReadonlyArray<{ value: Period; label: string }> = [
  { value: '1h', label: '1H' },
  { value: '6h', label: '6H' },
  { value: '1d', label: '1G' },
  { value: '7d', label: '7G' },
  { value: 'all', label: 'MAX' },
]

interface Props {
  marketId: string
  cardKind?: CardKind
  /** clobTokenId YES per live midpoint (crypto_up_down) */
  assetId?: string | null
  /** Evento attualmente live — usato per h2h_sport (mostra score stub) */
  isLive?: boolean
}

/**
 * Sprint 3.5.4 — Chart prezzi event-page, dati live da CLOB V2 diretta.
 *
 * Routing per CardKind:
 *  - binary | multi_outcome | multi_strike → history chart via /price-history (CLOB)
 *  - crypto_up_down → live spot midpoint via WS CLOB (token YES)
 *  - h2h_sport (live) → stub "Score live · MA6"
 *  - h2h_sport (non-live) → history chart standard
 *
 * `marketId` è il clobTokenIds[0] (YES token) del market — non l'id Gamma.
 */
export function PriceHistoryChart({ marketId, cardKind = 'binary', assetId, isLive }: Props) {
  if (cardKind === 'crypto_up_down') {
    return <LiveSpotView assetId={assetId ?? null} />
  }
  if (cardKind === 'h2h_sport' && isLive) {
    return <LiveScoreStub />
  }
  return <HistoryChartView marketId={marketId} />
}

function HistoryChartView({ marketId }: { marketId: string }) {
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
    <Container>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <SectionTitle>
            <TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} />
            Storia probabilità YES
          </SectionTitle>
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
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPeriod(opt.value)}
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
      </div>

      {loading ? (
        <CenteredBox>
          <Loader2
            size={20}
            className="animate-spin"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </CenteredBox>
      ) : !chartData ? (
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
            Storia non ancora disponibile per questo intervallo.
          </span>
        </CenteredBox>
      ) : (
        <svg
          viewBox={`0 0 ${chartData.width} ${chartData.height}`}
          preserveAspectRatio="none"
          style={{ width: '100%', height: 120 }}
          role="img"
          aria-label="Probability history chart"
        >
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
          <path
            d={`${chartData.path} L${chartData.width},${chartData.height} L0,${chartData.height} Z`}
            fill="var(--color-cta)"
            fillOpacity={0.1}
          />
          <path
            d={chartData.path}
            stroke="var(--color-cta)"
            strokeWidth={1}
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </Container>
  )
}

function LiveSpotView({ assetId }: { assetId: string | null }) {
  const { midpoint, change } = useLiveMidpoint(assetId)
  const connected = midpoint !== null

  return (
    <Container>
      <SectionTitle>
        <Coins size={12} style={{ display: 'inline', marginRight: 4 }} />
        Prezzo spot live · CLOB
      </SectionTitle>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-1)',
          padding: 'var(--space-3) 0',
        }}
      >
        {!assetId ? (
          <span
            style={{
              fontSize: 'var(--font-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            Token CLOB non disponibile per questo evento.
          </span>
        ) : !connected ? (
          <>
            <Loader2
              size={20}
              className="animate-spin"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
              Connessione WebSocket…
            </span>
          </>
        ) : (
          <>
            <strong
              style={{
                fontSize: 'var(--font-2xl)',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              {(midpoint * 100).toFixed(1)}¢
            </strong>
            {change !== null && (
              <span
                style={{
                  fontSize: 'var(--font-sm)',
                  fontWeight: 600,
                  color: change >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                }}
              >
                {change >= 0 ? '+' : ''}
                {change.toFixed(2)}% sessione
              </span>
            )}
          </>
        )}
      </div>
    </Container>
  )
}

function LiveScoreStub() {
  return (
    <Container>
      <SectionTitle>
        <Activity size={12} style={{ display: 'inline', marginRight: 4 }} />
        Score live
      </SectionTitle>
      <CenteredBox>
        <span
          style={{
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          Score live disponibile in MA6 — integrazione provider sport-data.
          <br />
          <span style={{ fontSize: 'var(--font-xs)' }}>
            Per ora segui le probabilità nei mercati qui sotto.
          </span>
        </span>
      </CenteredBox>
    </Container>
  )
}

function Container({ children }: { children: React.ReactNode }) {
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

function SectionTitle({ children }: { children: React.ReactNode }) {
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

function CenteredBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        height: 120,
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
