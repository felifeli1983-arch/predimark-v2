'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Trophy, Loader2, X, CheckCircle2 } from 'lucide-react'

import { fetchResolvedPositions, type PositionItem } from '@/lib/api/positions-client'
import { useThemeStore } from '@/lib/stores/themeStore'
import { useRedeem, type RedeemTask } from '@/lib/hooks/useRedeem'

const DISMISSED_KEY = 'auktora.redeem-prompt-dismissed-session'

interface PendingRedemption extends PositionItem {
  conditionId: string
  negRisk: boolean
}

/**
 * Auto-prompt modal — appare automaticamente quando l'utente apre la
 * sezione /me e ha vincite non-claimate. UX più vicino a "auto-redeem"
 * possibile senza dare le chiavi al server (Privy embedded EOA non
 * supporta gasless relay come i Proxy/Safe wallets di Polymarket
 * native — vedi memory project_polymarket_redeem_gap.md).
 *
 * Flow:
 *  1. Mount → fetch resolved positions winning + redeemed_at IS NULL
 *  2. Per ognuna, fetch conditionId + neg_risk da Gamma in parallelo
 *  3. Modal "Hai $X.XX da incassare" con CTA "Reclama tutto"
 *  4. Click → redeemBatch loop sequenziale (1 firma per posizione)
 *  5. Progress UI mostra task corrente / N totali
 *  6. Done → close + refetch parent (RedeemSection in /me/positions)
 *
 * Dismiss session-only (sessionStorage) — se l'utente chiude, non
 * riappare nella stessa session ma riapparirà al prossimo login.
 */
export function RedeemAutoPrompt() {
  const { ready, authenticated, getAccessToken } = usePrivy()
  const isDemo = useThemeStore((s) => s.isDemo)
  const [pending, setPending] = useState<PendingRedemption[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const { state, progress, error, redeemBatch, reset } = useRedeem()

  useEffect(() => {
    if (!ready || !authenticated || isDemo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    if (typeof window !== 'undefined' && window.sessionStorage.getItem(DISMISSED_KEY) === '1') {
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
        const winning = data.items.filter(
          (p) =>
            !p.isOpen &&
            (p.currentPrice ?? 0) > 0.5 &&
            p.shares > 0 &&
            p.redeemedAt === null
        )
        if (winning.length === 0) {
          setLoading(false)
          return
        }

        // Fetch conditionId + negRisk per ognuna in parallelo.
        const enriched = await Promise.all(
          winning.map(async (p): Promise<PendingRedemption | null> => {
            try {
              const res = await fetch(
                `https://gamma-api.polymarket.com/markets/${encodeURIComponent(p.polymarketMarketId)}`,
                { cache: 'no-store' }
              )
              if (!res.ok) return null
              const market = (await res.json()) as {
                conditionId?: string
                negRisk?: boolean
              }
              if (!market.conditionId) return null
              return { ...p, conditionId: market.conditionId, negRisk: Boolean(market.negRisk) }
            } catch {
              return null
            }
          })
        )
        if (cancelled) return
        const ready = enriched.filter((p): p is PendingRedemption => p !== null)
        setPending(ready)
        if (ready.length > 0) setOpen(true)
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

  function handleDismiss() {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(DISMISSED_KEY, '1')
    }
    setOpen(false)
    reset()
  }

  function handleClaimAll() {
    const tasks: RedeemTask[] = pending.map((p) => ({
      positionId: p.id,
      conditionId: p.conditionId,
      negRisk: p.negRisk,
    }))
    void redeemBatch(tasks)
  }

  if (!open || loading || pending.length === 0) return null

  const totalPayout = pending.reduce(
    (sum, p) => sum + (p.currentValue ?? p.shares * (p.currentPrice ?? 1)),
    0
  )
  const isRunning = state === 'signing' || state === 'confirming'
  const completedCount = progress.completed.length
  const allDone = state === 'done' && completedCount === pending.length

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => {
        if (!isRunning && e.target === e.currentTarget) handleDismiss()
      }}
    >
      <div
        style={{
          background: 'var(--color-bg-primary)',
          border: '1px solid var(--color-success)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 22px',
          maxWidth: 460,
          width: '100%',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Trophy size={24} style={{ color: 'var(--color-success)' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 'var(--font-lg)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}
            >
              {allDone ? 'Vincite incassate!' : 'Hai vincite da incassare'}
            </h2>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: 'var(--font-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
              {allDone
                ? `${completedCount}/${pending.length} posizioni redente`
                : `${pending.length} ${pending.length === 1 ? 'posizione' : 'posizioni'} risolte vincenti`}
            </p>
          </div>
          {!isRunning && (
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Chiudi"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div
          style={{
            padding: '14px 16px',
            background: 'color-mix(in srgb, var(--color-success) 8%, transparent)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Totale da incassare
          </span>
          <span
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: 'var(--color-success)',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
            }}
          >
            ${totalPayout.toFixed(2)}
          </span>
        </div>

        {isRunning && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-sm)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <Loader2 size={14} className="animate-spin" />
            {state === 'signing'
              ? `Firma posizione ${progress.currentIndex + 1} di ${progress.total}…`
              : `In conferma blocco ${progress.currentIndex + 1} di ${progress.total}…`}
          </div>
        )}

        {error && !isRunning && (
          <div
            style={{
              padding: '8px 10px',
              background: 'color-mix(in srgb, var(--color-danger) 12%, transparent)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-danger)',
              fontSize: 'var(--font-xs)',
            }}
          >
            {error}
          </div>
        )}

        <p
          style={{
            margin: 0,
            fontSize: 'var(--font-xs)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5,
          }}
        >
          Conferma per ricevere USDC sul tuo wallet. Una firma per posizione
          (gas Polygon ~$0.01 per tx).
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          {!allDone ? (
            <>
              <button
                type="button"
                onClick={handleDismiss}
                disabled={isRunning}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-sm)',
                  fontWeight: 600,
                  cursor: isRunning ? 'wait' : 'pointer',
                }}
              >
                Più tardi
              </button>
              <button
                type="button"
                onClick={handleClaimAll}
                disabled={isRunning}
                style={{
                  flex: 2,
                  padding: '10px 14px',
                  background: isRunning
                    ? 'var(--color-bg-tertiary)'
                    : 'var(--color-success)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-sm)',
                  fontWeight: 700,
                  cursor: isRunning ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {isRunning && <Loader2 size={14} className="animate-spin" />}
                Reclama tutto
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleDismiss}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'var(--color-success)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-sm)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <CheckCircle2 size={14} />
              Fatto
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
