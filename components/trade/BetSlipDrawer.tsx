'use client'

import { useState } from 'react'
import { usePrivy, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth'
import { createWalletClient, custom, type WalletClient } from 'viem'
import { polygon } from 'viem/chains'
import { X, Plus, Minus, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

import { useBetSlip, type BetSlipLeg, BET_SLIP_LIMITS } from '@/lib/stores/useBetSlip'
import { buildAndSignMarketOrder } from '@/lib/polymarket/order-create'

interface LegResult {
  legId: string
  status: 'pending' | 'signing' | 'submitting' | 'success' | 'error'
  error?: string
  orderId?: string
}

/**
 * BetSlip drawer — sidebar destra con lista leg + sign loop + submit
 * batch. Doc L2 Methods → postOrders (1 chiamata fino a 15 ordini, ma
 * Privy embedded EOA richiede 1 popup di firma per leg).
 *
 * Flow submit:
 *  1. Per ogni leg: buildAndSignMarketOrder client-side (popup Privy)
 *  2. Tutti i SignedOrder → POST /api/v1/trades/batch-submit
 *  3. Server fa postOrders SDK in 1 call atomic
 *  4. Risposta per-leg → UI mostra ✅/❌ per riga
 */
export function BetSlipDrawer() {
  const open = useBetSlip((s) => s.open)
  const legs = useBetSlip((s) => s.legs)
  const setOpen = useBetSlip((s) => s.setOpen)
  const removeLeg = useBetSlip((s) => s.removeLeg)
  const setLegAmount = useBetSlip((s) => s.setLegAmount)
  const clear = useBetSlip((s) => s.clear)

  const { authenticated, getAccessToken, login } = usePrivy()
  const { wallets } = useWallets()

  const [busy, setBusy] = useState(false)
  const [results, setResults] = useState<Record<string, LegResult>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)

  if (!open) return null

  const total = legs.reduce((acc, l) => acc + l.amountUsdc, 0)
  const totalPayout = legs.reduce(
    (acc, l) => acc + (l.pricePerShare > 0 ? l.amountUsdc / l.pricePerShare : 0),
    0
  )
  const allDone =
    legs.length > 0 &&
    legs.every((l) => results[l.id]?.status === 'success' || results[l.id]?.status === 'error')

  async function handleSubmit() {
    if (busy || legs.length === 0) return
    if (!authenticated) {
      login()
      return
    }
    setBusy(true)
    setGlobalError(null)
    setResults({})

    try {
      const embedded = getEmbeddedConnectedWallet(wallets)
      if (!embedded) throw new Error('Wallet Privy non trovato — rifai login')

      const provider = await embedded.getEthereumProvider()
      const walletClient: WalletClient = createWalletClient({
        account: embedded.address as `0x${string}`,
        chain: polygon,
        transport: custom(provider),
      })

      // Sign loop sequenziale — Privy mostra 1 popup per leg
      const signedPayloads: Array<{ legId: string; signedOrder: unknown; tokenId: string }> = []
      for (const leg of legs) {
        setResults((prev) => ({ ...prev, [leg.id]: { legId: leg.id, status: 'signing' } }))
        try {
          const signed = await buildAndSignMarketOrder({
            signer: walletClient,
            funderAddress: embedded.address,
            tokenId: leg.tokenId,
            conditionId: leg.conditionId,
            side: 'BUY',
            amount: leg.amountUsdc,
            price: leg.pricePerShare,
          })
          signedPayloads.push({ legId: leg.id, signedOrder: signed, tokenId: leg.tokenId })
          setResults((prev) => ({ ...prev, [leg.id]: { legId: leg.id, status: 'submitting' } }))
        } catch (err) {
          setResults((prev) => ({
            ...prev,
            [leg.id]: {
              legId: leg.id,
              status: 'error',
              error: err instanceof Error ? err.message : 'Firma rifiutata',
            },
          }))
        }
      }

      if (signedPayloads.length === 0) {
        setGlobalError('Nessun ordine firmato')
        return
      }

      const token = await getAccessToken()
      if (!token) throw new Error('Sessione scaduta')
      const res = await fetch('/api/v1/trades/batch-submit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          legs: signedPayloads.map((p) => ({
            legId: p.legId,
            tokenId: p.tokenId,
            signedOrder: p.signedOrder,
            // Metadata per persistenza DB lato server
            meta: legs.find((l) => l.id === p.legId),
          })),
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: { message?: string }
        } | null
        throw new Error(body?.error?.message ?? `HTTP ${res.status}`)
      }
      const body = (await res.json()) as {
        results: Array<{ legId: string; ok: boolean; orderId?: string; error?: string }>
      }
      setResults((prev) => {
        const next = { ...prev }
        for (const r of body.results) {
          next[r.legId] = {
            legId: r.legId,
            status: r.ok ? 'success' : 'error',
            error: r.error,
            orderId: r.orderId,
          }
        }
        return next
      })
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Errore submit batch')
    } finally {
      setBusy(false)
    }
  }

  function handleClose() {
    if (busy) return
    setOpen(false)
    // Pulisci results dopo chiusura — il drawer riapre clean
    if (allDone) {
      // Rimuovi solo i success; mantieni gli error per retry
      setResults({})
      const successIds = legs.filter((l) => results[l.id]?.status === 'success').map((l) => l.id)
      successIds.forEach(removeLeg)
    }
  }

  return (
    <>
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--color-overlay)',
          zIndex: 200,
        }}
      />
      <aside
        role="dialog"
        aria-label="Bet Slip"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(420px, 100vw)',
          background: 'var(--color-bg-secondary)',
          borderLeft: '1px solid var(--color-border-subtle)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 24px rgba(0,0,0,0.18)',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 'var(--font-lg)', fontWeight: 700 }}>
              Bet Slip {legs.length > 0 && `(${legs.length})`}
            </h2>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: 'var(--font-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
              Max {BET_SLIP_LIMITS.MAX_LEGS} previsioni — 1 firma per leg
            </p>
          </div>
          <button
            type="button"
            aria-label="Chiudi"
            onClick={handleClose}
            disabled={busy}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: busy ? 'wait' : 'pointer',
              color: 'var(--color-text-muted)',
              padding: 4,
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </header>

        {legs.length === 0 ? (
          <EmptyState />
        ) : (
          <ul
            style={{
              flex: 1,
              overflowY: 'auto',
              margin: 0,
              padding: 12,
              listStyle: 'none',
              display: 'grid',
              gap: 10,
            }}
          >
            {legs.map((leg) => (
              <li key={leg.id}>
                <LegRow
                  leg={leg}
                  result={results[leg.id]}
                  onAmountChange={(v) => setLegAmount(leg.id, v)}
                  onRemove={() => removeLeg(leg.id)}
                  disabled={busy}
                />
              </li>
            ))}
          </ul>
        )}

        {legs.length > 0 && (
          <footer
            style={{
              padding: 14,
              borderTop: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <Row label="Totale" value={`$${total.toFixed(2)}`} bold />
            <Row label="Vincita massima" value={`$${totalPayout.toFixed(2)}`} accent="success" />

            {globalError && (
              <div
                style={{
                  padding: 10,
                  background: 'var(--color-danger-bg)',
                  border: '1px solid var(--color-danger)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-danger)',
                  fontSize: 'var(--font-xs)',
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-start',
                }}
              >
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{globalError}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={clear}
                disabled={busy}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                  cursor: busy ? 'wait' : 'pointer',
                  fontSize: 'var(--font-sm)',
                }}
              >
                Svuota
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={busy || legs.length === 0}
                style={{
                  flex: 2,
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-cta)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  cursor: busy ? 'wait' : 'pointer',
                  fontSize: 'var(--font-base)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {busy && <Loader2 size={14} className="animate-spin" />}
                {busy ? 'In firma…' : `Conferma ${legs.length} leg`}
              </button>
            </div>
          </footer>
        )}
      </aside>
    </>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        textAlign: 'center',
        color: 'var(--color-text-muted)',
      }}
    >
      <Plus size={28} style={{ opacity: 0.4, marginBottom: 12 }} />
      <p style={{ fontSize: 'var(--font-sm)', maxWidth: 280, lineHeight: 1.5 }}>
        Aggiungi previsioni dal pulsante <strong>+</strong> sulle card o sulla pagina evento.
      </p>
    </div>
  )
}

