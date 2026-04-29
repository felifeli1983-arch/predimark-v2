'use client'

import { Activity, Droplet, MessageCircle, TrendingUp } from 'lucide-react'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'

interface Props {
  event: AuktoraEvent
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`
  return `$${n.toFixed(0)}`
}

/**
 * Sprint "Make Event Page Real" — sentiment & stats card per evento.
 * Sostituisce lo stub "Segnale disponibile in MA5" con dati REALI da Gamma.
 */
export function SentimentCard({ event }: Props) {
  const stats: Array<{ label: string; value: string; icon: React.ReactNode; tone?: string }> = [
    {
      label: 'Volume 24h',
      value: formatMoney(event.volume24hr),
      icon: <TrendingUp size={12} />,
      tone: 'var(--color-success)',
    },
    {
      label: 'Volume totale',
      value: formatMoney(event.totalVolume),
      icon: <Activity size={12} />,
    },
    {
      label: 'Liquidity',
      value: formatMoney(event.totalLiquidity),
      icon: <Droplet size={12} />,
    },
    {
      label: event.markets.length > 1 ? 'Mercati attivi' : 'Commenti',
      value:
        event.markets.length > 1
          ? `${event.markets.length}`
          : event.commentCount.toLocaleString('it-IT'),
      icon: <MessageCircle size={12} />,
    },
  ]

  return (
    <section
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 14,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 'var(--font-sm)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        Statistiche live
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              padding: '8px 10px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg-tertiary)',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 'var(--font-xs)',
                color: s.tone ?? 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontWeight: 600,
              }}
            >
              {s.icon} {s.label}
            </div>
            <div
              style={{
                marginTop: 2,
                fontSize: 'var(--font-md)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
