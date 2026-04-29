'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { ArrowLeft, Loader2, Ban, Shield, Mail } from 'lucide-react'

interface UserDetail {
  id: string
  email: string | null
  username: string | null
  display_name: string | null
  bio: string | null
  privy_did: string | null
  country_code: string | null
  language: string | null
  is_suspended: boolean | null
  suspended_at: string | null
  suspended_reason: string | null
  deleted_at: string | null
  onboarding_completed: boolean | null
  created_at: string
  updated_at: string | null
  last_login_at: string | null
}

type Tab = 'overview' | 'trades' | 'audit'

export default function AdminUserDetailPage() {
  const params = useParams()
  const userId = params?.userId as string
  const { getAccessToken } = usePrivy()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')
  const [actionBusy, setActionBusy] = useState(false)

  async function load() {
    const token = await getAccessToken()
    if (!token) return
    const res = await fetch(`/api/v1/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      setUser((await res.json()) as UserDetail)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!userId) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [userId])

  async function suspend() {
    const reason = window.prompt('Motivo sospensione (min 5 caratteri):')
    if (!reason || reason.trim().length < 5) return
    setActionBusy(true)
    try {
      const token = await getAccessToken()
      if (!token) return
      await fetch(`/api/v1/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      await load()
    } finally {
      setActionBusy(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-6)', display: 'flex', justifyContent: 'center' }}>
        <Loader2 size={20} className="animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ padding: 'var(--space-4)' }}>
        <p>User non trovato.</p>
        <Link href="/admin/users">← Torna alla lista</Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Link
        href="/admin/users"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-muted)',
          textDecoration: 'none',
          alignSelf: 'flex-start',
        }}
      >
        <ArrowLeft size={14} /> Torna alla lista
      </Link>

      <div
        style={{
          padding: 'var(--space-3)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          gap: 'var(--space-3)',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-cta)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 'var(--font-xl)',
            flexShrink: 0,
          }}
        >
          {(user.email ?? user.username ?? user.id).slice(0, 1).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--font-xl)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            {user.display_name ?? user.username ?? user.email ?? user.id.slice(0, 12)}
          </h1>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            ID: <code style={{ fontFamily: 'monospace' }}>{user.id}</code>
          </p>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {user.deleted_at && <Badge color="var(--color-danger)">Deleted</Badge>}
            {user.is_suspended && <Badge color="var(--color-warning)">Suspended</Badge>}
            {!user.deleted_at && !user.is_suspended && (
              <Badge color="var(--color-success)">Active</Badge>
            )}
            {user.onboarding_completed && <Badge color="var(--color-cta)">Onboarded</Badge>}
          </div>
        </div>
        <button
          type="button"
          onClick={suspend}
          disabled={actionBusy || user.is_suspended === true}
          style={{
            padding: '6px 12px',
            background: 'transparent',
            border: '1px solid var(--color-warning)',
            color: 'var(--color-warning)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-xs)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Ban size={12} /> {user.is_suspended ? 'Già sospeso' : 'Sospendi'}
        </button>
      </div>

      <div
        style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--color-border-subtle)' }}
      >
        {(['overview', 'trades', 'audit'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--color-cta)' : '2px solid transparent',
              color: tab === t ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              fontSize: 'var(--font-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-2)',
          }}
        >
          <Field label="Email" value={user.email ?? '—'} icon={<Mail size={12} />} />
          <Field label="Username" value={user.username ?? '—'} />
          <Field label="Country" value={user.country_code ?? '—'} />
          <Field label="Language" value={user.language ?? 'en'} />
          <Field label="Privy DID" value={user.privy_did?.slice(0, 16) ?? '—'} />
          <Field label="Joined" value={new Date(user.created_at).toLocaleString('it-IT')} />
          <Field
            label="Last login"
            value={user.last_login_at ? new Date(user.last_login_at).toLocaleString('it-IT') : '—'}
          />
          {user.suspended_reason && (
            <Field label="Sospeso per" value={user.suspended_reason} icon={<Shield size={12} />} />
          )}
        </div>
      )}

      {tab === 'trades' && (
        <div
          style={{
            padding: 'var(--space-4)',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
          }}
        >
          Trade history viewer — wiring a /api/v1/admin/users/[id]/trades in MA8 polish.
        </div>
      )}

      {tab === 'audit' && (
        <div
          style={{
            padding: 'var(--space-4)',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
          }}
        >
          Audit log filtrato per questo user — usa{' '}
          <Link href={`/admin/audit-log?actor=${userId}`} style={{ color: 'var(--color-cta)' }}>
            /admin/audit-log
          </Link>
          .
        </div>
      )}
    </div>
  )
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 9,
        padding: '2px 6px',
        background: `color-mix(in srgb, ${color} 16%, transparent)`,
        color,
        borderRadius: 'var(--radius-sm)',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      {children}
    </span>
  )
}

function Field({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div
      style={{
        padding: 'var(--space-2) var(--space-3)',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div
        style={{
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {icon}
        {label}
      </div>
      <div
        style={{
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-primary)',
          marginTop: 2,
          wordBreak: 'break-all',
        }}
      >
        {value}
      </div>
    </div>
  )
}
