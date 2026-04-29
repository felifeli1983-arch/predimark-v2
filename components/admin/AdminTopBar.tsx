'use client'

import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'
import { ShieldCheck, LogOut, ExternalLink } from 'lucide-react'

interface Props {
  role: string
  email?: string
}

export function AdminTopBar({ role, email }: Props) {
  const { logout } = usePrivy()

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-2) var(--space-3)',
        background: 'color-mix(in srgb, var(--color-danger) 20%, var(--color-bg-primary))',
        borderBottom: '2px solid var(--color-danger)',
        color: 'var(--color-text-primary)',
      }}
    >
      <Link
        href="/admin"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 'var(--font-md)',
          fontWeight: 800,
          color: 'var(--color-text-primary)',
          textDecoration: 'none',
          letterSpacing: '0.02em',
        }}
      >
        <ShieldCheck size={16} />
        Auktora Admin
      </Link>

      <div
        style={{
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          padding: '2px 8px',
          background: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {role.replace('_', ' ')}
      </div>

      <div style={{ flex: 1 }} />

      {email && (
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
          {email}
        </span>
      )}

      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-secondary)',
          textDecoration: 'none',
        }}
        title="Switch to user view"
      >
        <ExternalLink size={12} />
        Switch to user view
      </Link>

      <button
        type="button"
        onClick={() => logout()}
        aria-label="Logout"
        style={{
          background: 'transparent',
          border: '1px solid var(--color-border-subtle)',
          color: 'var(--color-text-secondary)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-xs)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <LogOut size={12} />
        Logout
      </button>
    </header>
  )
}
