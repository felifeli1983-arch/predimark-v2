'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'

interface WatchlistItem {
  market: string
  pct: number
  delta: number
}

interface Props {
  /**
   * Quando true mostra una lista di mercati (in MA5 collegata a watchlist reale).
   * Default false → empty state con CTA "Trending >".
   */
  populated?: boolean
  items?: WatchlistItem[]
}

const DEFAULT_ITEMS: WatchlistItem[] = [
  { market: 'Trump 2028', pct: 62, delta: 2 },
  { market: 'BTC 100k', pct: 78, delta: 1 },
  { market: 'Lakers', pct: 38, delta: -3 },
]

export function SidebarWatchlist({ populated = false, items = DEFAULT_ITEMS }: Props) {
  return (
    <section
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 10,
        padding: '12px 14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Star size={14} style={{ color: 'var(--color-warning)' }} />
        <h3
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Watchlist
        </h3>
      </div>

      {!populated ? (
        <>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: 11,
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
            }}
          >
            Click the star on any market to add it.
          </p>
          <Link
            href="/?sort=trending"
            style={{
              display: 'inline-block',
              fontSize: 11,
              color: 'var(--color-cta)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Trending →
          </Link>
        </>
      ) : (
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {items.map((it, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--color-text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {it.market}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  fontVariantNumeric: 'tabular-nums',
                  flexShrink: 0,
                }}
              >
                {it.pct}%
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: it.delta >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                  fontVariantNumeric: 'tabular-nums',
                  minWidth: 32,
                  textAlign: 'right',
                  flexShrink: 0,
                }}
              >
                {it.delta >= 0 ? '+' : ''}
                {it.delta}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
