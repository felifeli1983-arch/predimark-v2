'use client'

import { useAuth } from '@/lib/hooks/useAuth'

export default function TestAuthPage() {
  const { ready, authenticated, user, login, logout } = useAuth()

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--color-bg-primary)' }}>
      <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>
        Test Auth — Privy
      </h1>

      <div className="space-y-4">
        <div style={{ color: 'var(--color-text-secondary)' }}>
          Status:{' '}
          <span
            style={{
              color: authenticated ? 'var(--color-success)' : 'var(--color-danger)',
            }}
          >
            {authenticated ? 'Autenticato' : 'Non autenticato'}
          </span>
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
            className="px-6 py-2 rounded font-semibold"
            style={{
              background: 'var(--color-brand-primary)',
              color: 'var(--color-bg-primary)',
            }}
          >
            Login con Privy
          </button>
        )}
      </div>
    </div>
  )
}
