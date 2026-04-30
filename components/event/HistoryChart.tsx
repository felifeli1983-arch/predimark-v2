'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Radio, TrendingUp } from 'lucide-react'
import { useLiveMidpoint } from '@/lib/ws/hooks/useLiveMidpoint'
import {
  CenteredBox,
  Container,
  LastUpdateTicker,
  PeriodTabs,
  PulsingDotHtml,
  SectionTitle,
  useChartHover,
  useFlashOnChange,
  type Period,
  type PricePoint,
} from './chart/ChartShell'

interface Props {
  marketId: string
  /** Quando true mostra entrambe le linee YES (verde) + NO (rosso). */
  showBothLines?: boolean
}

const CHART_HEIGHT = 320

/**
 * History chart full-interactive (sprint 3.5.6 — UX live):
 *  - 3 sorgenti midpoint (REST + WS book + WS trades) via useLiveMidpoint
 *  - PulsingDot animato sul punto finale di ogni linea
 *  - Hover crosshair + tooltip con timestamp e prezzo
 *  - Flash sul label valore quando cambia
 *  - "Last update Xs fa" ticker accanto al badge LIVE
 */
export function HistoryChart({ marketId, showBothLines = false }: Props) {
  const [period, setPeriod] = useState<Period>('7d')
  const [points, setPoints] = useState<PricePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdateMs, setLastUpdateMs] = useState<number | null>(null)
  const { midpoint } = useLiveMidpoint(marketId || null)
  const hover = useChartHover()

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
        if (!cancelled) {
          setPoints(data.items ?? [])
          setLastUpdateMs(Date.now())
        }
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
      if (now - lastTs < 60_000) {
        return [...prev.slice(0, -1), fresh]
      }
      return [...prev, fresh].slice(-500)
    })
    setLastUpdateMs(Date.now())
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

    // Posizione SVG dell'ultimo punto (per pulsing dot)
    const lastIdx = points.length - 1
    const lastX = width
    const lastYesY = height - ((lastYes - min) / range) * height
    const lastNoY = height - ((lastNo - min) / range) * height

    return {
      yesPath,
      noPath,
      lastYes,
      yesDelta: lastYes - firstYes,
      lastNo,
      noDelta: lastNo - firstNo,
      lastIdx,
      lastX,
      lastYesY,
      lastNoY,
      min,
      max,
      width,
      height,
    }
  }, [points, showBothLines])

  // Hover index → punto sotto il cursore
  const hoveredPoint =
    chartData && hover.xRatio !== null
      ? points[Math.min(points.length - 1, Math.round(hover.xRatio * (points.length - 1)))]
      : null

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
                  gap: 4,
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
                <LastUpdateTicker lastUpdateMs={lastUpdateMs} />
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
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <div
            style={{
              position: 'relative',
              height: CHART_HEIGHT,
              paddingRight: 70,
              cursor: 'crosshair',
            }}
            {...hover.bind}
          >
            <svg
              viewBox={`0 0 ${chartData.width} ${chartData.height}`}
              preserveAspectRatio="none"
              style={{
                position: 'absolute',
                inset: 0,
                width: 'calc(100% - 70px)',
                height: CHART_HEIGHT,
              }}
              role="img"
              aria-label="Probability history chart"
            >
              {[0, 0.25, 0.5, 0.75, 1].map((y) => {
                const yVal = chartData.min + y * (chartData.max - chartData.min)
                const yPos =
                  chartData.height -
                  ((yVal - chartData.min) / (chartData.max - chartData.min)) * chartData.height
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
                strokeWidth={1.6}
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
              {chartData.noPath && (
                <path
                  d={chartData.noPath}
                  stroke="var(--color-danger)"
                  strokeWidth={1.6}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
              )}

              {/* Crosshair verticale on hover */}
              {hover.xRatio !== null && (
                <line
                  x1={hover.xRatio * chartData.width}
                  y1={0}
                  x2={hover.xRatio * chartData.width}
                  y2={chartData.height}
                  stroke="var(--color-text-muted)"
                  strokeWidth={0.3}
                  strokeDasharray="0.5,0.5"
                />
              )}
            </svg>

            {/* Pulsing dots punti finali — HTML overlay (perfetto cerchio,
                clippato da `overflow: hidden` del container chart). */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                width: 'calc(100% - 70px)',
                height: CHART_HEIGHT,
                pointerEvents: 'none',
              }}
            >
              <PulsingDotHtml
                xPct={(chartData.lastX / chartData.width) * 100}
                yPct={(chartData.lastYesY / chartData.height) * 100}
                color={showBothLines ? 'var(--color-success)' : 'var(--color-cta)'}
              />
              {chartData.noPath && (
                <PulsingDotHtml
                  xPct={(chartData.lastX / chartData.width) * 100}
                  yPct={(chartData.lastNoY / chartData.height) * 100}
                  color="var(--color-danger)"
                />
              )}
            </div>

            {/* Tooltip on hover */}
            {hoveredPoint && hover.yPx !== null && (
              <ChartTooltip
                point={hoveredPoint}
                xRatio={hover.xRatio ?? 0}
                yPx={hover.yPx}
                showBoth={showBothLines}
              />
            )}

            {/* Y-axis label % a destra */}
            <div
              style={{
                position: 'absolute',
                right: 50,
                top: 0,
                bottom: 0,
                width: 20,
                pointerEvents: 'none',
              }}
            >
              {[0, 0.25, 0.5, 0.75, 1].map((y) => {
                const yVal = chartData.min + y * (chartData.max - chartData.min)
                const topPct = (1 - y) * 100
                return (
                  <span
                    key={y}
                    style={{
                      position: 'absolute',
                      top: `calc(${topPct}% - 6px)`,
                      right: 0,
                      fontSize: 9,
                      color: 'var(--color-text-muted)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {(yVal * 100).toFixed(0)}%
                  </span>
                )
              })}
            </div>

            {/* End-of-line YES/NO labels */}
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: 50,
                pointerEvents: 'none',
              }}
            >
              <EndLabel
                value={chartData.lastYes}
                color={showBothLines ? 'var(--color-success)' : 'var(--color-cta)'}
                yMin={chartData.min}
                yMax={chartData.max}
                label="YES"
              />
              {chartData.noPath !== null && (
                <EndLabel
                  value={chartData.lastNo}
                  color="var(--color-danger)"
                  yMin={chartData.min}
                  yMax={chartData.max}
                  label="NO"
                />
              )}
            </div>
          </div>

          <XAxisTimeLabels timestamps={points.map((p) => p.timestamp)} period={period} />
        </div>
      )}
    </Container>
  )
}

