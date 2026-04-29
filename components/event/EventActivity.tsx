'use client'

import { useEffect, useState } from 'react'
import { Activity, Loader2 } from 'lucide-react'

interface ApiTrade {
  side: string
  size: string
  price: string
  outcome: string
  timestamp: string
  user?: { pseudonym?: string; username?: string; address?: string }
  transaction_hash?: string
}

interface Props {
  /** Polymarket conditionId (necessario per CLOB recent-trades). */
  conditionId: string
}

const POLL_MS = 30_000

function formatRelative(iso: string | number): string {
  const ts = typeof iso === 'number' ? iso : new Date(iso).getTime() || Date.now()
  const diff = Date.now() - ts
  const sec = Math.max(1, Math.floor(diff / 1000))
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h`
  return `${Math.floor(hr / 24)}d`
}

function shortName(t: ApiTrade): string {
  return t.user?.pseudonym || t.user?.username || (t.user?.address?.slice(0, 6) ?? 'anon')
}

/**
 * Sprint "Make Event Page Real" — feed trade live per evento.
 * Fetcha /api/v1/markets/[conditionId]/recent-trades + polling 30s.
 * Render: side / outcome / size / price / user / time-ago.
 */
export function EventActivity({ conditionId }: Props) {
  const [trades, setTrades] = useState<ApiTrade[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!conditionId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTrades([])
      return
    }
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    async function load() {
      try {
        const res = await fetch(`/api/v1/markets/${encodeURIComponent(conditionId)}/recent-trades`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as { items: ApiTrade[] }
        if (!cancelled) {
          setTrades(data.items ?? [])
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Errore')
      } finally {
        if (!cancelled) timer = setTimeout(load, POLL_MS)
      }
    }
    load()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [conditionId])

  if (!conditionId) {
    return <Empty>Activity disponibile dopo il mapping market ↔ Polymarket conditionId.</Empty>
  }
  if (trades === null) {
    return (
      <Centered>
        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
      </Centered>
    )
  }
  if (error) {
    return <Empty>Errore caricamento trade: {error}</Empty>
  }
  if (trades.length === 0) {
    return <Empty>Nessun trade recente su questo mercato.</Empty>
  }

  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        fontSize: 'var(--font-sm)',
      }}
    >
      <li
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 70px 90px 80px 50px',
          gap: 8,
          padding: '4px 8px',
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontWeight: 700,
        }}
      >
        <span>Trader</span>
        <span style={{ textAlign: 'right' }}>Outcome</span>
        <span style={{ textAlign: 'right' }}>Size (USDC)</span>
        <span style={{ textAlign: 'right' }}>Price</span>
        <span style={{ textAlign: 'right' }}>Time</span>
      </li>
      {trades.slice(0, 30).map((t, i) => {
        const sideColor =
          (t.side ?? '').toUpperCase() === 'BUY' ? 'var(--color-success)' : 'var(--color-danger)'
        const sizeUsdc = (Number(t.size ?? 0) * Number(t.price ?? 0)).toFixed(2)
        const priceCents = (Number(t.price ?? 0) * 100).toFixed(1)
        return (
          <li
            key={`${t.transaction_hash ?? t.timestamp}-${i}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 70px 90px 80px 50px',
              gap: 8,
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              background: i % 2 === 0 ? 'transparent' : 'var(--color-bg-tertiary)',
              alignItems: 'center',
              color: 'var(--color-text-secondary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: 'var(--color-text-primary)',
              }}
            >
              <Activity size={10} style={{ display: 'inline', marginRight: 4, color: sideColor }} />
              {shortName(t)}
            </span>
            <span style={{ textAlign: 'right', color: sideColor, fontWeight: 600 }}>
              {t.outcome ?? '—'}
            </span>
            <span style={{ textAlign: 'right' }}>${sizeUsdc}</span>
            <span style={{ textAlign: 'right' }}>{priceCents}¢</span>
            <span style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>
              {formatRelative(t.timestamp)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'var(--space-4)',
      }}
    >
      {children}
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        color: 'var(--color-text-muted)',
        fontSize: 'var(--font-sm)',
        textAlign: 'center',
        padding: '32px 16px',
      }}
    >
      {children}
    </p>
  )
}
