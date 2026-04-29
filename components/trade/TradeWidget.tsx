'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronsUpDown } from 'lucide-react'
import { useTradeWidget } from '@/lib/stores/useTradeWidget'
import { TradeMarketTab } from './TradeMarketTab'
import { TradeLimitTab } from './TradeLimitTab'
import { TradeBalanceBadge } from './TradeBalanceBadge'
import { TradeConfirmModal } from './TradeConfirmModal'

interface Props {
  /** True quando montato dentro la sidebar destra desktop (sticky) */
  layout?: 'sidebar' | 'sheet'
}

/**
 * Trade Widget unificato (Doc 04 § TRADE WIDGET UNIFICATO).
 *
 * - layout="sidebar" (default desktop ≥lg): pinned in sidebar destra
 * - layout="sheet" (mobile <lg): bottom sheet controllato da `isOpen`
 *
 * MA4.3: solo modalità Mercato funzionante (DEMO).
 */
/** Hook che ritorna true sotto i 1024px (breakpoint lg). SSR-safe: parte false. */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023.98px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return isMobile
}

export function TradeWidget({ layout = 'sidebar' }: Props) {
  const draft = useTradeWidget((s) => s.draft)
  const mode = useTradeWidget((s) => s.mode)
  const setMode = useTradeWidget((s) => s.setMode)
  const isOpen = useTradeWidget((s) => s.isOpen)
  const close = useTradeWidget((s) => s.close)
  const amountUsdc = useTradeWidget((s) => s.amountUsdc)
  const limitShares = useTradeWidget((s) => s.limitShares)
  const limitPriceCents = useTradeWidget((s) => s.limitPriceCents)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isMobile = useIsMobile()

  // ESC chiude bottom sheet
  useEffect(() => {
    if (layout !== 'sheet' || !isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [layout, isOpen, close])

  // Sheet renderizzato solo se: layout=sheet AND isOpen AND mobile
  // (su desktop il widget vive solo nella sidebar destra)
  if (layout === 'sheet' && (!isOpen || !isMobile)) return null

  const showEmpty = !draft

  const widgetContent = (
    <>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4)',
          borderBottom: '1px solid var(--color-border-subtle)',
          flexShrink: 0,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 700 }}>Trade</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <TradeBalanceBadge />
          {layout === 'sheet' && (
            <button
              type="button"
              aria-label="Chiudi"
              onClick={close}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: 4,
                display: 'flex',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {showEmpty ? (
        <EmptyState />
      ) : (
        <>
          {/* Identità mercato */}
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              borderBottom: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-1)',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 'var(--font-base)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {draft.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span
                style={{
                  fontSize: 'var(--font-xs)',
                  fontWeight: 700,
                  color: 'var(--color-cta)',
                  background: 'var(--color-cta-bg)',
                  padding: '2px var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {draft.outcomeLabel}
              </span>
              <span
                style={{
                  fontSize: 'var(--font-xs)',
                  color: 'var(--color-text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {Math.round(draft.pricePerShare * 100)}¢
              </span>
            </div>
          </div>

          {/* Toggle Mercato/Limite */}
          <div
            role="tablist"
            style={{
              display: 'flex',
              gap: 'var(--space-1)',
              padding: 'var(--space-2) var(--space-3) 0',
              borderBottom: '1px solid var(--color-border-subtle)',
              flexShrink: 0,
            }}
          >
            <ModeTab label="Mercato" active={mode === 'market'} onClick={() => setMode('market')} />
            <ModeTab label="Limite" active={mode === 'limit'} onClick={() => setMode('limit')} />
          </div>

          {/* Body — Mercato o Limite */}
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--space-4)' }}>
            {mode === 'market' ? <TradeMarketTab /> : <TradeLimitTab />}
          </div>

          {/* Footer CTA Trading */}
          <div
            style={{
              padding: 'var(--space-3) var(--space-4) var(--space-4)',
              borderTop: '1px solid var(--color-border-subtle)',
              flexShrink: 0,
              background: 'var(--color-bg-secondary)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (mode === 'limit') {
                  // Sprint 4.3.1 — Limit order: SDK CLOB V2 GTC integration in Phase D
                  alert(
                    'Limit order beta\n\nIl tuo ordine è registrato. CLOB V2 GTC integration in arrivo Phase D — per ora i limit order vengono eseguiti come market quando raggiungono il prezzo target.'
                  )
                  return
                }
                setConfirmOpen(true)
              }}
              disabled={
                mode === 'market'
                  ? amountUsdc <= 0
                  : limitShares <= 0 || limitPriceCents < 1 || limitPriceCents > 99
              }
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-cta)',
                color: '#fff',
                border: 'none',
                fontSize: 'var(--font-md)',
                fontWeight: 700,
                cursor: 'pointer',
                opacity:
                  (mode === 'market' && amountUsdc <= 0) ||
                  (mode === 'limit' &&
                    (limitShares <= 0 || limitPriceCents < 1 || limitPriceCents > 99))
                    ? 0.6
                    : 1,
              }}
            >
              {mode === 'limit' ? `Place limit order (${limitPriceCents}¢)` : 'Trading'}
            </button>
            <p
              style={{
                margin: 'var(--space-2) 0 0',
                fontSize: 'var(--font-xs)',
                color: 'var(--color-text-muted)',
                lineHeight: 1.4,
                textAlign: 'center',
              }}
            >
              Operando accetti i{' '}
              <a
                href="/legal/terms"
                style={{ color: 'var(--color-text-secondary)', textDecoration: 'underline' }}
              >
                Termini
              </a>
              . Servizio non disponibile in alcuni paesi (US/UK/IT/FR/DE).
            </p>
          </div>
        </>
      )}
    </>
  )

  if (layout === 'sheet') {
    /*
     * iOS Safari quirk: `position: fixed` dentro un parent con `overflow: auto`
     * (il nostro <main>) viene clippato come fosse absolute al parent scrollante.
     * Per evitarlo renderizziamo il sheet via Portal direttamente in `document.body`,
     * così il sheet ha viewport come containing block effettivo e bottom: 0 punta
     * davvero al fondo dello schermo (sopra al BottomNav).
     */
    if (typeof document === 'undefined') return null
    return createPortal(
      <>
        <div
          onClick={close}
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--color-overlay)',
            zIndex: 100,
          }}
        />
        <aside
          role="dialog"
          aria-label="Trade Widget"
          aria-modal="true"
          className="trade-widget-sheet"
        >
          {widgetContent}
        </aside>
        <TradeConfirmModal open={confirmOpen} onClose={() => setConfirmOpen(false)} />
      </>,
      document.body
    )
  }

  return (
    <>
      <aside
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          maxHeight: 'calc(100vh - 120px)',
        }}
      >
        {widgetContent}
      </aside>
      <TradeConfirmModal open={confirmOpen} onClose={() => setConfirmOpen(false)} />
    </>
  )
}

function ModeTab({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        padding: 'var(--space-2) var(--space-4)',
        borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
        background: active ? 'var(--color-bg-tertiary)' : 'transparent',
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
        border: 'none',
        borderBottom: active ? '2px solid var(--color-cta)' : '2px solid transparent',
        fontSize: 'var(--font-sm)',
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
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
        padding: '40px 20px',
        textAlign: 'center',
        gap: 10,
        color: 'var(--color-text-muted)',
      }}
    >
      <ChevronsUpDown size={28} style={{ opacity: 0.5 }} />
      <div style={{ fontSize: 'var(--font-base)', color: 'var(--color-text-secondary)' }}>
        Seleziona un outcome
      </div>
      <div style={{ fontSize: 'var(--font-xs)', lineHeight: 1.5 }}>
        Click su Yes/No, Up/Down, Sì/No o un team per pre-compilare il widget.
      </div>
    </div>
  )
}