function LegRow({
  leg,
  result,
  onAmountChange,
  onRemove,
  disabled,
}: {
  leg: BetSlipLeg
  result?: LegResult
  onAmountChange: (v: number) => void
  onRemove: () => void
  disabled: boolean
}) {
  const status = result?.status
  const borderColor =
    status === 'success'
      ? 'var(--color-success)'
      : status === 'error'
        ? 'var(--color-danger)'
        : 'var(--color-border-subtle)'

  return (
    <div
      style={{
        background: 'var(--color-bg-tertiary)',
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-md)',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 'var(--font-sm)',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {leg.title}
          </div>
          <div
            style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-muted)',
              marginTop: 2,
            }}
          >
            <strong style={{ color: 'var(--color-cta)' }}>{leg.outcomeLabel}</strong> ·{' '}
            {Math.round(leg.pricePerShare * 100)}¢
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Rimuovi leg"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: disabled ? 'wait' : 'pointer',
            color: 'var(--color-text-muted)',
            padding: 4,
            flexShrink: 0,
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <button
          type="button"
          onClick={() => onAmountChange(leg.amountUsdc - 1)}
          disabled={disabled || leg.amountUsdc <= 1}
          aria-label="Diminuisci importo"
          style={amountBtnStyle(disabled || leg.amountUsdc <= 1)}
        >
          <Minus size={11} />
        </button>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 10px',
            fontSize: 'var(--font-base)',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          ${leg.amountUsdc.toFixed(2)}
        </div>
        <button
          type="button"
          onClick={() => onAmountChange(leg.amountUsdc + 1)}
          disabled={disabled}
          aria-label="Aumenta importo"
          style={amountBtnStyle(disabled)}
        >
          <Plus size={11} />
        </button>
      </div>

      {status && <StatusLine status={status} error={result?.error} orderId={result?.orderId} />}
    </div>
  )
}

