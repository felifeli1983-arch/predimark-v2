'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X, CheckCircle2, AlertCircle, Loader2, PenLine } from 'lucide-react'
import { useTradeWidget } from '@/lib/stores/useTradeWidget'
import { useTradeSubmit } from '@/lib/hooks/useTradeSubmit'
import { useThemeStore } from '@/lib/stores/themeStore'
import { translateOrderError, translateInsertStatus } from '@/lib/polymarket/order-errors'

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
  const isDemo = useThemeStore((s) => s.isDemo)
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
  const isSigning = status === 'signing'
  const isSubmitting = status === 'submitting' || isSigning
  const ctaLabel =
    status === 'error'
      ? 'Riprova'
      : isSigning
        ? 'In firma…'
        : isSubmitting
          ? 'Invio…'
          : isDemo
            ? 'Conferma'
            : 'Firma e invia'

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
          borderRadius: 'var(--radius-lg)',
          padding: 20,
          maxWidth: 380,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 'var(--font-lg)', fontWeight: 700 }}>Conferma trade</h2>
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
              flexDirection: 'column',
              gap: 6,
              padding: '10px 12px',
              background: 'var(--color-success-bg)',
              border: '1px solid var(--color-success)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-success)',
              fontSize: 'var(--font-base)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={16} />
              <span>
                Trade eseguito · ${amountUsdc.toFixed(2)} per {result.sharesAcquired.toFixed(2)}{' '}
                shares
              </span>
            </div>
            {result.status && (
              <div
                style={{
                  fontSize: 'var(--font-xs)',
                  color: 'var(--color-success)',
                  opacity: 0.85,
                  paddingLeft: 26,
                }}
              >
                {translateInsertStatus(result.status)}
              </div>
            )}
          </div>
        )}

        {/* Status: error */}
        {status === 'error' && error && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: '10px 12px',
              background: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-danger)',
              fontSize: 'var(--font-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{translateOrderError(error.message)}</span>
            </div>
            {error.code === 'NOT_ONBOARDED' && (
              <Link
                href="/me/wallet"
                onClick={onClose}
                style={{
                  alignSelf: 'flex-start',
                  fontSize: 'var(--font-sm)',
                  fontWeight: 700,
                  color: 'var(--color-danger)',
                  textDecoration: 'underline',
                }}
              >
                Onboard Polymarket ora →
              </Link>
            )}
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
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div
              style={{
                fontSize: 'var(--font-base)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              {draft.title}
            </div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
              <strong style={{ color: 'var(--color-cta)' }}>{draft.outcomeLabel}</strong> a{' '}
              {Math.round(draft.pricePerShare * 100)}¢ ·{' '}
              <span
                style={{
                  fontWeight: 700,
                  color: isDemo ? 'var(--color-warning)' : 'var(--color-cta)',
                }}
              >
                {isDemo ? 'DEMO' : 'REAL'}
              </span>
            </div>

            {!isDemo && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 8px',
                  background: 'color-mix(in srgb, var(--color-cta) 8%, transparent)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-xs)',
                  color: 'var(--color-text-muted)',
                  marginTop: 4,
                }}
              >
                <PenLine size={11} />
                Privy ti chiederà di firmare l&apos;ordine (off-chain, no gas).
              </div>
            )}

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
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-base)',
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
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-cta)',
                border: 'none',
                color: '#fff',
                fontSize: 'var(--font-base)',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {ctaLabel}
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
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)' }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ color, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  )
}
