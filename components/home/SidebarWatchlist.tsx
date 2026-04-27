'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
import { useWatchlist } from '@/lib/stores/useWatchlist'
import { useEffect, useState } from 'react'
import { fetchWatchlist } from '@/lib/api/watchlist-client'
import type { WatchlistItem } from '@/app/api/v1/watchlist/route'

const MAX_VISIBLE = 5

/**
 * Sidebar Watchlist — Polymarket-style. Mostra:
 *  - Empty state con CTA Trending se utente non ha mercati seguiti
 *  - Lista compatta dei top 5 mercati seguiti con titolo + Yes%
 *
 * Attinge al `useWatchlist` store per il count, e fa fetch sui dettagli
 * mercato (title, yes price) on-demand quando lo store è hydrated.
 */
export function SidebarWatchlist() {
  const { authenticated, ready, getAccessToken } = usePrivy()
  const watched = useWatchlist((s) => s.watched)
  const hydrated = useWatchlist((s) => s.hydrated)
  const [items, setItems] = useState<WatchlistItem[]>([])

  useEffect(() => {
    if (!ready || !authenticated || !hydrated) return
    if (watched.size === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const list = await fetchWatchlist(token)
        if (!cancelled) setItems(list.slice(0, MAX_VISIBLE))
      } catch {
        // silenzioso: la sidebar è solo accessoria, mostra empty state
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, authenticated, hydrated, watched.size, getAccessToken])

  const isEmpty = !authenticated || items.length === 0

  return (
    <section
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 10,
        padding: '12px 14px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Star size={14} style={{ color: 'var(--color-warning)' }} fill="var(--color-warning)" />
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
        {!isEmpty && (
          <Link
            href="/me/watchlist"
            style={{
              fontSize: 10,
              color: 'var(--color-cta)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Vedi tutti →
          </Link>
        )}
      </div>

      {isEmpty ? (
        <>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: 11,
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
            }}
          >
            Click sulla stellina ☆ per seguire un mercato.
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
          {items.map((it) => (
            <li
              key={it.id}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <Link
                href={it.slug ? `/event/${it.slug}` : '/me/watchlist'}
                style={{
                  fontSize: 11,
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {it.title}
              </Link>
              {it.currentYesPrice !== null && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                    flexShrink: 0,
                  }}
                >
                  {Math.round(it.currentYesPrice * 100)}%
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
