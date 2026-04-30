'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

// Privy hooks → no SSG prerender (durante CI build con stub envs).
export const dynamic = 'force-dynamic'

interface ApplicationStatus {
  status: 'none' | 'pending' | 'approved' | 'rejected'
  is_verified?: boolean
  rejection_reason?: string | null
}

export default function CreatorApplyPage() {
  const { ready, authenticated, login, getAccessToken } = usePrivy()
  const router = useRouter()
  const [status, setStatus] = useState<ApplicationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    twitter_handle: '',
    discord_handle: '',
    website_url: '',
    specialization: '',
  })

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
        if (!token) throw new Error('Sessione scaduta')
        const res = await fetch('/api/v1/creators/apply', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as ApplicationStatus
        if (!cancelled) setStatus(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Errore caricamento')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, authenticated, getAccessToken])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const token = await getAccessToken()
      if (!token) throw new Error('Sessione scaduta')
      const res = await fetch('/api/v1/creators/apply', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: form.display_name,
          bio: form.bio || undefined,
          twitter_handle: form.twitter_handle || undefined,
          discord_handle: form.discord_handle || undefined,
          website_url: form.website_url || undefined,
          specialization: form.specialization
            ? form.specialization
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
                .slice(0, 5)
            : undefined,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null
        throw new Error(body?.error?.message ?? `HTTP ${res.status}`)
      }
      setStatus({ status: 'pending' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (!ready || loading) {
    return (
      <Container>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
      </Container>
    )
  }

  if (!authenticated) {
    return (
      <Container>
        <h1 style={titleStyle}>Diventa Creator Auktora</h1>
        <p style={bodyStyle}>
          Accedi con il tuo wallet per applicare al programma Verified Creator.
        </p>
        <button type="button" onClick={() => login()} style={primaryBtn}>
          Sign in
        </button>
      </Container>
    )
  }

  if (status?.status === 'pending') {
    return (
      <Container>
        <CheckCircle2 size={48} style={{ color: 'var(--color-warning)' }} />
        <h1 style={titleStyle}>Application in review</h1>
        <p style={bodyStyle}>
          Stiamo verificando il tuo storico Polymarket. Riceverai email entro 48h con la decisione.
        </p>
        <button type="button" onClick={() => router.push('/leaderboard')} style={primaryBtn}>
          Esplora leaderboard
        </button>
      </Container>
    )
  }

  if (status?.status === 'approved' && status.is_verified) {
    return (
      <Container>
        <CheckCircle2 size={48} style={{ color: 'var(--color-success)' }} />
        <h1 style={titleStyle}>Sei un Verified Creator!</h1>
        <p style={bodyStyle}>
          Il tuo profilo pubblico è attivo. Promuovi Auktora alla tua audience per guadagnare 0.3%
          del volume copiato.
        </p>
        <button type="button" onClick={() => router.push('/me')} style={primaryBtn}>
          Vai al tuo profilo
        </button>
      </Container>
    )
  }

  if (status?.status === 'rejected') {
    return (
      <Container>
        <h1 style={titleStyle}>Application rifiutata</h1>
        <p style={bodyStyle}>
          Motivo: {status.rejection_reason ?? 'non specificato'}. Puoi riapplicare quando hai più
          storico Polymarket.
        </p>
      </Container>
    )
  }

  return (
    <Container>
      <Link
        href="/me"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-muted)',
          textDecoration: 'none',
          alignSelf: 'flex-start',
        }}
      >
        <ArrowLeft size={14} /> Indietro
      </Link>

      <h1 style={titleStyle}>Diventa Creator Auktora</h1>
      <p style={bodyStyle}>
        Riceverai 0.3% del volume copiato dai tuoi follower (= 30% del builder fee 1%). Skin in the
        game obbligatorio: i tuoi trade Polymarket vengono verificati on-chain. Min. 30 trade reali
        nello storico.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          width: '100%',
          maxWidth: 480,
        }}
      >
        <Field
          label="Display name *"
          value={form.display_name}
          onChange={(v) => setForm({ ...form, display_name: v })}
          required
          maxLength={40}
          placeholder="Es. CryptoSage"
        />
        <Field
          label="Bio"
          value={form.bio}
          onChange={(v) => setForm({ ...form, bio: v })}
          textarea
          maxLength={500}
          placeholder="Racconta la tua strategia, expertise, track record"
        />
        <Field
          label="Twitter handle"
          value={form.twitter_handle}
          onChange={(v) => setForm({ ...form, twitter_handle: v })}
          placeholder="cryptosage (senza @)"
        />
        <Field
          label="Discord handle"
          value={form.discord_handle}
          onChange={(v) => setForm({ ...form, discord_handle: v })}
          placeholder="cryptosage#1234"
        />
        <Field
          label="Sito web"
          value={form.website_url}
          onChange={(v) => setForm({ ...form, website_url: v })}
          placeholder="https://..."
        />
        <Field
          label="Specializzazioni (max 5, separate da virgola)"
          value={form.specialization}
          onChange={(v) => setForm({ ...form, specialization: v })}
          placeholder="Crypto, Politics, Sports, AI"
        />

        {error && (
          <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-sm)' }}>{error}</p>
        )}

        <button type="submit" disabled={submitting || !form.display_name} style={primaryBtn}>
          {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Invia application'}
        </button>
      </form>
    </Container>
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
        padding: 'var(--space-4)',
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  textarea,
  ...rest
}: {
  label: string
  value: string
  onChange: (v: string) => void
  textarea?: boolean
  required?: boolean
  maxLength?: number
  placeholder?: string
}) {
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        fontSize: 'var(--font-sm)',
        color: 'var(--color-text-secondary)',
        textAlign: 'left',
      }}
    >
      {label}
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          style={inputStyle}
          {...rest}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
          {...rest}
        />
      )}
    </label>
  )
}

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 'var(--font-2xl)',
  fontWeight: 700,
  color: 'var(--color-text-primary)',
}

const bodyStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 'var(--font-sm)',
  color: 'var(--color-text-secondary)',
  lineHeight: 1.6,
  maxWidth: 480,
}

const primaryBtn: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-4)',
  background: 'var(--color-cta)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-md)',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
}

const inputStyle: React.CSSProperties = {
  padding: 'var(--space-2)',
  background: 'var(--color-bg-tertiary)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--font-base)',
  fontFamily: 'inherit',
}
