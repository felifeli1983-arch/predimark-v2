'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Shield, LogOut, Key } from 'lucide-react'

export default function MeSecurityPage() {
  const { user, logout } = usePrivy()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 'var(--space-3)' }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
          <Shield size={20} style={{ display: 'inline', marginRight: 8 }} />
          Security
        </h1>
      </header>

      <div
        style={{
          padding: 'var(--space-3)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 700 }}>
          <Key size={14} style={{ display: 'inline', marginRight: 6 }} />
          Wallet & Auth
        </h2>
        <Field label="User ID" value={user?.id ?? '—'} />
        <Field label="Email" value={user?.email?.address ?? '—'} />
        <Field label="Wallet" value={user?.wallet?.address ?? '—'} />
        <Field
          label="Connected"
          value={user?.linkedAccounts?.length ? `${user.linkedAccounts.length} accounts` : '—'}
        />
      </div>

      <div
        style={{
          padding: 'var(--space-3)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 700 }}>2FA / MFA</h2>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          MFA è gestita da Privy. Vai a settings Privy per abilitare 2FA su email/Google.
        </p>
      </div>

      <button
        type="button"
        onClick={() => logout()}
        style={{
          padding: 'var(--space-2) var(--space-4)',
          background: 'transparent',
          border: '1px solid var(--color-danger)',
          color: 'var(--color-danger)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-md)',
          fontWeight: 700,
          cursor: 'pointer',
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <LogOut size={14} /> Logout
      </button>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)' }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <code
        style={{
          fontFamily: 'monospace',
          color: 'var(--color-text-primary)',
          wordBreak: 'break-all',
        }}
      >
        {value}
      </code>
    </div>
  )
}
