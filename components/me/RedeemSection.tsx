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
 * (`is_open=false` AND `current_price > 0.5` AND `redeemed_at IS NULL`)
 * con bottone Claim per ogni riga che chiama CTF.redeemPositions
 * (o NegRiskAdapter.redeemPositions per neg-risk markets) on-chain.
 *
 * State backed da DB (column `redeemed_at`) — niente più localStorage.
 * Idempotente lato CTF + side-effect sicuro.
 */
export function RedeemSection() {
  const { ready, authenticated, getAccessToken } = usePrivy()
  const isDemo = useThemeStore((s) => s.isDemo)
  const [items, setItems] = useState<PositionItem[]>([])
  const [loading, setLoading] = useState(true)
  // Track posizioni claimate in questa session (prima che il refetch
  // catturi `redeemed_at` dal DB).
  const [optimisticClaimed, setOptimisticClaimed] = useState<Set<string>>(new Set())

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
        // Filtra: closed (is_open=false) AND winning (current_price > 0.5)
        // AND non ancora redenta (redeemed_at IS NULL).
        const claimable = data.items.filter(
          (p) =>
            !p.isOpen &&
            (p.currentPrice ?? 0) > 0.5 &&
            p.shares > 0 &&
            p.redeemedAt === null
        )
        setItems(claimable)
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

  function markClaimedOptimistic(positionId: string) {
    setOptimisticClaimed((prev) => new Set(prev).add(positionId))
  }

  if (isDemo) return null
  if (!ready || loading) return null
  if (!authenticated) return null

  const claimable = items.filter((p) => !optimisticClaimed.has(p.id))
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
            <RedeemRow position={p} onClaimed={() => markClaimedOptimistic(p.id)} />
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
    try {
      // Fetch conditionId + neg_risk on-demand da Gamma — non in DB schema.
      const res = await fetch(
        `https://gamma-api.polymarket.com/markets/${encodeURIComponent(position.polymarketMarketId)}`,
        { cache: 'no-store' }
      )
      if (!res.ok) throw new Error(`Gamma ${res.status}`)
      const market = (await res.json()) as { conditionId?: string; negRisk?: boolean }
      if (!market.conditionId) throw new Error('conditionId non disponibile')
      await redeem({
        positionId: position.id,
        conditionId: market.conditionId,
        negRisk: Boolean(market.negRisk),
      })
    } catch (err) {
      console.error('[redeem]', err)
    }
  }

  // Quando il tx è done, marca optimistic claimed così la riga sparisce
  // subito (senza dover aspettare un refetch). Il DB è già stato updato
  // in useRedeem, prossimo refetch confermerà.
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
