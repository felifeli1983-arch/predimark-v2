'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'
import { Bell, Check, Loader2 } from 'lucide-react'

interface Notif {
  id: string
  title: string
  body: string | null
  type: string
  priority: string | null
  is_read: boolean
  created_at: string
  cta_label: string | null
  cta_url: string | null
}

export default function MeNotificationsPage() {
  const { ready, authenticated, getAccessToken } = usePrivy()
  const [items, setItems] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const token = await getAccessToken()
      if (!token) return
      const res = await fetch('/api/v1/users/me/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = (await res.json()) as { items: Notif[] }
        setItems(data.items)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!ready || !authenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated])

  async function markAllRead() {
    const token = await getAccessToken()
    if (!token) return
    await fetch('/api/v1/users/me/notifications', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ mark_all_read: true }),
    })
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 'var(--space-3)' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--font-2xl)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            Notifiche
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 'var(--font-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            {items.length === 0
              ? 'Nessuna notifica'
              : `${items.filter((n) => !n.is_read).length} non lette su ${items.length}`}
          </p>
        </div>
        {items.some((n) => !n.is_read) && (
          <button
            type="button"
            onClick={markAllRead}
            style={{
              padding: '6px 12px',
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Check size={12} /> Segna tutte come lette
          </button>
        )}
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-6)' }}>
          <Loader2
            size={20}
            className="animate-spin"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            padding: 'var(--space-6)',
            textAlign: 'center',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            color: 'var(--color-text-muted)',
          }}
        >
          <Bell size={32} style={{ opacity: 0.4 }} />
          Nessuna notifica per ora.
        </div>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
          {items.map((n) => (
            <li
              key={n.id}
              style={{
                padding: 'var(--space-3)',
                background: n.is_read
                  ? 'var(--color-bg-secondary)'
                  : 'color-mix(in srgb, var(--color-cta) 8%, var(--color-bg-secondary))',
                border: `1px solid ${n.is_read ? 'var(--color-border-subtle)' : 'var(--color-cta)'}`,
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <strong style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-primary)' }}>
                  {n.title}
                </strong>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                  {new Date(n.created_at).toLocaleDateString('it-IT')}
                </span>
              </div>
              {n.body && (
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: 'var(--font-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.4,
                  }}
                >
                  {n.body}
                </p>
              )}
              {n.cta_url && n.cta_label && (
                <Link
                  href={n.cta_url}
                  style={{
                    display: 'inline-block',
                    marginTop: 6,
                    fontSize: 'var(--font-xs)',
                    color: 'var(--color-cta)',
                    textDecoration: 'none',
                  }}
                >
                  {n.cta_label} →
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
