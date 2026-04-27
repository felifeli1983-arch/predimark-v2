'use client'

import { useEffect, useState } from 'react'
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
export function TradeWidget({ layout = 'sidebar' }: Props) {
  const draft = useTradeWidget((s) => s.draft)
  const mode = useTradeWidget((s) => s.mode)
  const setMode = useTradeWidget((s) => s.setMode)
  const isOpen = useTradeWidget((s) => s.isOpen)
  const close = useTradeWidget((s) => s.close)
  const amountUsdc = useTradeWidget((s) => s.amountUsdc)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // ESC chiude bottom sheet
  useEffect(() => {
    if (layout !== 'sheet' || !isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [layout, isOpen, close])

  // Mobile bottom sheet: render solo se isOpen
  if (layout === 'sheet' && !isOpen) return null

  const showEmpty = !draft

  const widgetContent = (
    <>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid var(--color-border-subtle)',
          flexShrink: 0,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Trade</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
              padding: '12px 16px',
              borderBottom: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              flexShrink: 0,
            }}
          >
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
              {draft.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--color-cta)',
                  background: 'var(--color-cta-bg)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {draft.outcomeLabel}
              </span>
              <span
                style={{
                  fontSize: 11,
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
              gap: 4,
              padding: '8px 12px 0',
              borderBottom: '1px solid var(--color-border-subtle)',
              flexShrink: 0,
            }}
          >
            <ModeTab label="Mercato" active={mode === 'market'} onClick={() => setMode('market')} />
            <ModeTab label="Limite" active={mode === 'limit'} onClick={() => setMode('limit')} />
          </div>

          {/* Body — Mercato o Limite */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {mode === 'market' ? <TradeMarketTab /> : <TradeLimitTab />}
          </div>

          {/* Footer CTA Trading */}
          <div
            style={{
              padding: '12px 16px 16px',
              borderTop: '1px solid var(--color-border-subtle)',
              flexShrink: 0,
              background: 'var(--color-bg-secondary)',
            }}
          >
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={mode === 'limit' || amountUsdc <= 0}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                background: mode === 'limit' ? 'var(--color-bg-tertiary)' : 'var(--color-cta)',
                color: mode === 'limit' ? 'var(--color-text-muted)' : '#fff',
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: mode === 'limit' || amountUsdc <= 0 ? 'not-allowed' : 'pointer',
                opacity: mode === 'limit' || amountUsdc <= 0 ? 0.6 : 1,
              }}
            >
              {mode === 'limit' ? 'Limite — disponibile in MA4.4' : 'Trading'}
            </button>
          </div>
        </>
      )}
    </>
  )

  if (layout === 'sheet') {
    return (
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
      </>
    )
  }

  return (
    <>
      <aside
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 12,
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
        padding: '8px 14px',
        borderRadius: '8px 8px 0 0',
        background: active ? 'var(--color-bg-tertiary)' : 'transparent',
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
        border: 'none',
        borderBottom: active ? '2px solid var(--color-cta)' : '2px solid transparent',
        fontSize: 12,
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
      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Seleziona un outcome</div>
      <div style={{ fontSize: 11, lineHeight: 1.5 }}>
        Click su Yes/No, Up/Down, Sì/No o un team per pre-compilare il widget.
      </div>
    </div>
  )
}
