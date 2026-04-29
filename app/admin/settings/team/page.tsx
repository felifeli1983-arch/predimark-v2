'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Loader2, Users, ShieldCheck } from 'lucide-react'

interface Admin {
  user_id: string
  role: string
  added_at: string | null
  last_login_at: string | null
}

export default function AdminTeamPage() {
  const { getAccessToken } = usePrivy()
  const [items, setItems] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const res = await fetch('/api/v1/admin/team', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = (await res.json()) as { items: Admin[] }
          if (!cancelled) setItems(data.items)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [getAccessToken])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
          <Users size={20} style={{ display: 'inline', marginRight: 8 }} />
          Admin Team
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          {items.length} admin attivi. Invite via SQL per ora (UI invite in MA8 polish).
        </p>
      </header>

      {loading ? (
        <div style={{ padding: 'var(--space-6)', display: 'flex', justifyContent: 'center' }}>
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
          {items.map((a) => (
            <li
              key={a.user_id}
              style={{
                padding: 'var(--space-3)',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
              }}
            >
              <ShieldCheck size={18} style={{ color: 'var(--color-cta)' }} />
              <div style={{ flex: 1 }}>
                <code style={{ fontFamily: 'monospace', fontSize: 'var(--font-sm)' }}>
                  {a.user_id.slice(0, 12)}…
                </code>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--font-xs)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Last login:{' '}
                  {a.last_login_at ? new Date(a.last_login_at).toLocaleString('it-IT') : '—'}
                </p>
              </div>
              <span
                style={{
                  fontSize: 9,
                  padding: '2px 8px',
                  background: 'color-mix(in srgb, var(--color-cta) 16%, transparent)',
                  color: 'var(--color-cta)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {a.role.replace('_', ' ')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
