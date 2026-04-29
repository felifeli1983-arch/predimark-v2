'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useThemeStore } from '@/lib/stores/themeStore'
import { Sliders, Loader2 } from 'lucide-react'

interface Prefs {
  default_period_filter: string | null
  default_sort_leaderboard: string | null
  default_chart_timeframe: string | null
  show_demo_banner: boolean | null
}

export default function MePreferencesPage() {
  const { ready, authenticated, getAccessToken } = usePrivy()
  const { theme, toggleTheme } = useThemeStore()
  const [prefs, setPrefs] = useState<Prefs | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!ready || !authenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const res = await fetch('/api/v1/users/me/preferences', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok && !cancelled) setPrefs((await res.json()) as Prefs)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, authenticated, getAccessToken])

  async function update(patch: Partial<Prefs>) {
    setSaving(true)
    try {
      const token = await getAccessToken()
      if (!token) return
      await fetch('/api/v1/users/me/preferences', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      setPrefs({ ...prefs!, ...patch })
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 'var(--space-3)' }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
          <Sliders size={20} style={{ display: 'inline', marginRight: 8 }} />
          Preferenze
        </h1>
      </header>

      <Section title="Tema">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 'var(--font-sm)' }}>
            Attuale: <strong>{theme}</strong>
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              padding: '6px 12px',
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-xs)',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
            }}
          >
            Toggle {theme === 'dark' ? 'light' : 'dark'}
          </button>
        </div>
      </Section>

      <Section title="Default filters">
        <SelectField
          label="Period filter default"
          value={prefs?.default_period_filter ?? '7d'}
          onChange={(v) => update({ default_period_filter: v })}
          options={[
            { value: 'today', label: 'Oggi' },
            { value: '7d', label: '7 giorni' },
            { value: '30d', label: '30 giorni' },
            { value: 'all', label: 'All-time' },
          ]}
        />
        <SelectField
          label="Leaderboard sort default"
          value={prefs?.default_sort_leaderboard ?? 'volume'}
          onChange={(v) => update({ default_sort_leaderboard: v })}
          options={[
            { value: 'volume', label: 'Volume' },
            { value: 'roi', label: 'ROI' },
            { value: 'followers', label: 'Followers' },
          ]}
        />
        <SelectField
          label="Chart timeframe default"
          value={prefs?.default_chart_timeframe ?? '7d'}
          onChange={(v) => update({ default_chart_timeframe: v })}
          options={[
            { value: '1d', label: '1 giorno' },
            { value: '7d', label: '7 giorni' },
            { value: '30d', label: '30 giorni' },
            { value: 'all', label: 'All-time' },
          ]}
        />
      </Section>

      {saving && (
        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>Salvataggio…</p>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
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
      <h2 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 700 }}>{title}</h2>
      {children}
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <label
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
    >
      <span style={{ fontSize: 'var(--font-sm)' }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '6px 10px',
          background: 'var(--color-bg-tertiary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text-primary)',
          fontSize: 'var(--font-sm)',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
