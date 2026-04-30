'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { CheckCircle2, Loader2, Wallet, X } from 'lucide-react'
import { useOnboardPolymarket, type OnboardStep } from '@/lib/hooks/useOnboardPolymarket'

interface OnboardStatusResponse {
  onboarded: boolean
  funderAddress: string | null
  onboardedAt: string | null
}

const STEP_LABEL: Record<OnboardStep, string> = {
  idle: 'Pronto a iniziare',
  preparing: 'Preparazione wallet…',
  deriving_api_key: 'Firma 1/2 — derivo API key Polymarket',
  saving_creds: 'Salvataggio credenziali…',
  reading_allowances: 'Lettura permessi on-chain…',
  approving: 'Approvazioni transazioni — firma dal wallet',
  success: 'Onboarding completato',
  error: 'Errore — riprova',
}

/**
 * Banner che appare in /me se l'utente non ha ancora onboardato Polymarket.
 * Click "Connetti" → triggera onboarding flow Path A:
 *   1. Sign L1 → derive L2 API creds
 *   2. POST creds cifrate al server
 *   3. Approve allowances on-chain (1-6 firme)
 *
 * Dopo success, il banner scompare. Il user può fare trade real.
 */
export function PolymarketOnboardBanner() {
  const { authenticated, getAccessToken } = usePrivy()
  const [status, setStatus] = useState<OnboardStatusResponse | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const onboard = useOnboardPolymarket()

  useEffect(() => {
    if (!authenticated) return
    let cancelled = false
    ;(async () => {
      const token = await getAccessToken()
      if (!token) return
      try {
        const res = await fetch('/api/v1/polymarket/onboard', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = (await res.json()) as OnboardStatusResponse
        if (!cancelled) setStatus(data)
      } catch {
        /* silenzioso */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [authenticated, getAccessToken, onboard.step])

  // Hide se: non loggato, già onboardato, dismiss manuale, success
  if (!authenticated) return null
  if (status?.onboarded) return null
  if (dismissed) return null
  if (onboard.step === 'success') return null

  const inProgress = onboard.step !== 'idle' && onboard.step !== 'error'

  return (
    <section
      style={{
        padding: 'var(--space-3)',
        background: 'color-mix(in srgb, var(--color-cta) 8%, var(--color-bg-secondary))',
        border: '1px solid var(--color-cta)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Wallet size={16} style={{ color: 'var(--color-cta)' }} />
          <strong style={{ fontSize: 'var(--font-md)', color: 'var(--color-text-primary)' }}>
            Connetti il tuo account Polymarket
          </strong>
        </div>
        {!inProgress && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Chiudi"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5,
        }}
      >
        Per fare trade real ti serve completare un setup di una volta sola: firmare per derivare le
        API key Polymarket e approvare i permessi on-chain (max 6 transazioni Polygon, gas ~ $0.10
        totali).
      </p>

      {inProgress && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <Loader2 size={14} className="animate-spin" />
          <span>{STEP_LABEL[onboard.step]}</span>
          {onboard.step === 'approving' && onboard.approvingTotal > 0 && (
            <span style={{ color: 'var(--color-text-muted)' }}>
              {onboard.approvingIndex + 1}/{onboard.approvingTotal}
            </span>
          )}
        </div>
      )}

      {onboard.step === 'error' && onboard.error && (
        <p
          style={{
            margin: 0,
            fontSize: 'var(--font-xs)',
            color: 'var(--color-danger)',
          }}
        >
          {onboard.error.message}
        </p>
      )}

      {!inProgress && (
        <button
          type="button"
          onClick={() => {
            void onboard.start()
          }}
          style={{
            padding: '8px 16px',
            background: 'var(--color-cta)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-sm)',
            fontWeight: 700,
            cursor: 'pointer',
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <CheckCircle2 size={14} />
          {onboard.step === 'error' ? 'Riprova' : 'Connetti'}
        </button>
      )}
    </section>
  )
}
