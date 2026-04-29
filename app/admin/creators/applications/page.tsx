'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Loader2, Check, X, MessageCircle, Globe, AtSign } from 'lucide-react'

interface Application {
  user_id: string
  applied_at: string
  application_status: string
  bio_creator: string | null
  twitter_handle: string | null
  discord_handle: string | null
  website_url: string | null
  specialization: string[] | null
}

export default function AdminCreatorsApplicationsPage() {
  const { getAccessToken } = usePrivy()
  const [items, setItems] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [decidingId, setDecidingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setError(null)
    try {
      const token = await getAccessToken()
      if (!token) return
      const res = await fetch('/api/v1/admin/creators/applications?status=pending', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { items: Application[] }
      setItems(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  async function handleDecide(creatorId: string, decision: 'approve' | 'reject') {
    setDecidingId(creatorId)
    try {
      let reason: string | undefined
      if (decision === 'reject') {
        reason = window.prompt('Reason rejection (min 5 caratteri):') ?? undefined
        if (!reason || reason.trim().length < 5) {
          setDecidingId(null)
          return
        }
      }
      const token = await getAccessToken()
      if (!token) throw new Error('No token')
      const res = await fetch(`/api/v1/admin/creators/${creatorId}/decide`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, reason }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null
        throw new Error(body?.error?.message ?? `HTTP ${res.status}`)
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore decide')
    } finally {
      setDecidingId(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
          Creator Applications
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Queue applications pending. Approva → Verified Creator pubblico, profilo attivo.
        </p>
      </header>

      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}

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
            color: 'var(--color-text-muted)',
          }}
        >
          🎉 Nessuna application pending.
        </div>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 12 }}>
          {items.map((app) => (
            <li
              key={app.user_id}
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <strong
                    style={{ fontSize: 'var(--font-md)', color: 'var(--color-text-primary)' }}
                  >
                    {app.twitter_handle ? `@${app.twitter_handle}` : app.user_id.slice(0, 8)}
                  </strong>
                  <p
                    style={{
                      margin: '2px 0 0',
                      fontSize: 'var(--font-xs)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    User ID: {app.user_id} · Applied:{' '}
                    {new Date(app.applied_at).toLocaleString('it-IT')}
                  </p>
                </div>
              </div>

              {app.bio_creator && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--font-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.5,
                  }}
                >
                  {app.bio_creator}
                </p>
              )}

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {app.twitter_handle && (
                  <span style={socialLink}>
                    <AtSign size={12} /> {app.twitter_handle}
                  </span>
                )}
                {app.discord_handle && (
                  <span style={socialLink}>
                    <MessageCircle size={12} /> {app.discord_handle}
                  </span>
                )}
                {app.website_url && (
                  <a
                    href={app.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={socialLink}
                  >
                    <Globe size={12} /> {app.website_url.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>

              {app.specialization && app.specialization.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {app.specialization.map((s) => (
                    <span key={s} style={tagStyle}>
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => handleDecide(app.user_id, 'reject')}
                  disabled={decidingId === app.user_id}
                  style={{
                    ...btnSecondary,
                    color: 'var(--color-danger)',
                    borderColor: 'var(--color-danger)',
                  }}
                >
                  <X size={14} /> Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleDecide(app.user_id, 'approve')}
                  disabled={decidingId === app.user_id}
                  style={{ ...btnPrimary, background: 'var(--color-success)' }}
                >
                  {decidingId === app.user_id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Check size={14} /> Approve
                    </>
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const btnPrimary: React.CSSProperties = {
  padding: '6px 14px',
  background: 'var(--color-cta)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-sm)',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
}

const btnSecondary: React.CSSProperties = {
  padding: '6px 14px',
  background: 'transparent',
  border: '1px solid var(--color-border-subtle)',
  color: 'var(--color-text-secondary)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-sm)',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
}

const socialLink: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 'var(--font-xs)',
  color: 'var(--color-text-muted)',
  textDecoration: 'none',
}

const tagStyle: React.CSSProperties = {
  fontSize: 'var(--font-xs)',
  padding: '2px 8px',
  background: 'var(--color-bg-tertiary)',
  color: 'var(--color-text-secondary)',
  borderRadius: 'var(--radius-md)',
}
