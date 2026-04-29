'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Send, Loader2 } from 'lucide-react'

export default function AdminBroadcastPage() {
  const { getAccessToken } = usePrivy()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState('all')
  const [type, setType] = useState('announcement')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function send() {
    setSending(true)
    setResult(null)
    try {
      const token = await getAccessToken()
      if (!token) return
      const res = await fetch('/api/v1/admin/notifications/broadcast', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, audience, type }),
      })
      const json = (await res.json()) as { sent?: number; error?: { message?: string } }
      if (!res.ok) {
        setResult(`❌ ${json.error?.message ?? 'Errore'}`)
      } else {
        setResult(`✅ Inviata a ${json.sent ?? 0} utenti`)
        setTitle('')
        setBody('')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 600 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
          <Send size={20} style={{ display: 'inline', marginRight: 8 }} />
          Broadcast Notifications
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Invia annuncio a tutti gli utenti. Push/email/Telegram via dispatcher cron.
        </p>
      </header>

      <Field label="Titolo" value={title} onChange={setTitle} />
      <Field label="Messaggio" value={body} onChange={setBody} textarea />
      <Select
        label="Audience"
        value={audience}
        onChange={setAudience}
        options={[
          { value: 'all', label: 'Tutti gli utenti' },
          { value: 'active_7d', label: 'Active ultimi 7 giorni' },
          { value: 'verified_creators', label: 'Verified Creators only' },
        ]}
      />
      <Select
        label="Tipo"
        value={type}
        onChange={setType}
        options={[
          { value: 'announcement', label: 'Annuncio' },
          { value: 'product_update', label: 'Update prodotto' },
          { value: 'maintenance', label: 'Maintenance' },
        ]}
      />

      {result && (
        <p
          style={{
            color: result.startsWith('✅') ? 'var(--color-success)' : 'var(--color-danger)',
          }}
        >
          {result}
        </p>
      )}

      <button
        type="button"
        onClick={send}
        disabled={sending || !title || !body}
        style={{
          padding: 'var(--space-2) var(--space-4)',
          background: 'var(--color-cta)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-md)',
          fontWeight: 700,
          cursor: 'pointer',
          opacity: sending || !title || !body ? 0.5 : 1,
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        Invia broadcast
      </button>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  textarea?: boolean
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          style={inputStyle}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      )}
    </label>
  )
}

function Select({
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
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  padding: 'var(--space-2)',
  background: 'var(--color-bg-tertiary)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--font-sm)',
  fontFamily: 'inherit',
}