function StatusLine({
  status,
  error,
  orderId,
}: {
  status: LegResult['status']
  error?: string
  orderId?: string
}) {
  if (status === 'pending') return null
  if (status === 'signing')
    return (
      <SmallLine icon={<Loader2 size={11} className="animate-spin" />} text="Firma in corso…" />
    )
  if (status === 'submitting')
    return <SmallLine icon={<Loader2 size={11} className="animate-spin" />} text="Invio CLOB…" />
  if (status === 'success')
    return (
      <SmallLine
        icon={<CheckCircle2 size={11} style={{ color: 'var(--color-success)' }} />}
        text={orderId ? `✓ Ordine ${orderId.slice(0, 8)}…` : '✓ Eseguito'}
        color="var(--color-success)"
      />
    )
  if (status === 'error')
    return (
      <SmallLine
        icon={<AlertCircle size={11} style={{ color: 'var(--color-danger)' }} />}
        text={error ?? 'Errore'}
        color="var(--color-danger)"
      />
    )
  return null
}

function SmallLine({ icon, text, color }: { icon: React.ReactNode; text: string; color?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 'var(--font-xs)',
        color: color ?? 'var(--color-text-muted)',
      }}
    >
      {icon}
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {text}
      </span>
    </div>
  )
}

function amountBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: 28,
    height: 28,
    padding: 0,
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border-subtle)',
    color: 'var(--color-text-secondary)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
}

function Row({
  label,
  value,
  bold,
  accent,
}: {
  label: string
  value: string
  bold?: boolean
  accent?: 'success'
}) {
  const color = accent === 'success' ? 'var(--color-success)' : 'var(--color-text-primary)'
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)' }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span
        style={{
          color,
          fontWeight: bold ? 700 : 600,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  )
}
