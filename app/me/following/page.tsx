'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'
import { Loader2, Settings as SettingsIcon, X, Users } from 'lucide-react'

interface Follow {
  id: string
  followed_creator_id: string | null
  followed_external_id: string | null
  copy_active: boolean | null
  slippage_cap_bps: number | null
  bankroll_pct: number | null
  max_per_trade_usdc: number | null
  notify_via_push: boolean | null
  notify_via_telegram: boolean | null
  created_at: string
}

export default function MeFollowingPage() {
  const { ready, authenticated, getAccessToken } = usePrivy()
  const [items, setItems] = useState<Follow[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  async function load() {
    try {
      const token = await getAccessToken()
      if (!token) return
      const res = await fetch('/api/v1/follows', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = (await res.json()) as { items: Follow[] }
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

  async function updateFollow(id: string, patch: Partial<Follow>) {
    const token = await getAccessToken()
    if (!token) return
    await fetch(`/api/v1/follows/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    await load()
  }

  async function deleteFollow(id: string) {
    if (!confirm('Smetti di seguire?')) return
    const token = await getAccessToken()
    if (!token) return
    await fetch(`/api/v1/follows/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    await load()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 'var(--space-3)' }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>Following</h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          {items.length === 0 ? 'Non segui ancora nessuno' : `${items.length} trader seguiti`}.
          Configura copy trading per ognuno (% bankroll + slippage cap).
        </p>
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
          <Users size={32} style={{ opacity: 0.4 }} />
          Nessun trader seguito.
          <Link
            href="/leaderboard"
            style={{
              padding: '6px 12px',
              background: 'var(--color-cta)',
              color: '#fff',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-sm)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Esplora leaderboard
          </Link>
        </div>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
          {items.map((f) => (
            <li
              key={f.id}
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
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Link
                  href={
                    f.followed_creator_id
                      ? `/creator/${f.followed_creator_id}`
                      : `/trader/${f.followed_external_id}`
                  }
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    textDecoration: 'none',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <strong style={{ fontSize: 'var(--font-md)' }}>
                    {f.followed_creator_id ? 'Creator' : 'External Trader'}{' '}
                    {(f.followed_creator_id ?? f.followed_external_id ?? '').slice(0, 8)}…
                  </strong>
                </Link>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => setEditingId(editingId === f.id ? null : f.id)}
                    style={iconBtn}
                    aria-label="Configura copy"
                  >
                    <SettingsIcon size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteFollow(f.id)}
                    style={iconBtn}
                    aria-label="Smetti di seguire"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <Toggle
                  label="Copy attivo"
                  value={f.copy_active ?? false}
                  onChange={(v) => updateFollow(f.id, { copy_active: v })}
                />
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                  · Bankroll {f.bankroll_pct ?? 10}% · Slippage cap{' '}
                  {((f.slippage_cap_bps ?? 200) / 100).toFixed(1)}%
                </span>
              </div>

              {editingId === f.id && (
                <div
                  style={{
                    padding: 'var(--space-2)',
                    background: 'var(--color-bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'grid',
                    gap: 'var(--space-2)',
                  }}
                >
                  <NumberField
                    label="Bankroll % (1-100)"
                    value={f.bankroll_pct ?? 10}
                    min={1}
                    max={100}
                    onSave={(v) => updateFollow(f.id, { bankroll_pct: v })}
                  />
                  <NumberField
                    label="Slippage cap bps (50-1000)"
                    value={f.slippage_cap_bps ?? 200}
                    min={50}
                    max={1000}
                    onSave={(v) => updateFollow(f.id, { slippage_cap_bps: v })}
                  />
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'var(--font-xs)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Copy trade execution: MA6.1 (auto-copy session keys). Per ora salva config in
                    follows per future activation.
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <span style={{ fontSize: 'var(--font-sm)' }}>{label}</span>
    </label>
  )
}

function NumberField({
  label,
  value,
  min,
  max,
  onSave,
}: {
  label: string
  value: number
  min: number
  max: number
  onSave: (v: number) => void
}) {
  const [v, setV] = useState(value)
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 'var(--font-sm)',
      }}
    >
      <span style={{ flex: 1 }}>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={v}
        onChange={(e) => setV(Number(e.target.value))}
        style={{
          width: 80,
          padding: '4px 8px',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-text-primary)',
        }}
      />
      <button
        type="button"
        onClick={() => onSave(v)}
        disabled={v === value}
        style={{
          padding: '4px 10px',
          background: 'var(--color-cta)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-xs)',
          fontWeight: 600,
          cursor: v === value ? 'default' : 'pointer',
          opacity: v === value ? 0.5 : 1,
        }}
      >
        Save
      </button>
    </label>
  )
}

const iconBtn: React.CSSProperties = {
  padding: 4,
  background: 'var(--color-bg-tertiary)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text-secondary)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
}
