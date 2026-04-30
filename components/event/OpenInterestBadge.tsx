'use client'

import { useEffect, useState } from 'react'
import { Coins } from 'lucide-react'

interface Props {
  conditionId: string | null | undefined
}

interface OIResponse {
  value: number | null
}

function formatUsd(n: number | null): string {
  if (n === null || !Number.isFinite(n) || n <= 0) return '—'
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

/**
 * Open Interest badge — Polymarket Data API `/oi?market=<conditionId>`.
 * Mostra il valore USD totale dei conditional tokens outstanding (cioè
 * pUSD lockato nel CTF non ancora redento) — proxy diretto della
 * liquidità reale del market.
 *
 * Cache 60s lato server. Inline accanto al Volume nell'EventHero.
 */
export function OpenInterestBadge({ conditionId }: Props) {
  const [oi, setOi] = useState<number | null>(null)

  useEffect(() => {
    if (!conditionId) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(
          `/api/v1/markets/${encodeURIComponent(conditionId)}/open-interest`
        )
        if (!res.ok) return
        const data = (await res.json()) as OIResponse
        if (!cancelled) setOi(data.value ?? null)
      } catch {
        /* silenzioso */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [conditionId])

  if (oi === null) return null

  return (
    <span
      title="Open Interest — totale USD locked nei conditional tokens del market"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 'inherit',
        color: 'inherit',
      }}
    >
      <Coins size={11} />
      <strong style={{ color: 'var(--color-text-secondary)' }}>{formatUsd(oi)}</strong> OI
    </span>
  )
}
