'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useSession } from '@/lib/hooks/useSession'

export default function TestSignupPage() {
  const { ready, authenticated, user, login, logout } = useAuth()
  const { status, data, error, fetchSession } = useSession()

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--color-bg-primary)' }}>
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Test Signup — E2E Flow MA2
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
        Verifica flusso completo: Privy → JWT → /api/v1/auth/session → Supabase
      </p>

      {/* Step 1: Auth */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          Step 1 — Auth Privy
        </h2>
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={authenticated ? logout : login}
            disabled={!ready}
            style={{
              background: authenticated ? 'var(--color-bg-secondary)' : 'var(--color-cta)',
              color: authenticated ? 'var(--color-text-primary)' : 'white',
              padding: '8px 20px',
              borderRadius: '8px',
              border: authenticated ? '1px solid var(--color-border-default)' : 'none',
              opacity: ready ? 1 : 0.5,
              cursor: ready ? 'pointer' : 'not-allowed',
            }}
          >
            {!ready ? 'Caricamento…' : authenticated ? 'Logout' : 'Login con Privy'}
          </button>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
            {authenticated
              ? `✅ Loggato come ${user?.email ?? user?.walletAddress ?? user?.id}`
              : '⏳ Non loggato'}
          </span>
        </div>
      </section>

      {/* Step 2: Session endpoint */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          Step 2 — Chiama POST /api/v1/auth/session
        </h2>
        <button
          onClick={fetchSession}
          disabled={!authenticated || status === 'loading'}
          style={{
            background: 'var(--color-cta)',
            color: 'white',
            padding: '8px 20px',
            borderRadius: '8px',
            opacity: authenticated && status !== 'loading' ? 1 : 0.4,
            cursor: authenticated && status !== 'loading' ? 'pointer' : 'not-allowed',
          }}
        >
          {status === 'loading' ? 'Chiamata in corso…' : 'Chiama /api/v1/auth/session'}
        </button>
        {!authenticated && (
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Fai prima il login (Step 1)
          </p>
        )}
      </section>

      {status !== 'idle' && (
        <section className="mb-8">
          <h2
            className="text-lg font-semibold mb-3"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Risposta endpoint
          </h2>

          {status === 'error' && (
            <div
              className="p-4 rounded"
              style={{
                background: 'var(--color-danger-bg, #2a1a1a)',
                border: '1px solid var(--color-danger)',
              }}
            >
              <span style={{ color: 'var(--color-danger)' }}>❌ Errore: {error}</span>
            </div>
          )}

          {status === 'ok' && data && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  geo_block_status:
                </span>
                <span
                  style={{
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background:
                      data.user.geo_block_status === 'allowed'
                        ? 'var(--color-success-bg, #1a2a1a)'
                        : data.user.geo_block_status === 'demo_only'
                          ? 'var(--color-warning-bg, #2a2a1a)'
                          : 'var(--color-danger-bg, #2a1a1a)',
                    color:
                      data.user.geo_block_status === 'allowed'
                        ? 'var(--color-success)'
                        : data.user.geo_block_status === 'demo_only'
                          ? 'var(--color-warning)'
                          : 'var(--color-danger)',
                  }}
                >
                  {data.user.geo_block_status ?? 'unknown'}
                </span>
              </div>

              <div
                className="p-4 rounded"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-default)',
                }}
              >
                <div
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '12px',
                    marginBottom: '8px',
                  }}
                >
                  RESPONSE JSON
                </div>
                <pre
                  style={{
                    color: 'var(--color-text-primary)',
                    fontSize: '12px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          Checklist MA2
        </h2>
        <div className="space-y-2" style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          <div>{authenticated ? '✅' : '⬜'} Privy login funziona</div>
          <div>{status === 'ok' ? '✅' : '⬜'} /api/v1/auth/session risponde 200</div>
          <div>{data?.user.id ? '✅' : '⬜'} user.id presente in risposta</div>
          <div>
            {data?.user.geo_block_status !== undefined ? '✅' : '⬜'} geo_block_status risolto
          </div>
          <div>{data?.session.expires_at ? '✅' : '⬜'} session.expires_at presente</div>
        </div>
      </section>
    </div>
  )
}
