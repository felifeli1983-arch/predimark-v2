'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Loader2, Shield, Check, X } from 'lucide-react'

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
  const [decidingId, setDecidingId] = useState<string | null>(null)

  async function load() {
    const token = await getAccessToken()
    if (!token) return
    const res = await fetch('/api/v1/admin/users/kyc?status=pending', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const data = (await res.json()) as { items: KYCSubmission[] }
      setItems(data.items)
    }
    setLoading(false)
  }

  async function decide(id: string, action: 'approve' | 'reject') {
    setDecidingId(id)
    try {
      let reason: string | undefined
      if (action === 'reject') {
        reason = window.prompt('Motivo rejection (min 5 caratteri):') ?? undefined
        if (!reason || reason.trim().length < 5) {
          setDecidingId(null)
          return
        }
      }
      const token = await getAccessToken()
      if (!token) return
      await fetch(`/api/v1/admin/users/kyc/${id}/decide`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      })
      await load()
    } finally {
      setDecidingId(null)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

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
          {items.length} pending. Approve/Reject con audit log.
        </p>
      </header>

      {loading ? (
        <div style={{ padding: 'var(--space-6)', display: 'flex', justifyContent: 'center' }}>
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : items.length === 0 ? (
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
          🎉 Nessuna submission KYC pending.
        </div>
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
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontSize: 'var(--font-sm)',
              }}
            >
              <div style={{ flex: 1 }}>
                <code style={{ fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>
                  {s.user_id.slice(0, 12)}…
                </code>
                <p
                  style={{
                    margin: '2px 0 0',
                    fontSize: 'var(--font-xs)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {s.submitted_at ? new Date(s.submitted_at).toLocaleString('it-IT') : '—'} ·{' '}
                  <span style={{ color: 'var(--color-warning)' }}>{s.status}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => decide(s.id, 'reject')}
                disabled={decidingId === s.id}
                style={{
                  padding: '6px 12px',
                  background: 'transparent',
                  border: '1px solid var(--color-danger)',
                  color: 'var(--color-danger)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <X size={12} /> Reject
              </button>
              <button
                type="button"
                onClick={() => decide(s.id, 'approve')}
                disabled={decidingId === s.id}
                style={{
                  padding: '6px 12px',
                  background: 'var(--color-success)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {decidingId === s.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <>
                    <Check size={12} /> Approve
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
