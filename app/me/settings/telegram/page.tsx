'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'
import { MessageCircle, Loader2, Check } from 'lucide-react'

interface ConnectStatus {
  is_linked: boolean
  is_premium: boolean
  telegram_chat_id?: string | null
  telegram_username?: string | null
}

interface ConnectResponse {
  code: string
  bot_url: string
  bot_username: string
  expires_at: string
  instructions: string
}

export default function MeTelegramPage() {
  const { ready, authenticated, getAccessToken, login } = usePrivy()
  const [status, setStatus] = useState<ConnectStatus | null>(null)
  const [connectData, setConnectData] = useState<ConnectResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

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
        const res = await fetch('/api/v1/telegram/connect', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok && !cancelled) setStatus((await res.json()) as ConnectStatus)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, authenticated, getAccessToken])

  async function generate() {
    setGenerating(true)
    try {
      const token = await getAccessToken()
      if (!token) return
      const res = await fetch('/api/v1/telegram/connect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      if (res.ok) setConnectData((await res.json()) as ConnectResponse)
    } finally {
      setGenerating(false)
    }
  }

  if (!ready) return null
  if (!authenticated) {
    return (
      <Container>
        <p>Login per connettere Telegram.</p>
        <button type="button" onClick={() => login()} style={primaryBtn}>
          Sign in
        </button>
      </Container>
    )
  }

  if (loading)
    return (
      <Container>
        <Loader2 size={20} className="animate-spin" />
      </Container>
    )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 'var(--space-3)' }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
          <MessageCircle size={20} style={{ display: 'inline', marginRight: 8 }} />
          Telegram Bot
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Ricevi alert push trade Creator + signal AI direttamente su @AuktoraBot.
        </p>
      </header>

      {status?.is_linked ? (
        <div
          style={{
            padding: 'var(--space-3)',
            background: 'color-mix(in srgb, var(--color-success) 12%, var(--color-bg-secondary))',
            border: '1px solid var(--color-success)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <strong style={{ color: 'var(--color-success)' }}>
            <Check size={14} style={{ display: 'inline', marginRight: 4 }} />
            Telegram linkato
          </strong>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 'var(--font-sm)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Chat ID: <code style={{ fontFamily: 'monospace' }}>{status.telegram_chat_id}</code>
            {status.telegram_username && ` (@${status.telegram_username})`}
          </p>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            Premium: {status.is_premium ? '✅ Attivo' : '❌ Non attivo (€5/mese coming soon)'}
          </p>
        </div>
      ) : connectData ? (
        <div
          style={{
            padding: 'var(--space-3)',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <strong style={{ fontSize: 'var(--font-md)' }}>📱 Codice generato:</strong>
          <p style={{ margin: '6px 0 0', fontSize: 'var(--font-sm)' }}>
            {connectData.instructions}
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <a
              href={connectData.bot_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                background: 'var(--color-cta)',
                color: '#fff',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-sm)',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Apri @{connectData.bot_username}
            </a>
            <code
              style={{
                padding: '8px 12px',
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'monospace',
                fontSize: 'var(--font-md)',
                fontWeight: 700,
                color: 'var(--color-cta)',
              }}
            >
              {connectData.code}
            </code>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: 'var(--space-3)',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <p
            style={{ margin: 0, fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}
          >
            Genera un codice univoco per linkare il tuo account ad AuktoraBot.
          </p>
          <button
            type="button"
            onClick={generate}
            disabled={generating}
            style={{
              marginTop: 12,
              padding: 'var(--space-2) var(--space-4)',
              background: 'var(--color-cta)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-md)',
              fontWeight: 700,
              cursor: 'pointer',
              opacity: generating ? 0.6 : 1,
            }}
          >
            {generating ? 'Generazione…' : 'Genera link code'}
          </button>
        </div>
      )}

      <Link href="/me/settings" style={{ fontSize: 'var(--font-sm)', color: 'var(--color-cta)' }}>
        ← Torna a Settings
      </Link>
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
        gap: 12,
        padding: 'var(--space-6)',
      }}
    >
      {children}
    </div>
  )
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
}
