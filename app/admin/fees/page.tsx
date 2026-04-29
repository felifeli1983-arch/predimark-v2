'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Loader2, Save } from 'lucide-react'

interface FeesData {
  builder_fee_default_bps: number
  copy_trading_builder_fee_bps: number
  copy_trading_creator_share_bps: number
  copy_trading_external_share_bps: number
  copy_trading_min_payout_usd: number
  updated_at: string | null
}

export default function AdminFeesPage() {
  const { getAccessToken } = usePrivy()
  const [data, setData] = useState<FeesData | null>(null)
  const [edit, setEdit] = useState<Partial<FeesData>>({})
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const res = await fetch('/api/v1/admin/fees', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as FeesData
        if (!cancelled) setData(json)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Errore')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [getAccessToken])

  async function handleSave() {
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      const token = await getAccessToken()
      if (!token) throw new Error('No token')
      const res = await fetch('/api/v1/admin/fees', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...edit, reason }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null
        throw new Error(body?.error?.message ?? `HTTP ${res.status}`)
      }
      setSuccess('Fee aggiornati. Nuovi valori applicati live.')
      setEdit({})
      setReason('')
      // Refresh data
      const refreshRes = await fetch('/api/v1/admin/fees', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (refreshRes.ok) setData((await refreshRes.json()) as FeesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore save')
    } finally {
      setSaving(false)
    }
  }

  if (!data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-6)' }}>
        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
          Fee Configuration
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Cambi applicati LIVE a tutti i nuovi trade. Audit log obbligatorio (reason note).
        </p>
      </header>

      <Section title="Builder fee — trade normali">
        <FieldBps
          label="Y1 (acquisition phase)"
          help="Default 0 bps. Match Betmoar zero-fee per acquisition. Y2 post-KYC = 30 bps."
          current={data.builder_fee_default_bps}
          edit={edit.builder_fee_default_bps}
          onChange={(v) => setEdit({ ...edit, builder_fee_default_bps: v })}
          max={200}
        />
      </Section>

      <Section title="Copy trading">
        <FieldBps
          label="Builder fee copy trades"
          help="Default 100 bps (1%). Range 0-200."
          current={data.copy_trading_builder_fee_bps}
          edit={edit.copy_trading_builder_fee_bps}
          onChange={(v) => setEdit({ ...edit, copy_trading_builder_fee_bps: v })}
          max={200}
        />
        <FieldBps
          label="Creator revenue share (default globale)"
          help="Default 3000 bps (30%). Range 0-5000. Per-Creator override via /admin/creators/[id]."
          current={data.copy_trading_creator_share_bps}
          edit={edit.copy_trading_creator_share_bps}
          onChange={(v) => setEdit({ ...edit, copy_trading_creator_share_bps: v })}
          max={5000}
        />
        <Field
          label="External Traders revenue share"
          help="Sempre 0% — 100% va ad Auktora. Cambio strategico, contattare team product."
          value={`${data.copy_trading_external_share_bps} bps (read-only)`}
          readOnly
        />
        <FieldBps
          label="Min payout USD/mese"
          help="Soglia minima per distribuire revenue Creator on-chain."
          current={data.copy_trading_min_payout_usd}
          edit={edit.copy_trading_min_payout_usd}
          onChange={(v) => setEdit({ ...edit, copy_trading_min_payout_usd: v })}
          max={1000}
          suffix="USD"
        />
      </Section>

      <div
        style={{
          padding: 'var(--space-3)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
        }}
      >
        Last modified:{' '}
        {data.updated_at ? new Date(data.updated_at).toLocaleString('it-IT') : 'mai modificato'}
      </div>

      <label
        style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--font-sm)' }}
      >
        Reason note (richiesto, min 5 caratteri)
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          placeholder="Es: Switch Y1→Y2 post-KYC builder profile"
          style={{
            padding: 'var(--space-2)',
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--font-sm)',
            fontFamily: 'inherit',
          }}
        />
      </label>

      {error && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-sm)' }}>{error}</p>}
      {success && (
        <p style={{ color: 'var(--color-success)', fontSize: 'var(--font-sm)' }}>{success}</p>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || Object.keys(edit).length === 0 || reason.trim().length < 5}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--color-cta)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-md)',
            fontWeight: 700,
            cursor:
              saving || Object.keys(edit).length === 0 || reason.trim().length < 5
                ? 'not-allowed'
                : 'pointer',
            opacity: saving || Object.keys(edit).length === 0 || reason.trim().length < 5 ? 0.5 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save changes
        </button>
        {Object.keys(edit).length > 0 && (
          <button
            type="button"
            onClick={() => {
              setEdit({})
              setReason('')
            }}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              background: 'transparent',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-secondary)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-base)',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        )}
      </div>
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
        gap: 'var(--space-3)',
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 'var(--font-md)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  )
}

function FieldBps({
  label,
  help,
  current,
  edit,
  onChange,
  max,
  suffix,
}: {
  label: string
  help: string
  current: number
  edit?: number
  onChange: (v: number) => void
  max: number
  suffix?: string
}) {
  const value = edit ?? current
  const dirty = edit !== undefined && edit !== current
  const pct = (value / 10000) * 100
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontSize: 'var(--font-sm)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
        }}
      >
        {label}{' '}
        {dirty && (
          <span style={{ color: 'var(--color-warning)', fontSize: 'var(--font-xs)' }}>
            (modificato)
          </span>
        )}
      </span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          type="number"
          min={0}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: 100,
            padding: '6px 10px',
            background: 'var(--color-bg-tertiary)',
            border: `1px solid ${dirty ? 'var(--color-warning)' : 'var(--color-border-subtle)'}`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--font-sm)',
            fontVariantNumeric: 'tabular-nums',
          }}
        />
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
          {suffix ?? `bps (${pct.toFixed(2)}%)`}
        </span>
      </div>
      <span
        style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', lineHeight: 1.4 }}
      >
        {help}
      </span>
    </label>
  )
}

function Field({
  label,
  help,
  value,
  readOnly,
}: {
  label: string
  help: string
  value: string
  readOnly?: boolean
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontSize: 'var(--font-sm)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
        }}
      >
        {label}
      </span>
      <input
        type="text"
        value={value}
        readOnly={readOnly}
        style={{
          padding: '6px 10px',
          background: 'var(--color-bg-tertiary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-sm)',
          fontStyle: 'italic',
        }}
      />
      <span
        style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', lineHeight: 1.4 }}
      >
        {help}
      </span>
    </label>
  )
}
