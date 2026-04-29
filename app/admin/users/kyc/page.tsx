'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Loader2, Shield } from 'lucide-react'

interface KYCSubmission {
  id: string
  user_id: string
  status: string
  submitted_at: string | null
  reviewed_at: string | null
}

export default function AdminKYCPage() {
  const { getAccessToken } = usePrivy()
  const [items, setItems] = useState<KYCSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const res = await fetch('/api/v1/admin/users/kyc?status=pending', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = (await res.json()) as { items: KYCSubmission[] }
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
          <Shield size={20} style={{ display: 'inline', marginRight: 8 }} />
          KYC Review Queue
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          {items.length} pending. KYC review wizard completo in MA8 polish.
        </p>
      </header>

      {loading ? (
        <div style={{ padding: 'var(--space-6)', display: 'flex', justifyContent: 'center' }}>
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Empty message="🎉 Nessuna submission KYC pending." />
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
          {items.map((s) => (
            <li
              key={s.id}
              style={{
                padding: 'var(--space-3)',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-sm)',
              }}
            >
              <code style={{ fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>
                {s.user_id.slice(0, 12)}…
              </code>
              {' · '}
              {s.submitted_at ? new Date(s.submitted_at).toLocaleString('it-IT') : '—'}
              {' · '}
              <span style={{ color: 'var(--color-warning)' }}>{s.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Empty({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: 'var(--space-6)',
        textAlign: 'center',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-text-muted)',
      }}
    >
      {message}
    </div>
  )
}
