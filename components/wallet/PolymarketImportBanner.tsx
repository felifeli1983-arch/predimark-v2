'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'
import { Wallet, X, TrendingUp, History as HistoryIcon, ArrowRight } from 'lucide-react'

const DISMISS_KEY = 'auktora.polymarket-banner-dismissed'

interface ImportData {
  pusdBalance: number
  openPositionsCount: number
  openPositionsValue: number
  tradeHistoryCount: number
}

/**
 * Banner one-time per utenti Polymarket esistenti — mostrato in /me/wallet e /me/positions.
 * Si auto-nasconde se: (1) utente non onboardato, (2) balance + positions = 0 (utente nuovo),
 * (3) dismissed precedentemente (localStorage).
 */
export function PolymarketImportBanner() {
  const { authenticated, ready, getAccessToken } = usePrivy()
  const [data, setData] = useState<ImportData | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissed(localStorage.getItem(DISMISS_KEY) === '1')
    }
  }, [])

  useEffect(() => {
    if (!ready || !authenticated || dismissed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const [balRes, posRes] = await Promise.all([
          fetch('/api/v1/polymarket/balance', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/v1/users/me/positions?isDemo=false', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        if (!balRes.ok || !posRes.ok) return
        const bal = (await balRes.json()) as { pusd?: number }
        const pos = (await posRes.json()) as {
          items?: Array<{ currentValue?: number }>
          meta?: { total?: number; totalValue?: number }
        }
        if (cancelled) return
        const pusd = bal.pusd ?? 0
        const positionsCount = pos.meta?.total ?? pos.items?.length ?? 0
        const positionsValue = pos.meta?.totalValue ?? 0
        setData({
          pusdBalance: pusd,
          openPositionsCount: positionsCount,
          openPositionsValue: positionsValue,
          tradeHistoryCount: 0,
        })
      } catch {
        // silent — banner non si mostra se fetch fallisce
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, authenticated, dismissed, getAccessToken])

  function handleDismiss() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISS_KEY, '1')
    }
    setDismissed(true)
  }

  if (!ready || !authenticated || dismissed || loading) return null
  if (!data) return null

  const isExistingUser = data.pusdBalance > 0.01 || data.openPositionsCount > 0
  if (!isExistingUser) return null

  return (
    <div
      role="status"
      style={{
        position: 'relative',
        padding: 'var(--space-4)',
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--color-cta) 8%, var(--color-bg-secondary)), var(--color-bg-secondary))',
        border: '1px solid var(--color-cta)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Chiudi"
        style={{
          position: 'absolute',
          top: 'var(--space-2)',
          right: 'var(--space-2)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-muted)',
          padding: 'var(--space-1)',
          display: 'inline-flex',
        }}
      >
        <X size={16} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <span style={{ fontSize: 'var(--font-xl)' }}>👋</span>
        <h2
          style={{
            margin: 0,
            fontSize: 'var(--font-lg)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          Bentornato! Abbiamo trovato il tuo account Polymarket
        </h2>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5,
        }}
      >
        Auktora aggiunge segnali AI, copy trading e community al tuo trading Polymarket. Stesso
        wallet, stesse posizioni, zero migrazione.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 'var(--space-2)',
        }}
      >
        <Stat
          icon={<Wallet size={14} />}
          label="pUSD disponibili"
          value={`$${data.pusdBalance.toFixed(2)}`}
        />
        <Stat
          icon={<TrendingUp size={14} />}
          label="Posizioni aperte"
          value={`${data.openPositionsCount} ($${data.openPositionsValue.toFixed(2)})`}
        />
        <Stat
          icon={<HistoryIcon size={14} />}
          label="Storico"
          value={data.tradeHistoryCount > 0 ? `${data.tradeHistoryCount} trade` : '—'}
        />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <Link
          href="/me/positions"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--color-cta)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-sm)',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Vedi posizioni <ArrowRight size={14} />
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            background: 'transparent',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-sm)',
            cursor: 'pointer',
          }}
        >
          Chiudi
        </button>
      </div>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: 'var(--space-2)',
        background: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {icon}
        {label}
      </span>
      <strong
        style={{
          fontSize: 'var(--font-base)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </strong>
    </div>
  )
}
