'use client'

import { useEffect } from 'react'
import { X, ShoppingCart, Trash2 } from 'lucide-react'
import {
  useBetSlip,
  totalStake,
  totalPayout,
  builderFee,
  BUILDER_FEE_RATE,
} from '@/lib/stores/useBetSlip'
import { SlipLegRow } from './SlipLegRow'

/**
 * Bet Slip drawer responsive:
 *  - Mobile (<lg): bottom sheet che sale da sotto, max-height 85vh
 *  - Desktop (≥lg): side panel da destra, width 380px, full-height
 *
 * Stesso store useBetSlip alimenta entrambe le viste.
 * Il submit reale ("Piazza tutto") arriva in MA4.2 — qui è uno stub.
 */
export function BetSlipDrawer() {
  const drawerOpen = useBetSlip((s) => s.drawerOpen)
  const legs = useBetSlip((s) => s.legs)
  const closeDrawer = useBetSlip((s) => s.closeDrawer)
  const clearSlip = useBetSlip((s) => s.clearSlip)
  const removeLeg = useBetSlip((s) => s.removeLeg)
  const updateStake = useBetSlip((s) => s.updateStake)

  // ESC chiude il drawer
  useEffect(() => {
    if (!drawerOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen, closeDrawer])

  if (!drawerOpen) return null

  const stake = totalStake(legs)
  const payout = totalPayout(legs)
  const profit = payout - stake
  const fee = builderFee(stake)
  const isEmpty = legs.length === 0

  function handlePlaceAll() {
    // TODO MA4.2: useSubmitTrade() batch — best-effort: piazzo le N leg, leg fallite restano nel slip con errorAtPlace
    console.warn('[Slip place stub]', { legs, stake, payout, profit, fee })
    clearSlip()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--color-overlay)',
          zIndex: 90,
        }}
      />

      {/* Container — animation tramite className media-aware */}
      <aside role="dialog" aria-label="Bet Slip" aria-modal="true" className="bet-slip-drawer">
        {/* Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            padding: '14px 16px',
            borderBottom: '1px solid var(--color-border-subtle)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={16} style={{ color: 'var(--color-cta)' }} />
            <h2
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}
            >
              Bet Slip
            </h2>
            {legs.length > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {legs.length} leg{legs.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label="Chiudi Bet Slip"
            onClick={closeDrawer}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        </header>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {isEmpty ? (
            <EmptyState />
          ) : (
            legs.map((leg) => (
              <SlipLegRow key={leg.id} leg={leg} onRemove={removeLeg} onStakeChange={updateStake} />
            ))
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <footer
            style={{
              borderTop: '1px solid var(--color-border-subtle)',
              padding: '12px 16px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              flexShrink: 0,
              background: 'var(--color-bg-secondary)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <SummaryRow label="Stake totale" value={`$${stake.toFixed(2)}`} />
              <SummaryRow label="Payout (max)" value={`$${payout.toFixed(2)}`} />
              <SummaryRow
                label="Profit potenziale"
                value={`+$${profit.toFixed(2)}`}
                accent="success"
              />
              <SummaryRow
                label={`Builder fee (${(BUILDER_FEE_RATE * 100).toFixed(1)}%)`}
                value={`-$${fee.toFixed(2)}`}
                muted
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={clearSlip}
                aria-label="Svuota Bet Slip"
                style={{
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-secondary)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <Trash2 size={12} />
                Svuota
              </button>
              <button
                type="button"
                onClick={handlePlaceAll}
                style={{
                  flex: 1,
                  background: 'var(--color-cta)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Piazza tutte le predizioni
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
        textAlign: 'center',
        padding: '40px 16px',
        color: 'var(--color-text-muted)',
        fontSize: 13,
        lineHeight: 1.6,
      }}
    >
      <ShoppingCart
        size={32}
        style={{ color: 'var(--color-text-muted)', marginBottom: 12, opacity: 0.5 }}
      />
      <div>Nessuna leg nel bet slip.</div>
      <div style={{ fontSize: 11, marginTop: 4 }}>
        Aggiungi un mercato dalla home con il bottone <strong>+ Slip</strong>.
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  accent,
  muted,
}: {
  label: string
  value: string
  accent?: 'success'
  muted?: boolean
}) {
  const valueColor = muted
    ? 'var(--color-text-muted)'
    : accent === 'success'
      ? 'var(--color-success)'
      : 'var(--color-text-primary)'
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <strong
        style={{
          color: valueColor,
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </strong>
    </div>
  )
}
