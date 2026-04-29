'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { useEffect } from 'react'
import { Mail, Wallet, ArrowRight, TrendingUp, Zap, Users } from 'lucide-react'

export default function SignupPage() {
  const { ready, authenticated, login } = usePrivy()
  const router = useRouter()

  useEffect(() => {
    if (ready && authenticated) {
      const completed =
        typeof window !== 'undefined' && localStorage.getItem('auktora.welcome-completed') === '1'
      router.replace(completed ? '/' : '/signup/welcome')
    }
  }, [ready, authenticated, router])

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
        textAlign: 'center',
      }}
    >
      <Link
        href="/"
        style={{
          fontSize: 'var(--font-2xl)',
          fontWeight: 800,
          color: 'var(--color-text-primary)',
          textDecoration: 'none',
        }}
      >
        Auktora
      </Link>

      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--font-2xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            lineHeight: 1.2,
          }}
        >
          Inizia a tradare predizioni in 30 secondi
        </h1>
        <p
          style={{
            margin: '12px 0 0',
            fontSize: 'var(--font-md)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          Aggregator Polymarket V2 + signal AI + copy trading. Zero gas su signup, deposita con
          Apple Pay.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          padding: 'var(--space-4)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <button type="button" onClick={() => login()} disabled={!ready} style={primaryBtn}>
          <Mail size={16} /> Continua con email o Google
          <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
        </button>

        <button type="button" onClick={() => login()} disabled={!ready} style={secondaryBtn}>
          <Wallet size={16} /> Collega il tuo account Polymarket
          <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
        </button>

        <p
          style={{
            margin: '4px 0 0',
            fontSize: 'var(--font-xs)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.4,
          }}
        >
          Wallet supportati: MetaMask, Coinbase Wallet, WalletConnect, Rainbow.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 'var(--space-2)',
          textAlign: 'left',
        }}
      >
        <Feature icon={<TrendingUp size={16} />} title="Trading REAL">
          Tutti i mercati Polymarket attivi via CLOB V2.
        </Feature>
        <Feature icon={<Zap size={16} />} title="Signal AI">
          Raccomandazioni gratis su mercati sottovalutati.
        </Feature>
        <Feature icon={<Users size={16} />} title="Copy trading">
          Replica i top trader Polymarket automaticamente.
        </Feature>
      </div>

      <p
        style={{
          margin: 0,
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

function Feature({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        padding: 'var(--space-3)',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          marginBottom: 4,
          color: 'var(--color-cta)',
        }}
      >
        {icon}
        <strong style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-primary)' }}>
          {title}
        </strong>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          lineHeight: 1.4,
        }}
      >
        {children}
      </p>
    </div>
  )
}

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
  padding: 'var(--space-3) var(--space-4)',
  background: 'var(--color-cta)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-md)',
  fontWeight: 700,
  cursor: 'pointer',
  width: '100%',
  textAlign: 'left',
}

const secondaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
  padding: 'var(--space-3) var(--space-4)',
  background: 'var(--color-bg-tertiary)',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-md)',
  fontWeight: 600,
  cursor: 'pointer',
  width: '100%',
  textAlign: 'left',
}
