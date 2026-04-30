'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import { useEffect } from 'react'
import { Wallet, ArrowRight, CheckCircle2, Globe, CreditCard } from 'lucide-react'

import { saveOnboardPath, type OnboardPath } from '@/lib/onboarding/path'

export default function SignupPage() {
  const { ready, authenticated } = usePrivy()
  const router = useRouter()

  // Privy useLogin con onComplete callback per routing post-login basato su path
  const { login } = useLogin({
    onComplete: () => {
      const completed =
        typeof window !== 'undefined' && localStorage.getItem('auktora.welcome-completed') === '1'
      if (completed) {
        router.replace('/')
        return
      }
      router.replace('/signup/welcome')
    },
  })

  useEffect(() => {
    if (ready && authenticated) {
      const completed =
        typeof window !== 'undefined' && localStorage.getItem('auktora.welcome-completed') === '1'
      router.replace(completed ? '/' : '/signup/welcome')
    }
  }, [ready, authenticated, router])

  function pickPath(path: OnboardPath) {
    saveOnboardPath(path)
    // Privy.login() apre il modal con tutti i metodi configurati
    // (email + wallet). L'utente sceglie nel modal — ma il path nostro
    // aiuta a indirizzare il flow downstream.
    login()
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 720,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
      }}
    >
      <Link
        href="/"
        style={{
          fontSize: 'var(--font-2xl)',
          fontWeight: 800,
          color: 'var(--color-text-primary)',
          textDecoration: 'none',
          textAlign: 'center',
        }}
      >
        Auktora
      </Link>

      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--font-2xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            lineHeight: 1.2,
          }}
        >
          Come vuoi iniziare?
        </h1>
        <p
          style={{
            margin: '12px 0 0',
            fontSize: 'var(--font-md)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          Scegli il path che ti rappresenta. Puoi sempre cambiare dopo.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        <PathCard
          icon={<Wallet size={20} />}
          title="Ho Polymarket"
          subtitle="Importa il tuo account esistente"
          bullets={[
            'Riusi le tue posizioni e saldo pUSD',
            'Firma 1-2 volte per derivare API key',
            'Trading immediato, no deposito',
          ]}
          cta="Collega Polymarket"
          accent="var(--color-success)"
          onClick={() => pickPath('polymarket')}
          disabled={!ready}
        />
        <PathCard
          icon={<Globe size={20} />}
          title="Altro wallet"
          subtitle="MetaMask, Rabby, Coinbase, WalletConnect"
          bullets={[
            'Connetti un wallet che già usi',
            'Deposita pUSD per fare trading',
            'Self-custody totale, niente proxy',
          ]}
          cta="Connetti wallet"
          accent="var(--color-cta)"
          onClick={() => pickPath('wallet')}
          disabled={!ready}
        />
        <PathCard
          icon={<CreditCard size={20} />}
          title="Cash / no-crypto"
          subtitle="Deposita con carta o Apple Pay"
          bullets={[
            'Account creato via email (no seed phrase)',
            'Deposita con MoonPay → pUSD automatico',
            'Trading anche senza capire crypto',
          ]}
          cta="Crea account email"
          accent="var(--color-warning)"
          onClick={() => pickPath('cash')}
          disabled={!ready}
        />
      </div>

      <p
        style={{
          margin: 0,
          textAlign: 'center',
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
        }}
      >
        Hai già un account?{' '}
        <Link href="/login" style={{ color: 'var(--color-cta)', textDecoration: 'none' }}>
          Accedi
        </Link>
      </p>
    </div>
  )
}

function PathCard({
  icon,
  title,
  subtitle,
  bullets,
  cta,
  accent,
  onClick,
  disabled,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  bullets: string[]
  cta: string
  accent: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        padding: 'var(--space-4)',
        background: 'var(--color-bg-secondary)',
        border: `1px solid var(--color-border-subtle)`,
        borderRadius: 'var(--radius-lg)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        textAlign: 'left',
        transition: 'border-color 150ms, transform 150ms',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.borderColor = accent
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border-subtle)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <span style={{ color: accent }}>{icon}</span>
        <strong style={{ fontSize: 'var(--font-md)', color: 'var(--color-text-primary)' }}>
          {title}
        </strong>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-secondary)',
          fontWeight: 500,
        }}
      >
        {subtitle}
      </p>

      <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 4 }}>
        {bullets.map((b) => (
          <li
            key={b}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 6,
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-muted)',
              lineHeight: 1.4,
            }}
          >
            <CheckCircle2 size={11} style={{ color: accent, flexShrink: 0, marginTop: 2 }} />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div
        style={{
          marginTop: 'auto',
          paddingTop: 'var(--space-2)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 'var(--font-sm)',
          fontWeight: 700,
          color: accent,
        }}
      >
        {cta} <ArrowRight size={14} />
      </div>
    </button>
  )
}
