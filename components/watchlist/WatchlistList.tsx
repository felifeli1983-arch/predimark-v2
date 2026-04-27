'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'
import { Star } from 'lucide-react'
import { fetchWatchlist } from '@/lib/api/watchlist-client'
import { useWatchlistActions } from '@/lib/hooks/useWatchlistActions'
import type { WatchlistItem } from '@/app/api/v1/watchlist/route'

/**
 * Lista mercati watchlist user-side. Fetch al mount (richiede Privy JWT).
 *
 * Per MVP usa snapshot da `markets` table (current_yes_price, image, title).
 * Live updates via WS arriveranno in MA5.
 */
export function WatchlistList() {
  const { authenticated, ready, getAccessToken, login } = usePrivy()
  const { remove } = useWatchlistActions()
  const [items, setItems] = useState<WatchlistItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ready) return
    if (!authenticated) {
      // setState in effect: visualizziamo subito empty state al cambio auth
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) {
          if (!cancelled) setError('Sessione scaduta. Effettua di nuovo il login.')
          return
        }
        const list = await fetchWatchlist(token)
        if (!cancelled) {
          setItems(list)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Errore caricamento')
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, authenticated, getAccessToken])

  if (!ready || loading) {
    return <SkeletonList />
  }

  if (!authenticated) {
    return (
      <EmptyState
        icon={<Star size={32} />}
        title="Effettua login per vedere la tua watchlist"
        action={
          <button
            type="button"
            onClick={() => login()}
            style={{
              background: 'var(--color-cta)',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign in
          </button>
        }
      />
    )
  }

  if (error) {
    return <p style={{ color: 'var(--color-danger)', fontSize: 13 }}>{error}</p>
  }

  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={<Star size={32} />}
        title="La tua watchlist è vuota"
        subtitle="Click sulla stellina di una card per aggiungere mercati."
      />
    )
  }

  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'grid',
        gap: 8,
      }}
    >
      {items.map((it) => (
        <li
          key={it.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 10,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'var(--color-bg-tertiary)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary)',
              fontWeight: 700,
            }}
          >
            {it.image ? (
              <Image src={it.image} alt="" width={40} height={40} style={{ objectFit: 'cover' }} />
            ) : (
              (it.title?.[0]?.toUpperCase() ?? '?')
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {it.slug ? (
                <Link
                  href={`/event/${it.slug}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {it.title}
                </Link>
              ) : (
                it.title
              )}
            </div>
            {it.currentYesPrice !== null && (
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--color-text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                Yes {Math.round(it.currentYesPrice * 100)}%
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label={`Rimuovi ${it.title} dalla watchlist`}
            onClick={async () => {
              await remove(it.polymarketMarketId)
              setItems((prev) => prev?.filter((x) => x.id !== it.id) ?? null)
            }}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 6,
              cursor: 'pointer',
              color: 'var(--color-warning)',
              display: 'inline-flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <Star size={16} fill="var(--color-warning)" strokeWidth={0} />
          </button>
        </li>
      ))}
    </ul>
  )
}

function SkeletonList() {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          style={{
            height: 64,
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 10,
          }}
        />
      ))}
    </ul>
  )
}

function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '40px 16px',
        color: 'var(--color-text-muted)',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 12,
      }}
    >
      <div style={{ display: 'inline-flex', marginBottom: 12, opacity: 0.5 }}>{icon}</div>
      <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
        {title}
      </div>
      {subtitle && <div style={{ fontSize: 12, marginBottom: action ? 12 : 0 }}>{subtitle}</div>}
      {action}
    </div>
  )
}
