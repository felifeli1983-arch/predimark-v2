'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { useEffect } from 'react'
import { Mail, Wallet, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const { ready, authenticated, login } = usePrivy()
  const router = useRouter()

  useEffect(() => {
    if (ready && authenticated) {
      router.replace('/')
    }
  }, [ready, authenticated, router])

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
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
            fontSize: 'var(--font-xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          Bentornato
        </h1>
        <p
          style={{
            margin: '8px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Accedi con email, Google o wallet.
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
          <Mail size={16} /> Email o Google <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
        </button>
        <button type="button" onClick={() => login()} disabled={!ready} style={secondaryBtn}>
          <Wallet size={16} /> Wallet (MetaMask, Coinbase){' '}
          <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
        </button>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
        }}
      >
        Nuovo su Auktora?{' '}
        <Link href="/signup" style={{ color: 'var(--color-cta)', textDecoration: 'none' }}>
          Crea un account
        </Link>
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
