'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { X, ChevronRight, TrendingUp, Wallet, Zap } from 'lucide-react'

const STORAGE_KEY = 'auktora.welcome-completed'

const STEPS = [
  {
    icon: TrendingUp,
    title: 'Tradi predizioni reali',
    body: 'Trading via Polymarket CLOB V2. Custody on-chain Polygon, zero intermediari.',
  },
  {
    icon: Wallet,
    title: 'Funding semplice',
    body: 'Deposita con Apple Pay, carta o bonifico via MoonPay. Withdraw in qualsiasi momento.',
  },
  {
    icon: Zap,
    title: 'Signal AI gratis',
    body: 'Alert su mercati sottovalutati. Copy trading dei top trader. Tutto incluso.',
  },
]

/**
 * Soft onboarding modal (sprint 3.6.2 Doc 09).
 * Mostrato in app/layout.tsx al primo accesso post-login se utente NON è
 * passato per /signup/welcome (es. login inline da Header).
 * Persistente skip in localStorage.
 */
export function OnboardingModal() {
  const { ready, authenticated } = usePrivy()
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!ready || !authenticated) return
    if (typeof window === 'undefined') return
    const completed = localStorage.getItem(STORAGE_KEY)
    if (completed === '1') return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(true)
  }, [ready, authenticated])

  function complete() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, '1')
    }
    setShow(false)
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      complete()
      router.push('/signup/choose-mode')
    }
  }

  if (!show) return null
  const current = STEPS[step]
  if (!current) return null
  const Icon = current.icon

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
        padding: 'var(--space-4)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={complete}
          aria-label="Skip onboarding"
          style={{
            position: 'absolute',
            top: 'var(--space-2)',
            right: 'var(--space-2)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            padding: 'var(--space-1)',
            display: 'inline-flex',
          }}
        >
          <X size={18} />
        </button>

        <div
          style={{
            display: 'inline-flex',
            alignSelf: 'center',
            color: 'var(--color-cta)',
          }}
        >
          <Icon size={48} />
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: 'var(--font-xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          {current.title}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
          }}
        >
          {current.body}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          {STEPS.map((_, i) => (
            <span
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 'var(--radius-full)',
                background: i === step ? 'var(--color-cta)' : 'var(--color-border-subtle)',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          <button
            type="button"
            onClick={complete}
            style={{
              flex: 1,
              padding: 'var(--space-2) var(--space-3)',
              background: 'transparent',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-secondary)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-sm)',
              cursor: 'pointer',
            }}
          >
            Salta
          </button>
          <button
            type="button"
            onClick={next}
            style={{
              flex: 2,
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--color-cta)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-sm)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            {step === STEPS.length - 1 ? 'Inizia' : 'Avanti'}
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
