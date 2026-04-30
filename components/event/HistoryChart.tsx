'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Radio, TrendingUp } from 'lucide-react'
import { useLiveMidpoint } from '@/lib/ws/hooks/useLiveMidpoint'
import {
  CenteredBox,
  Container,
  PeriodTabs,
  SectionTitle,
  type Period,
  type PricePoint,
} from './chart/ChartShell'

interface Props {
  marketId: string
  /** Quando true mostra entrambe le linee YES (verde) + NO (rosso). */
  showBothLines?: boolean
}

/**
 * Sprint 3.5.5 — History chart single o dual-line, dati da CLOB V2.
 * `marketId` = clobTokenIds[0] (YES token).
 */
export function HistoryChart({ marketId, showBothLines = false }: Props) {
  const [period, setPeriod] = useState<Period>('7d')
  const [points, setPoints] = useState<PricePoint[]>([])
  const [loading, setLoading] = useState(true)
  // Real-time: midpoint live via WS CLOB. Quando arriva, appendiamo un punto
  // con timestamp now al chart → la linea si muove davanti agli occhi.
  const { midpoint } = useLiveMidpoint(marketId || null)

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

  // Quando arriva un nuovo midpoint via WS, appendiamo (o aggiorniamo l'ultimo)
  // così la linea si estende in tempo reale senza rifare fetch REST.
  useEffect(() => {
    if (midpoint === null) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPoints((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      if (!last) return prev
      const lastTs = new Date(last.timestamp).getTime()
      const now = Date.now()
      const fresh: PricePoint = {
        timestamp: new Date(now).toISOString(),
        yes_price: midpoint,
        no_price: 1 - midpoint,
      }
      // Se l'ultimo punto è < 60s fa, sovrascrivi (evita affollamento)
      if (now - lastTs < 60_000) {
        return [...prev.slice(0, -1), fresh]
      }
      return [...prev, fresh].slice(-500)
    })
  }, [midpoint])

  const chartData = useMemo(() => {
    if (points.length < 2) return null
    const width = 100
    const height = 60
    const allPrices = showBothLines
      ? points.flatMap((p) => [p.yes_price, p.no_price])
      : points.map((p) => p.yes_price)
    const min = Math.max(0, Math.min(...allPrices) - 0.05)
    const max = Math.min(1, Math.max(...allPrices) + 0.05)
    const range = max - min || 1

    const buildPath = (key: 'yes_price' | 'no_price') =>
      points
        .map((p, i) => {
          const x = (i / (points.length - 1)) * width
          const y = height - ((p[key] - min) / range) * height
          return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
        })
        .join(' ')

    const yesPath = buildPath('yes_price')
    const noPath = showBothLines ? buildPath('no_price') : null

    const yesArr = points.map((p) => p.yes_price)
    const noArr = points.map((p) => p.no_price)
    const lastYes = yesArr[yesArr.length - 1] ?? 0
    const firstYes = yesArr[0] ?? 0
    const lastNo = noArr[noArr.length - 1] ?? 0
    const firstNo = noArr[0] ?? 0

    return {
      yesPath,
      noPath,
      lastYes,
      yesDelta: lastYes - firstYes,
      lastNo,
      noDelta: lastNo - firstNo,
      min,
      max,
      width,
      height,
    }
  }, [points, showBothLines])

  return (
    <Container>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <SectionTitle>
            <TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} />
            {showBothLines ? 'Storia probabilità YES / NO' : 'Storia probabilità YES'}
            {midpoint !== null && (
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
          {chartData && <ChartStats data={chartData} period={period} dual={showBothLines} />}
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
          style={{ width: '100%', height: 320, display: 'block' }}
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
            d={`${chartData.yesPath} L${chartData.width},${chartData.height} L0,${chartData.height} Z`}
            fill={showBothLines ? 'var(--color-success)' : 'var(--color-cta)'}
            fillOpacity={showBothLines ? 0.08 : 0.1}
          />
          <path
            d={chartData.yesPath}
            stroke={showBothLines ? 'var(--color-success)' : 'var(--color-cta)'}
            strokeWidth={1}
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
          {chartData.noPath && (
            <path
              d={chartData.noPath}
              stroke="var(--color-danger)"
              strokeWidth={1}
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
      )}

      {showBothLines && chartData && <DualLineLegend />}
    </Container>
  )
}

function ChartStats({
  data,
  period,
  dual,
}: {
  data: { lastYes: number; yesDelta: number; lastNo: number; noDelta: number }
  period: Period
  dual: boolean
}) {
  if (!dual) {
    return (
      <p
        style={{
          margin: '4px 0 0',
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
        }}
      >
        Attuale:{' '}
        <strong style={{ color: 'var(--color-text-primary)' }}>
          {(data.lastYes * 100).toFixed(1)}%
        </strong>
        {' · '}
        <span
          style={{ color: data.yesDelta >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}
        >
          {data.yesDelta >= 0 ? '+' : ''}
          {(data.yesDelta * 100).toFixed(1)}% ({period})
        </span>
      </p>
    )
  }
  return (
    <p
      style={{
        margin: '4px 0 0',
        fontSize: 'var(--font-xs)',
        color: 'var(--color-text-muted)',
      }}
    >
      YES{' '}
      <strong style={{ color: 'var(--color-success)' }}>{(data.lastYes * 100).toFixed(1)}%</strong>{' '}
      ({data.yesDelta >= 0 ? '+' : ''}
      {(data.yesDelta * 100).toFixed(1)}%)
      {' · '}
      NO <strong style={{ color: 'var(--color-danger)' }}>
        {(data.lastNo * 100).toFixed(1)}%
      </strong>{' '}
      ({data.noDelta >= 0 ? '+' : ''}
      {(data.noDelta * 100).toFixed(1)}%)
    </p>
  )
}

function DualLineLegend() {
  const dot = (color: string) => ({
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: color,
    display: 'inline-block',
  })
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-3)',
        fontSize: 'var(--font-xs)',
        color: 'var(--color-text-muted)',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={dot('var(--color-success)')} /> YES
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={dot('var(--color-danger)')} /> NO
      </span>
    </div>
  )
}
