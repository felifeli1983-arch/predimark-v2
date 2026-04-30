'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Trophy, Loader2, ExternalLink } from 'lucide-react'

import { fetchResolvedPositions, type PositionItem } from '@/lib/api/positions-client'
import { useThemeStore } from '@/lib/stores/themeStore'
import { useRedeem } from '@/lib/hooks/useRedeem'

const POLYGONSCAN_TX = 'https://polygonscan.com/tx'

/**
 * Sezione "Vincite da incassare" — lista posizioni risolte vincenti
 * (`is_open=false` AND `current_price > 0.5`) con bottone Claim per
 * ogni riga che chiama CTF.redeemPositions on-chain.
 *
 * Storage `auktora.redeemed-positions` (localStorage) per nascondere
 * subito le righe già reedimati senza dover aspettare il receipt.
 * Idempotente lato CTF — se l'utente clicka due volte il secondo no-op.
 */
const REDEEMED_KEY = 'auktora.redeemed-positions'

function getRedeemedSet(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(REDEEMED_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

function persistRedeemed(set: Set<string>) {
  try {
    window.localStorage.setItem(REDEEMED_KEY, JSON.stringify([...set]))
  } catch {
    /* private mode etc. */
  }
}

export function RedeemSection() {
  const { ready, authenticated, getAccessToken } = usePrivy()
  const isDemo = useThemeStore((s) => s.isDemo)
  const [items, setItems] = useState<PositionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [redeemedSet, setRedeemedSet] = useState<Set<string>>(() => getRedeemedSet())

  useEffect(() => {
    if (!ready || !authenticated || isDemo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const data = await fetchResolvedPositions(token, false, { perPage: 100 })
        if (cancelled) return
        // Filtra solo: closed (is_open=false) AND winning (current_price > 0.5)
        const winning = data.items.filter(
          (p) => !p.isOpen && (p.currentPrice ?? 0) > 0.5 && p.shares > 0
        )
        setItems(winning)
      } catch {
        /* silenzioso */
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, authenticated, getAccessToken, isDemo])

  function markClaimed(positionId: string) {
    const next = new Set(redeemedSet)
    next.add(positionId)
    setRedeemedSet(next)
    persistRedeemed(next)
  }

  // Demo mode → niente redeem on-chain
  if (isDemo) return null
  if (!ready || loading) return null
  if (!authenticated) return null

  const claimable = items.filter((p) => !redeemedSet.has(p.id))
  if (claimable.length === 0) return null

  const totalPayout = claimable.reduce(
    (sum, p) => sum + (p.currentValue ?? p.shares * (p.currentPrice ?? 1)),
    0
  )

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        background: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
        border: '1px solid var(--color-success)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Trophy size={16} style={{ color: 'var(--color-success)' }} />
        <span
          style={{
            fontSize: 'var(--font-md)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          Vincite da incassare
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 'var(--font-sm)',
            fontWeight: 700,
            color: 'var(--color-success)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          ${totalPayout.toFixed(2)}
        </span>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          lineHeight: 1.5,
        }}
      >
        I tuoi token vincenti sono fermi sul tuo wallet. Premi Claim per
        convertirli in pUSD on-chain (richiede gas MATIC).
      </p>

      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
        {claimable.map((p) => (
          <li key={p.id}>
            <RedeemRow position={p} onClaimed={() => markClaimed(p.id)} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function RedeemRow({ position, onClaimed }: { position: PositionItem; onClaimed: () => void }) {
  const { state, txHash, error, redeem } = useRedeem()
  const payout = position.currentValue ?? position.shares * (position.currentPrice ?? 1)

  async function handleClaim() {
    // Fetch conditionId on-demand da Gamma — non è in DB.
    try {
      const res = await fetch(
        `https://gamma-api.polymarket.com/markets/${encodeURIComponent(position.polymarketMarketId)}`,
        { cache: 'no-store' }
      )
      if (!res.ok) throw new Error(`Gamma ${res.status}`)
      const market = (await res.json()) as { conditionId?: string }
      if (!market.conditionId) throw new Error('conditionId non disponibile')
      await redeem(market.conditionId)
      // Mark redeemed solo se non c'è errore (state hook gestisce error path)
      // L'effect sotto cattura state==='done' per chiamare onClaimed.
    } catch (err) {
      console.error('[redeem]', err)
    }
  }

  // Quando il redeem è done, marca la riga come redeemed (storage + UI hide)
  useEffect(() => {
    if (state === 'done') onClaimed()
  }, [state, onClaimed])

  const isLoading = state === 'signing' || state === 'confirming'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--font-sm)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {position.title}
        </div>
        <div
          style={{
            fontSize: 'var(--font-xs)',
            color: 'var(--color-text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {position.shares.toFixed(0)} {position.side} → ${payout.toFixed(2)}
        </div>
        {error && (
          <div
            style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--color-danger)',
              marginTop: 2,
            }}
          >
            {error}
          </div>
        )}
        {txHash && (
          <a
            href={`${POLYGONSCAN_TX}/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 'var(--font-xs)',
              color: 'var(--color-cta)',
              marginTop: 2,
            }}
          >
            Tx <ExternalLink size={9} />
          </a>
        )}
      </div>
      <button
        type="button"
        onClick={handleClaim}
        disabled={isLoading}
        style={{
          padding: '6px 14px',
          background: isLoading ? 'var(--color-bg-tertiary)' : 'var(--color-success)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-xs)',
          fontWeight: 700,
          cursor: isLoading ? 'wait' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0,
        }}
      >
        {isLoading && <Loader2 size={11} className="animate-spin" />}
        {state === 'signing' && 'Firma…'}
        {state === 'confirming' && 'In conferma…'}
        {(state === 'idle' || state === 'error') && 'Claim'}
      </button>
    </div>
  )
}
