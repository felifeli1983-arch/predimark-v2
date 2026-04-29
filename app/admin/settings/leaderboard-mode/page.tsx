'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'
import { BarChart2, Loader2 } from 'lucide-react'

interface FeatureFlag {
  key: string
  description: string | null
  enabled: boolean | null
}

/**
 * N3 — Leaderboard mode admin toggle.
 * Sprint 6.3.3 — Toggle 1-tab vs 2-tab.
 * Backed by feature_flags.leaderboard_unified_mode (boolean).
 */
export default function AdminLeaderboardModePage() {
  const { getAccessToken } = usePrivy()
  const [flag, setFlag] = useState<FeatureFlag | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load() {
    const token = await getAccessToken()
    if (!token) return
    const res = await fetch('/api/v1/admin/feature-flags', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const data = (await res.json()) as { items: FeatureFlag[] }
      const f = data.items.find((i) => i.key === 'leaderboard_unified_mode')
      setFlag(f ?? null)
    }
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  async function toggle() {
    if (!flag) return
    setSaving(true)
    try {
      const token = await getAccessToken()
      if (!token) return
      await fetch('/api/v1/admin/feature-flags', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'leaderboard_unified_mode', enabled: !flag.enabled }),
      })
      await load()
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div style={{ padding: 'var(--space-6)', display: 'flex', justifyContent: 'center' }}>
        <Loader2 size={20} className="animate-spin" />
      </div>
    )

  const isUnified = flag?.enabled ?? false

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
          <BarChart2 size={20} style={{ display: 'inline', marginRight: 8 }} />
          Leaderboard Mode
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Modalità leaderboard pubblico (`/leaderboard`).
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        <ModeCard
          title="Unified (1 tab)"
          description="Verified Creators + Top Polymarket Traders mescolati in un'unica leaderboard ordinata per ROI / volume."
          active={isUnified}
        />
        <ModeCard
          title="Separated (2 tab)"
          description="Tab separati: Verified Creators (opt-in Auktora) e Top Polymarket Traders (no opt-in). Default."
          active={!isUnified}
        />
      </div>

      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        style={{
          padding: 'var(--space-2) var(--space-4)',
          background: 'var(--color-cta)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-md)',
          fontWeight: 700,
          cursor: 'pointer',
          alignSelf: 'flex-start',
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? 'Salvataggio…' : `Switch to ${isUnified ? 'Separated' : 'Unified'}`}
      </button>

      <Link
        href="/leaderboard"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 'var(--font-sm)', color: 'var(--color-cta)', alignSelf: 'flex-start' }}
      >
        Apri /leaderboard ↗
      </Link>
    </div>
  )
}

function ModeCard({
  title,
  description,
  active,
}: {
  title: string
  description: string
  active: boolean
}) {
  return (
    <div
      style={{
        padding: 'var(--space-3)',
        background: active
          ? 'color-mix(in srgb, var(--color-cta) 12%, var(--color-bg-secondary))'
          : 'var(--color-bg-secondary)',
        border: active ? '2px solid var(--color-cta)' : '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 'var(--font-md)',
          fontWeight: 700,
          color: active ? 'var(--color-cta)' : 'var(--color-text-primary)',
        }}
      >
        {active && '✓ '}
        {title}
      </h3>
      <p
        style={{
          margin: '6px 0 0',
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
    </div>
  )
}
