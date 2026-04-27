'use client'

import { useEffect } from 'react'
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useTradeWidget } from '@/lib/stores/useTradeWidget'
import { useTradeSubmit } from '@/lib/hooks/useTradeSubmit'

interface Props {
  open: boolean
  onClose: () => void
}

/**
 * Modal di conferma trade. Su submit:
 *  - status submitting → spinner
 *  - status success → check verde + toast inline + auto-close 1.5s
 *  - status error → alert rosso + bottone Riprova
 */
export function TradeConfirmModal({ open, onClose }: Props) {
  const draft = useTradeWidget((s) => s.draft)
  const amountUsdc = useTradeWidget((s) => s.amountUsdc)
  const { status, error, result, submit, reset } = useTradeSubmit()

  // Reset su apertura
  useEffect(() => {
    if (open) reset()
  }, [open, reset])

  // Auto-close dopo successo
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        reset()
        onClose()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [status, reset, onClose])

  if (!open || !draft) return null

  const payout = draft.pricePerShare > 0 ? amountUsdc / draft.pricePerShare : 0
  const profit = payout - amountUsdc
  const isSubmitting = status === 'submitting'

  return (
    <div
      role="dialog"
      aria-label="Conferma trade"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'var(--color-overlay)',
      }}
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 12,
          padding: 20,
          maxWidth: 380,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Conferma trade</h2>
          {!isSubmitting && (
            <button
              type="button"
              aria-label="Chiudi"
              onClick={onClose}
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
        </header>

        {/* Status: success */}
        {status === 'success' && result && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              background: 'var(--color-success-bg)',
              border: '1px solid var(--color-success)',
              borderRadius: 8,
              color: 'var(--color-success)',
              fontSize: 13,
            }}
          >
            <CheckCircle2 size={16} />
            <span>
              Trade eseguito · ${amountUsdc.toFixed(2)} per {result.sharesAcquired.toFixed(2)}{' '}
              shares
            </span>
          </div>
        )}

        {/* Status: error */}
        {status === 'error' && error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '10px 12px',
              background: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger)',
              borderRadius: 8,
              color: 'var(--color-danger)',
              fontSize: 12,
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error.message}</span>
          </div>
        )}

        {/* Riassunto trade (mostrato sempre se draft attivo) */}
        {status !== 'success' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              padding: '12px 14px',
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {draft.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              <strong style={{ color: 'var(--color-cta)' }}>{draft.outcomeLabel}</strong> a{' '}
              {Math.round(draft.pricePerShare * 100)}¢ · DEMO
            </div>

            <div style={{ height: 1, background: 'var(--color-border-subtle)', margin: '6px 0' }} />

            <Row label="Importo" value={`$${amountUsdc.toFixed(2)}`} />
            <Row label="Per vincere" value={`$${payout.toFixed(2)}`} accent="success" />
            <Row label="Profit potenziale" value={`+$${profit.toFixed(2)}`} accent="success" />
          </div>
        )}

        {/* Bottoni */}
        {status !== 'success' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 8,
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-secondary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
              }}
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={isSubmitting}
              style={{
                flex: 2,
                padding: '10px 14px',
                borderRadius: 8,
                background: 'var(--color-cta)',
                border: 'none',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {status === 'error' ? 'Riprova' : isSubmitting ? 'Trading…' : 'Conferma'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: 'success' }) {
  const color = accent === 'success' ? 'var(--color-success)' : 'var(--color-text-primary)'
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ color, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  )
}
