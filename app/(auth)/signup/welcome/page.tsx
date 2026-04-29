'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { useState } from 'react'
import { ChevronRight, ChevronLeft, TrendingUp, Zap, Users, Wallet } from 'lucide-react'

const STEPS = [
  {
    icon: <TrendingUp size={48} />,
    title: 'Trading REAL su Polymarket',
    body: 'Aggregator dei mercati di predizione più liquidi al mondo. Trading via Polymarket CLOB V2, custody on-chain, zero intermediari.',
  },
  {
    icon: <Wallet size={48} />,
    title: 'Funding semplice',
    body: 'Deposita con Apple Pay, carta o bonifico via MoonPay. Senza wallet wizardry — Auktora gestisce tutto dietro le quinte.',
  },
  {
    icon: <Zap size={48} />,
    title: 'Signal AI gratis',
    body: "Identifichiamo mercati con discrepanze prezzo-probabilità. Alert push quando trovi un'opportunità. Funziona da subito, gratis.",
  },
  {
    icon: <Users size={48} />,
    title: 'Copy trading',
    body: 'Segui i top trader Polymarket o i Verified Creator Auktora. Replica le loro mosse con il tuo bankroll, sempre tu controlli.',
  },
]

export default function WelcomePage() {
  const { ready, authenticated } = usePrivy()
  const [step, setStep] = useState(0)
  const router = useRouter()
  const current = STEPS[step]

  if (!current) return null

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      router.push('/signup/choose-mode')
    }
  }

  function handleSkip() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auktora.welcome-completed', '1')
    }
    router.push('/signup/choose-mode')
  }

  if (!ready) return null
  if (!authenticated) {
    router.replace('/signup')
    return null
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        textAlign: 'center',
      }}
    >
      <Link
        href="/"
        style={{
          fontSize: 'var(--font-xl)',
          fontWeight: 800,
          color: 'var(--color-text-primary)',
          textDecoration: 'none',
        }}
      >
        Auktora
      </Link>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-5) var(--space-4)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)',
          minHeight: 320,
        }}
      >
        <div style={{ color: 'var(--color-cta)' }}>{current.icon}</div>
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--font-xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          {current.title}
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--font-md)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            maxWidth: 360,
          }}
        >
          {current.body}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
        {STEPS.map((_, i) => (
          <span
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 'var(--radius-full)',
              background: i === step ? 'var(--color-cta)' : 'var(--color-border-subtle)',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button
          type="button"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          style={{
            ...secondaryBtn,
            opacity: step === 0 ? 0.4 : 1,
            cursor: step === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <ChevronLeft size={16} />
        </button>
        <button type="button" onClick={handleSkip} style={{ ...secondaryBtn, flex: 1 }}>
          Salta
        </button>
        <button type="button" onClick={handleNext} style={{ ...primaryBtn, flex: 2 }}>
          {step === STEPS.length - 1 ? 'Inizia ora' : 'Avanti'}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-1)',
  padding: 'var(--space-3) var(--space-4)',
  background: 'var(--color-cta)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-md)',
  fontWeight: 700,
  cursor: 'pointer',
}

const secondaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-1)',
  padding: 'var(--space-3) var(--space-4)',
  background: 'var(--color-bg-tertiary)',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-md)',
  fontWeight: 600,
  cursor: 'pointer',
}
