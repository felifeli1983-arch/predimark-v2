'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Gift, Copy, Check, Loader2 } from 'lucide-react'

interface ReferralStats {
  referral_code: string | null
  referrals_count: number
  total_volume_generated: number
  total_payout_to_referrer: number
  active_referrals: number
}

export default function MeReferralsPage() {
  const { ready, authenticated, login, getAccessToken } = usePrivy()
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

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
        const res = await fetch('/api/v1/users/me/referrals', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok && !cancelled) {
          setStats((await res.json()) as ReferralStats)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, authenticated, getAccessToken])

  const referralUrl = stats?.referral_code
    ? `https://auktora.com/signup?ref=${stats.referral_code}`
    : null

  function copy() {
    if (!referralUrl) return
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!ready) return null
  if (!authenticated) {
    return (
      <Container>
        <p style={{ color: 'var(--color-text-muted)' }}>Login per vedere il tuo referral link.</p>
        <button type="button" onClick={() => login()} style={primaryBtn}>
          Sign in
        </button>
      </Container>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 'var(--space-3)' }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
          <Gift size={20} style={{ display: 'inline', marginRight: 8 }} />
          Referrals
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Invita amici, guadagna 20% delle loro fee per i primi 6 mesi.
        </p>
      </header>

      {loading ? (
        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
      ) : (
        <>
          <div
            style={{
              padding: 'var(--space-3)',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div
              style={{
                fontSize: 'var(--font-xs)',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 6,
              }}
            >
              Il tuo link
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                value={referralUrl ?? 'Generazione codice...'}
                readOnly
                style={{
                  flex: 1,
                  padding: 'var(--space-2)',
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-sm)',
                  fontFamily: 'monospace',
                }}
              />
              <button type="button" onClick={copy} disabled={!referralUrl} style={primaryBtn}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copiato' : 'Copia'}
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 'var(--space-3)',
            }}
          >
            <Stat label="Iscritti" value={String(stats?.referrals_count ?? 0)} />
            <Stat label="Active" value={String(stats?.active_referrals ?? 0)} />
            <Stat
              label="Volume generato"
              value={`$${(stats?.total_volume_generated ?? 0).toFixed(0)}`}
            />
            <Stat
              label="Guadagnato"
              value={`$${(stats?.total_payout_to_referrer ?? 0).toFixed(2)}`}
              color="var(--color-success)"
            />
          </div>

          <div
            style={{
              padding: 'var(--space-3)',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            <strong style={{ color: 'var(--color-text-primary)' }}>Come funziona:</strong>
            <ol style={{ margin: '6px 0 0', paddingLeft: 20, lineHeight: 1.6 }}>
              <li>Condividi il tuo link sopra</li>
              <li>L&apos;amico si registra → tu ottieni il 20% delle sue fee per 6 mesi</li>
              <li>Pagamenti mensili automatici on-chain in pUSD</li>
            </ol>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div
      style={{
        padding: 'var(--space-2)',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div
        style={{
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </div>
      <strong
        style={{
          fontSize: 'var(--font-md)',
          color: color ?? 'var(--color-text-primary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </strong>
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

const primaryBtn: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
  background: 'var(--color-cta)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-sm)',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
}
