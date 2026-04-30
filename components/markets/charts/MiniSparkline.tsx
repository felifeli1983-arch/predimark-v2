'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  tokenId: string | null | undefined
  /** Periodo di lookback. Default 6h — buon compromesso tra trend e ultime ore. */
  period?: '1h' | '6h' | '1d' | '7d'
  width?: number
  height?: number
  /** Colore custom — di default usa green/red basato su delta. */
  color?: string
}

interface PriceHistoryItem {
  timestamp: string
  yes_price: number
}

interface PriceHistoryResponse {
  items: PriceHistoryItem[]
}

/**
 * Mini sparkline live per la home — fetch async lazy via
 * IntersectionObserver (la card deve entrare nel viewport prima di
 * triggerare il fetch). Server-side cache 5min (Next ISR), quindi
 * 200 card sulla home → max 200 fetch ma serviti dal cache layer.
 *
 * SVG line + area sottile, color verde/rosso in base al delta first→last.
 * No axis, no labels — design "informational at a glance".
 */
export function MiniSparkline({
  tokenId,
  period = '6h',
  width = 100,
  height = 40,
  color: forcedColor,
}: Props) {
  const [points, setPoints] = useState<number[] | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  // Lazy load: trigger fetch solo quando la card entra nel viewport
  // (rootMargin 200px → carica appena prima per render istantaneo).
  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || !tokenId) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(
          `/api/v1/markets/${encodeURIComponent(tokenId)}/price-history?period=${period}`
        )
        if (!res.ok) return
        const data = (await res.json()) as PriceHistoryResponse
        if (cancelled) return
        const series = (data.items ?? [])
          .map((p) => p.yes_price)
          .filter((p) => Number.isFinite(p))
        if (series.length >= 2) setPoints(series)
      } catch {
        /* silenzioso */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [visible, tokenId, period])

  if (!points || points.length < 2) {
    return (
      <div
        ref={containerRef}
        style={{ width, height }}
        aria-label="Caricamento grafico…"
      />
    )
  }

  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 0.01
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width
      const y = height - ((p - min) / range) * height
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  const first = points[0]!
  const last = points[points.length - 1]!
  const change = last - first
  const color = forcedColor ?? (change >= 0 ? 'var(--color-success)' : 'var(--color-danger)')

  return (
    <div
      ref={containerRef}
      style={{ width, height, display: 'block', position: 'relative' }}
      aria-label={`Trend ${period} ${change >= 0 ? '+' : ''}${(change * 100).toFixed(1)}%`}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        {/* Area sotto la linea con fill leggero */}
        <path
          d={`${path} L${width.toFixed(2)},${height} L0,${height} Z`}
          fill={color}
          fillOpacity={0.12}
        />
        {/* Linea principale */}
        <path
          d={path}
          stroke={color}
          strokeWidth={1.5}
          fill="none"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dot endpoint */}
        <circle
          cx={width.toFixed(2)}
          cy={(height - ((last - min) / range) * height).toFixed(2)}
          r={1.5}
          fill={color}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}
