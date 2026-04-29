'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Loader2, Save } from 'lucide-react'

interface Profile {
  id: string
  email: string | null
  username: string | null
  display_name: string | null
  bio: string | null
  language: string
  theme: string
  country_code: string | null
}

interface Preferences {
  notify_email: boolean
  notify_push: boolean
  notify_telegram: boolean
  telegram_chat_id: string | null
  profile_visible: boolean
  show_demo_banner: boolean
}

export default function MeSettingsPage() {
  const { ready, authenticated, login, getAccessToken } = usePrivy()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [prefs, setPrefs] = useState<Preferences | null>(null)
  const [profileEdit, setProfileEdit] = useState<Partial<Profile>>({})
  const [prefsEdit, setPrefsEdit] = useState<Partial<Preferences>>({})
  const [saving, setSaving] = useState<'profile' | 'prefs' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!ready || !authenticated) return
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const [pRes, prRes] = await Promise.all([
          fetch('/api/v1/users/me', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/v1/users/me/preferences', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        if (pRes.ok && !cancelled) setProfile((await pRes.json()) as Profile)
        if (prRes.ok && !cancelled) setPrefs((await prRes.json()) as Preferences)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Errore')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, authenticated, getAccessToken])

  async function saveProfile() {
    if (Object.keys(profileEdit).length === 0) return
    setSaving('profile')
    setError(null)
    setSuccess(null)
    try {
      const token = await getAccessToken()
      const res = await fetch('/api/v1/users/me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(profileEdit),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null
        throw new Error(body?.error?.message ?? `HTTP ${res.status}`)
      }
      setSuccess('Profilo aggiornato')
      setProfile({ ...profile!, ...profileEdit })
      setProfileEdit({})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    } finally {
      setSaving(null)
    }
  }

  async function savePrefs() {
    if (Object.keys(prefsEdit).length === 0) return
    setSaving('prefs')
    setError(null)
    setSuccess(null)
    try {
      const token = await getAccessToken()
      const res = await fetch('/api/v1/users/me/preferences', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(prefsEdit),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSuccess('Preferenze aggiornate')
      setPrefs({ ...prefs!, ...prefsEdit })
      setPrefsEdit({})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    } finally {
      setSaving(null)
    }
  }

  if (!ready) return null
  if (!authenticated) {
    return (
      <Container>
        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
          Accedi per gestire le impostazioni.
        </p>
        <button type="button" onClick={() => login()} style={primaryBtn}>
          Sign in
        </button>
      </Container>
    )
  }

  if (!profile || !prefs) {
    return (
      <Container>
        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
      </Container>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 'var(--space-3)' }}>
      <header>
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--font-2xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          Impostazioni
        </h1>
      </header>

      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
      {success && <p style={{ color: 'var(--color-success)' }}>{success}</p>}

      <Section title="Profilo pubblico">
        <Field
          label="Display name"
          value={profileEdit.display_name ?? profile.display_name ?? ''}
          onChange={(v) => setProfileEdit({ ...profileEdit, display_name: v })}
          placeholder="Il tuo nome pubblico"
        />
        <Field
          label="Bio"
          value={profileEdit.bio ?? profile.bio ?? ''}
          onChange={(v) => setProfileEdit({ ...profileEdit, bio: v })}
          placeholder="Breve descrizione"
          textarea
        />
        <FieldSelect
          label="Lingua"
          value={profileEdit.language ?? profile.language}
          onChange={(v) => setProfileEdit({ ...profileEdit, language: v })}
          options={[
            { value: 'en', label: 'English' },
            { value: 'it', label: 'Italiano' },
            { value: 'es', label: 'Español' },
            { value: 'pt', label: 'Português' },
            { value: 'fr', label: 'Français' },
          ]}
        />
        <Field
          label="Email (read-only)"
          value={profile.email ?? '—'}
          onChange={() => {}}
          readOnly
        />
        <Field
          label="Country (geo-detected, read-only)"
          value={profile.country_code ?? '—'}
          onChange={() => {}}
          readOnly
        />
        <button
          type="button"
          onClick={saveProfile}
          disabled={Object.keys(profileEdit).length === 0 || saving === 'profile'}
          style={{
            ...primaryBtn,
            opacity: Object.keys(profileEdit).length === 0 || saving === 'profile' ? 0.5 : 1,
          }}
        >
          {saving === 'profile' ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          Salva profilo
        </button>
      </Section>

      <Section title="Notifiche">
        <Toggle
          label="Push notifications"
          help="Alert quando un Creator segui apre/chiude posizione"
          value={prefsEdit.notify_push ?? prefs.notify_push}
          onChange={(v) => setPrefsEdit({ ...prefsEdit, notify_push: v })}
        />
        <Toggle
          label="Email notifications"
          help="Conferme trade + alert importanti via email"
          value={prefsEdit.notify_email ?? prefs.notify_email}
          onChange={(v) => setPrefsEdit({ ...prefsEdit, notify_email: v })}
        />
        <Toggle
          label="Telegram notifications"
          help={
            prefs.telegram_chat_id
              ? `Linkato (${prefs.telegram_chat_id})`
              : 'Connetti il bot in MA7'
          }
          value={prefsEdit.notify_telegram ?? prefs.notify_telegram}
          onChange={(v) => setPrefsEdit({ ...prefsEdit, notify_telegram: v })}
          disabled={!prefs.telegram_chat_id}
        />
        <Toggle
          label="Profilo pubblico"
          help="Permetti ad altri di vedere il tuo storico trade"
          value={prefsEdit.profile_visible ?? prefs.profile_visible}
          onChange={(v) => setPrefsEdit({ ...prefsEdit, profile_visible: v })}
        />
        <button
          type="button"
          onClick={savePrefs}
          disabled={Object.keys(prefsEdit).length === 0 || saving === 'prefs'}
          style={{
            ...primaryBtn,
            opacity: Object.keys(prefsEdit).length === 0 || saving === 'prefs' ? 0.5 : 1,
          }}
        >
          {saving === 'prefs' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Salva preferenze
        </button>
      </Section>
    </div>
  )
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-6)',
      }}
    >
      {children}
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
      <h2 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 700 }}>{title}</h2>
      {children}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  readOnly,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  textarea?: boolean
  readOnly?: boolean
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          rows={3}
          style={inputStyle}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          style={inputStyle}
        />
      )}
    </label>
  )
}

function FieldSelect({
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

function Toggle({
  label,
  help,
  value,
  onChange,
  disabled,
}: {
  label: string
  help: string
  value: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        style={{ flexShrink: 0 }}
      />
      <div style={{ flex: 1 }}>
        <strong style={{ fontSize: 'var(--font-sm)', display: 'block' }}>{label}</strong>
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>{help}</span>
      </div>
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

const primaryBtn: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-4)',
  background: 'var(--color-cta)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-sm)',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  alignSelf: 'flex-start',
}
