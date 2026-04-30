'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Radio, TrendingUp } from 'lucide-react'
import { subscribeToPriceChange } from '@/lib/ws/clob'
import {
  CenteredBox,
  Container,
  LastUpdateTicker,
  PERIOD_OPTIONS,
  PeriodTabs,
  PulsingDot,
  SectionTitle,
  useChartHover,
  type Period,
  type PricePoint,
} from './chart/ChartShell'

const CHART_HEIGHT = 320

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
  const [lastUpdateMs, setLastUpdateMs] = useState<number | null>(null)
  // Set di label da NASCONDERE. Click sulla legenda per toggle.
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const hover = useChartHover()

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
        setLastUpdateMs(Date.now())
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
      setLastUpdateMs(Date.now())
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
          {/* Chart area con SVG + overlay HTML per label */}
          <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
            <div
              style={{
                position: 'relative',
                height: CHART_HEIGHT,
                paddingRight: 110,
                cursor: 'crosshair',
              }}
              {...hover.bind}
            >
              <svg
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: 'calc(100% - 110px)',
                  height: CHART_HEIGHT,
                }}
                role="img"
                aria-label="Multi-outcome probability chart"
              >
                {[0, 0.25, 0.5, 0.75, 1].map((y) => {
                  const yVal = yMin + y * (yMax - yMin)
                  const yPos = height - ((yVal - yMin) / (yMax - yMin)) * height
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
                    strokeWidth={1.6}
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}

                {/* Crosshair verticale on hover */}
                {hover.xRatio !== null && (
                  <line
                    x1={hover.xRatio * width}
                    y1={0}
                    x2={hover.xRatio * width}
                    y2={height}
                    stroke="var(--color-text-muted)"
                    strokeWidth={0.3}
                    strokeDasharray="0.5,0.5"
                  />
                )}

                {/* Pulsing dot a fine di ogni serie visibile */}
                {paths.map((p) => {
                  const s = series.find((x) => x.label === p.label)
                  const last = s?.points[s.points.length - 1]?.yes_price ?? 0
                  const lastY = height - ((last - yMin) / (yMax - yMin || 1)) * height
                  return <PulsingDot key={`dot-${p.label}`} cx={width} cy={lastY} color={p.color} />
                })}
              </svg>

              {/* Tooltip multi-serie on hover */}
              {hover.xRatio !== null && hover.yPx !== null && series.length > 0 && (
                <MultiSeriesTooltip
                  series={series.filter((s) => !hidden.has(s.label))}
                  xRatio={hover.xRatio}
                  yPx={hover.yPx}
                />
              )}

              {/* Y-axis labels (% sulla destra, allineati alla griglia) */}
              <div
                style={{
                  position: 'absolute',
                  right: 90,
                  top: 0,
                  bottom: 0,
                  width: 20,
                  pointerEvents: 'none',
                }}
              >
                {[0, 0.25, 0.5, 0.75, 1].map((y) => {
                  const yVal = yMin + y * (yMax - yMin)
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

              {/* End-of-line labels — "Spain 15.5%" allineato a destra
                  in corrispondenza dell'ultimo punto */}
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 90,
                  pointerEvents: 'none',
                }}
              >
                {paths.map((p) => {
                  const s = series.find((x) => x.label === p.label)
                  if (!s) return null
                  const last = s.points[s.points.length - 1]?.yes_price ?? 0
                  const rawTopPct = (1 - (last - yMin) / (yMax - yMin)) * 100
                  // Clamp [2, 92] per non far uscire le label sopra/sotto il chart
                  const topPct = Math.max(2, Math.min(92, rawTopPct))
                  return (
                    <div
                      key={p.label}
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
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: p.color,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          color: 'var(--color-text-secondary)',
                          maxWidth: 60,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {p.label}
                      </span>
                      <span style={{ color: p.color, fontWeight: 700 }}>
                        {(last * 100).toFixed(1)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* X-axis time labels (start / middle / end basato sui dati) */}
            <XAxisLabels series={series} period={period} />
          </div>

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

function MultiSeriesTooltip({
  series,
  xRatio,
  yPx,
}: {
  series: SeriesData[]
  xRatio: number
  yPx: number
}) {
  // Trova il timestamp e i valori al cursore (interpola sul max range comune)
  const flipLeft = xRatio > 0.7
  // Tutte le serie sono allineate sullo stesso period range, prendi il primo
  // come timeline reference
  const refPoints = series[0]?.points ?? []
  if (refPoints.length === 0) return null
  const idx = Math.min(refPoints.length - 1, Math.round(xRatio * (refPoints.length - 1)))
  const refTimestamp = refPoints[idx]?.timestamp
  if (!refTimestamp) return null
  const date = new Date(refTimestamp)

  // Per ogni serie ritrova il punto allo stesso indice (approx: stessa griglia
  // temporale per tutti — Polymarket V2 ritorna punti aggregati per period
  // quindi sono sincroni)
  const rows = series
    .map((s) => {
      const pt = s.points[Math.min(s.points.length - 1, idx)]
      if (!pt) return null
      return { label: s.label, color: s.color, value: pt.yes_price }
    })
    .filter((r): r is { label: string; color: string; value: number } => r !== null)
    .sort((a, b) => b.value - a.value) // descendente per UX (alto in alto)

  return (
    <div
      style={{
        position: 'absolute',
        left: `calc(${xRatio * 100}% + ${flipLeft ? -12 : 12}px)`,
        top: Math.max(8, Math.min(yPx - rows.length * 14 - 30, CHART_HEIGHT - 200)),
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
      <div style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>
        {date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}{' '}
        {date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
      </div>
      {rows.map((r) => (
        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: r.color,
              display: 'inline-block',
            }}
          />
          <span
            style={{
              maxWidth: 100,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'var(--color-text-secondary)',
            }}
          >
            {r.label}
          </span>
          <span style={{ color: r.color, fontWeight: 700, marginLeft: 'auto' }}>
            {(r.value * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Labels asse X temporale: start / mid / end del range visibile.
 * Format adattivo al period: 1H/6H → HH:MM, 1G → "ore X", 7G/MAX → date.
 */
function XAxisLabels({ series, period }: { series: SeriesData[]; period: Period }) {
  const allTimestamps = series.flatMap((s) => s.points.map((p) => p.timestamp)).sort()
  if (allTimestamps.length < 2) return null
  const start = new Date(allTimestamps[0]!)
  const end = new Date(allTimestamps[allTimestamps.length - 1]!)
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
        paddingRight: 110,
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
