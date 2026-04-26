'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { syncUserToSupabase } from '@/lib/actions/syncUser'
import { useState } from 'react'

export default function TestAuthPage() {
  const { ready, authenticated, user, login, logout } = useAuth()
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'ok' | 'error'>('idle')
  const [syncError, setSyncError] = useState<string>('')

  async function handleManualSync() {
    if (!user) return
    setSyncStatus('syncing')
    const result = await syncUserToSupabase({
      privyDid: user.id,
      email: user.email,
      walletAddress: user.walletAddress,
    })
    if (result.error) {
      setSyncStatus('error')
      setSyncError(result.error)
    } else {
      setSyncStatus('ok')
      setSyncError('')
    }
  }

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--color-bg-primary)' }}>
      <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>
        Test Auth — Privy + Supabase sync
      </h1>

      <div className="space-y-4">
        <div style={{ color: 'var(--color-text-secondary)' }}>
          ready: <strong>{String(ready)}</strong> | authenticated:{' '}
          <strong>{String(authenticated)}</strong>
        </div>

        <div className="flex gap-4">
          <button
            onClick={authenticated ? logout : login}
            disabled={!ready}
            style={{
              background: 'var(--color-cta)',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '8px',
              opacity: ready ? 1 : 0.5,
              cursor: ready ? 'pointer' : 'not-allowed',
            }}
          >
            {ready ? (authenticated ? 'Logout' : 'Login con Privy') : 'Privy non pronto…'}
          </button>

          {authenticated && (
            <button
              onClick={handleManualSync}
              disabled={syncStatus === 'syncing'}
              style={{
                background: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                padding: '8px 20px',
                borderRadius: '8px',
                border: '1px solid var(--color-border-default)',
                cursor: syncStatus === 'syncing' ? 'wait' : 'pointer',
              }}
            >
              {syncStatus === 'syncing' ? 'Syncing…' : 'Sync manuale → Supabase'}
            </button>
          )}
        </div>

        {syncStatus !== 'idle' && (
          <div style={{ color: 'var(--color-text-secondary)' }}>
            Sync status:{' '}
            <span
              style={{
                color:
                  syncStatus === 'ok'
                    ? 'var(--color-success)'
                    : syncStatus === 'error'
                      ? 'var(--color-danger)'
                      : 'var(--color-warning)',
              }}
            >
              {syncStatus}
            </span>
            {syncError && (
              <span style={{ color: 'var(--color-danger)', marginLeft: '8px' }}>{syncError}</span>
            )}
          </div>
        )}

        {user && (
          <div
            className="p-4 rounded"
            style={{ background: 'var(--color-bg-secondary)', marginTop: '16px' }}
          >
            <div
              style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}
            >
              DEBUG
            </div>
            <pre style={{ color: 'var(--color-text-primary)', fontSize: '13px' }}>
              {JSON.stringify(
                {
                  privy_did: user.id,
                  email: user.email,
                  wallet: user.walletAddress,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
