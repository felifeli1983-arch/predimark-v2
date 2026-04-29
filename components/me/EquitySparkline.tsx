'use client'

import { useEffect, useState, useMemo } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useThemeStore } from '@/lib/stores/themeStore'

interface SnapshotPoint {
  snapshot_date: string
  total_value: number
}

/**
 * N2 — Equity sparkline mini chart in HeroFinanziario.
 * Mostra trend last 30d via SVG line custom (no recharts).
 * Adattivo REAL/DEMO via useThemeStore.
 */
export function EquitySparkline() {
  const { ready, authenticated, getAccessToken } = usePrivy()
  const isDemo = useThemeStore((s) => s.isDemo)
  const [points, setPoints] = useState<SnapshotPoint[]>([])

  useEffect(() => {
    if (!ready || !authenticated) return
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const res = await fetch(`/api/v1/users/me/equity-curve?is_demo=${isDemo}&period=30d`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = (await res.json()) as { items: SnapshotPoint[] }
        if (!cancelled) setPoints(data.items ?? [])
      } catch {
        // silent
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, authenticated, getAccessToken, isDemo])

  const path = useMemo(() => {
    if (points.length < 2) return null
    const w = 100
    const h = 30
    const ys = points.map((p) => Number(p.total_value))
    const min = Math.min(...ys)
    const max = Math.max(...ys)
    const range = max - min || 1
    return points
      .map((p, i) => {
        const x = (i / (points.length - 1)) * w
        const y = h - ((Number(p.total_value) - min) / range) * h
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')
  }, [points])

  if (!path) {
    return (
      <div
        style={{
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          fontStyle: 'italic',
        }}
      >
        Equity history in raccolta (cron daily)…
      </div>
    )
  }

  const lastValue = Number(points[points.length - 1]?.total_value ?? 0)
  const firstValue = Number(points[0]?.total_value ?? 0)
  const delta = lastValue - firstValue
  const positive = delta >= 0

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        marginTop: 'var(--space-2)',
      }}
    >
      <svg
        viewBox="0 0 100 30"
        preserveAspectRatio="none"
        style={{ width: 120, height: 32, flexShrink: 0 }}
        role="img"
        aria-label="Equity curve last 30d"
      >
        <path
          d={path}
          stroke={positive ? 'var(--color-success)' : 'var(--color-danger)'}
          strokeWidth={1}
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        style={{
          fontSize: 'var(--font-xs)',
          color: positive ? 'var(--color-success)' : 'var(--color-danger)',
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {positive ? '+' : ''}${delta.toFixed(2)} (30d)
      </span>
    </div>
  )
}
