'use client'

import { useAuth } from '@/lib/hooks/useAuth'

export default function TestAuthPage() {
  const { ready, authenticated, user, login, logout } = useAuth()

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--color-bg-primary)' }}>
      <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>
        Test Auth — Privy
      </h1>

      <div className="space-y-4">
        <div
          className="p-3 rounded font-mono text-sm"
          style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}
        >
          <div>
            ready:{' '}
            <span style={{ color: ready ? 'var(--color-success)' : 'var(--color-warning)' }}>
              {String(ready)}
            </span>
          </div>
          <div>
            authenticated:{' '}
            <span
              style={{ color: authenticated ? 'var(--color-success)' : 'var(--color-text-muted)' }}
            >
              {String(authenticated)}
            </span>
          </div>
          <div>
            appId env:{' '}
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {process.env.NEXT_PUBLIC_PRIVY_APP_ID ? 'present' : 'MISSING'}
            </span>
          </div>
        </div>

        {authenticated && user && (
          <div className="p-4 rounded" style={{ background: 'var(--color-bg-secondary)' }}>
            <pre style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}

        {authenticated ? (
          <button
            onClick={logout}
            className="px-6 py-2 rounded font-semibold"
            style={{ background: 'var(--color-danger)', color: 'white' }}
          >
            Logout
          </button>
        ) : (
          <button
            onClick={login}
            disabled={!ready}
            className="px-6 py-2 rounded font-semibold disabled:opacity-50"
            style={{
              background: 'var(--color-cta)',
              color: 'white',
              cursor: ready ? 'pointer' : 'not-allowed',
            }}
          >
            {ready ? 'Login con Privy' : 'Privy non pronto…'}
          </button>
        )}
      </div>
    </div>
  )
}
