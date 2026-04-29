'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Zap, ArrowRight } from 'lucide-react'

interface Signal {
  id: string
  algorithm_name: string
  direction: string
  edge_pct: number
  confidence_pct: number
  predicted_probability: number
  current_market_price: number
  valid_until: string
}

interface Props {
  marketId: string
}

/**
 * Sprint 4.6.1 — Banner Segnale Predimark integration in event page.
 * Mostra il signal AI attivo (se esiste) per il market corrente.
 * Auto-fetch da /api/v1/signals con filter market_id.
 */
export function SignalBanner({ marketId }: Props) {
  const [signal, setSignal] = useState<Signal | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!marketId) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/v1/signals?status=active&limit=10`)
        if (!res.ok) return
        const data = (await res.json()) as { items: Signal[] }
        // Find signal for this specific market
        const match = data.items.find((s) => {
          const item = s as unknown as { market_id?: string }
          return item.market_id === marketId
        })
        if (match && !cancelled) setSignal(match)
      } catch {
        // silent
      }
    })()
    return () => {
      cancelled = true
    }
  }, [marketId])

  if (!signal || dismissed) return null

  const isPositive = ['YES', 'UP', 'BUY'].includes(signal.direction)
  const accentColor = isPositive ? 'var(--color-success)' : 'var(--color-danger)'

  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-3)',
        background: `color-mix(in srgb, ${accentColor} 8%, var(--color-bg-secondary))`,
        border: `1px solid ${accentColor}`,
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-sm)',
      }}
    >
      <Zap size={16} style={{ color: accentColor, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>
            Signal AI: {signal.direction}
          </strong>
          <span
            style={{
              fontSize: 9,
              padding: '2px 6px',
              background: `color-mix(in srgb, ${accentColor} 16%, transparent)`,
              color: accentColor,
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            EDGE +{signal.edge_pct.toFixed(1)}%
          </span>
          <span
            style={{
              fontSize: 9,
              padding: '2px 6px',
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-muted)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
            }}
          >
            {signal.confidence_pct.toFixed(0)}% confidence
          </span>
        </div>
        <p
          style={{
            margin: '2px 0 0',
            fontSize: 'var(--font-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          {signal.algorithm_name} · Predicted {(signal.predicted_probability * 100).toFixed(0)}% vs
          market {(signal.current_market_price * 100).toFixed(0)}%
        </p>
      </div>
      <Link
        href={`/signals#${signal.id}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 'var(--font-xs)',
          color: accentColor,
          textDecoration: 'none',
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        Dettagli <ArrowRight size={12} />
      </Link>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Chiudi"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          padding: '0 var(--space-1)',
          fontSize: 'var(--font-md)',
        }}
      >
        ×
      </button>
    </div>
  )
}
