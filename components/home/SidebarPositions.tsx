'use client'

import Link from 'next/link'
import { Activity } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'
import { useThemeStore } from '@/lib/stores/themeStore'
import { fetchOpenPositions, type PositionItem } from '@/lib/api/positions-client'

const MAX_VISIBLE = 5

/**
 * Sidebar Posizioni — sostituisce la vecchia SidebarWatchlist nella home.
 * Mostra le top 5 posizioni aperte dell'utente con title + side chip + P&L.
 *
 * La Watchlist vive ora come page standalone /watchlist + icona ⭐ nell'header.
 */
export function SidebarPositions() {
  const { authenticated, ready, getAccessToken } = usePrivy()
  const isDemo = useThemeStore((s) => s.isDemo)
  const [items, setItems] = useState<PositionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    if (!authenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const data = await fetchOpenPositions(token, isDemo, { perPage: MAX_VISIBLE })
        if (!cancelled) {
          setItems(data.items.slice(0, MAX_VISIBLE))
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, authenticated, isDemo, getAccessToken])

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
          <Activity size={14} style={{ color: 'var(--color-cta)' }} />
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
            Posizioni {isDemo ? 'Demo' : ''}
          </h3>
        </div>
        {!isEmpty && (
          <Link
            href="/me/positions"
            style={{
              fontSize: 10,
              color: 'var(--color-cta)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Vedi tutte →
          </Link>
        )}
      </div>

      {loading && authenticated ? (
        <SkeletonRows />
      ) : isEmpty ? (
        <>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: 11,
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
            }}
          >
            {authenticated
              ? `Nessuna posizione ${isDemo ? 'DEMO' : 'REAL'} aperta. Apri un trade dalla home.`
              : 'Effettua il login per vedere le tue posizioni.'}
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
            Esplora mercati →
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
            gap: 8,
          }}
        >
          {items.map((p) => (
            <PositionRow key={p.id} position={p} />
          ))}
        </ul>
      )}
    </section>
  )
}

function PositionRow({ position }: { position: PositionItem }) {
  const isYes = position.side.toLowerCase() === 'yes'
  const sideColor = isYes ? 'var(--color-success)' : 'var(--color-danger)'
  const pnl = position.unrealizedPnl
  const pnlColor =
    pnl === null || pnl === 0
      ? 'var(--color-text-muted)'
      : pnl > 0
        ? 'var(--color-success)'
        : 'var(--color-danger)'
  const pnlSign = pnl !== null && pnl > 0 ? '+' : ''

  return (
    <li>
      <Link
        href={position.slug ? `/event/${position.slug}` : '/me/positions'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          textDecoration: 'none',
          minWidth: 0,
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: '2px 5px',
            borderRadius: 3,
            background: 'color-mix(in srgb, transparent 80%, currentColor)',
            color: sideColor,
            flexShrink: 0,
            letterSpacing: '0.04em',
          }}
        >
          {position.side.toUpperCase()}
        </span>
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
          {position.title}
        </span>
        {pnl !== null && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: pnlColor,
              fontVariantNumeric: 'tabular-nums',
              flexShrink: 0,
            }}
          >
            {pnlSign}${Math.abs(pnl).toFixed(2)}
          </span>
        )}
      </Link>
    </li>
  )
}

function SkeletonRows() {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          style={{ height: 18, background: 'var(--color-bg-tertiary)', borderRadius: 4 }}
        />
      ))}
    </ul>
  )
}
