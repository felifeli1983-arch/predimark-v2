'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Loader2, Flag } from 'lucide-react'

interface FeatureFlag {
  key: string
  description: string | null
  enabled: boolean | null
  rollout_percentage: number | null
}

export default function AdminFeatureFlagsPage() {
  const { getAccessToken } = usePrivy()
  const [items, setItems] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)

  async function load() {
    const token = await getAccessToken()
    if (!token) return
    const res = await fetch('/api/v1/admin/feature-flags', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const data = (await res.json()) as { items: FeatureFlag[] }
      setItems(data.items)
    }
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  async function toggle(key: string, current: boolean) {
    setSavingKey(key)
    try {
      const token = await getAccessToken()
      if (!token) return
      await fetch('/api/v1/admin/feature-flags', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabled: !current }),
      })
      await load()
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
          <Flag size={20} style={{ display: 'inline', marginRight: 8 }} />
          Feature Flags
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Toggle features on/off live. Rollout % per gradual deploy (in MA8 polish).
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
          Nessun feature flag configurato.
        </div>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
          {items.map((f) => (
            <li
              key={f.key}
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <code style={{ fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>
                  {f.key}
                </code>
                {f.description && (
                  <p
                    style={{
                      margin: '2px 0 0',
                      fontSize: 'var(--font-xs)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {f.description}
                  </p>
                )}
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                  Rollout: {f.rollout_percentage ?? 0}%
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggle(f.key, f.enabled ?? false)}
                disabled={savingKey === f.key}
                style={{
                  padding: '6px 14px',
                  background: f.enabled ? 'var(--color-success)' : 'var(--color-bg-tertiary)',
                  color: f.enabled ? '#fff' : 'var(--color-text-muted)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {savingKey === f.key ? '…' : f.enabled ? 'ON' : 'OFF'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