function EndLabel({
  value,
  color,
  yMin,
  yMax,
  label,
}: {
  value: number
  color: string
  yMin: number
  yMax: number
  label: string
}) {
  const flash = useFlashOnChange(Math.round(value * 1000))
  // Clamp topPct in [2, 92] per evitare label che escono sopra/sotto al chart
  const rawTopPct = (1 - (value - yMin) / (yMax - yMin)) * 100
  const topPct = Math.max(2, Math.min(92, rawTopPct))
  return (
    <div
      style={{
        position: 'absolute',
        top: `calc(${topPct}% - 9px)`,
        left: 4,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 10,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        padding: '1px 4px',
        borderRadius: 'var(--radius-sm)',
        animation: flash ? 'auktora-chart-flash 280ms ease-out' : undefined,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ color, fontWeight: 700 }}>{(value * 100).toFixed(1)}%</span>
    </div>
  )
}

function ChartTooltip({
  point,
  xRatio,
  yPx,
  showBoth,
}: {
  point: PricePoint
  xRatio: number
  yPx: number
  showBoth: boolean
}) {
  const date = new Date(point.timestamp)
  // Posiziona tooltip vicino al cursore — flip a sinistra se troppo a destra
  const flipLeft = xRatio > 0.7
  return (
    <div
      style={{
        position: 'absolute',
        left: `calc(${xRatio * 100}% + ${flipLeft ? -12 : 12}px)`,
        top: Math.max(8, Math.min(yPx - 40, CHART_HEIGHT - 80)),
        transform: flipLeft ? 'translateX(-100%)' : undefined,
        background: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '6px 8px',
        fontSize: 'var(--font-xs)',
        color: 'var(--color-text-primary)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        zIndex: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ color: 'var(--color-text-muted)', marginBottom: 2 }}>
        {date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}{' '}
        {date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--color-success)',
            display: 'inline-block',
          }}
        />
        <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
          YES {(point.yes_price * 100).toFixed(1)}%
        </span>
      </div>
      {showBoth && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--color-danger)',
              display: 'inline-block',
            }}
          />
          <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>
            NO {(point.no_price * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  )
}

function XAxisTimeLabels({ timestamps, period }: { timestamps: string[]; period: Period }) {
  if (timestamps.length < 2) return null
  const start = new Date(timestamps[0]!)
  const end = new Date(timestamps[timestamps.length - 1]!)
  const mid = new Date((start.getTime() + end.getTime()) / 2)
  function fmt(d: Date) {
    if (period === '1h' || period === '6h' || period === '1d') {
      return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
  }
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 4,
        paddingRight: 70,
        fontSize: 9,
        color: 'var(--color-text-muted)',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span>{fmt(start)}</span>
      <span>{fmt(mid)}</span>
      <span>{fmt(end)}</span>
    </div>
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
