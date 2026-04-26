# PROMPT OPERATIVO — SPRINT 2.6.2

## End-to-end signup test — chiusura MA2

> Preparato da: Cowork (Claude Desktop)
> Data: 26 aprile 2026
> Destinatario: Claude in VS Code (incolla questo prompt nella chat VS Code)
> Sprint: MA2 / Step 2.6 / Sprint 2.6.2
> Stima: 1-2 ore
> Dipendenze: 2.6.1 ✅

---

## Contesto

Questo è l'**ultimo sprint di MA2**. L'obiettivo è verificare end-to-end il flusso completo:

```
Utente fa login con Privy
  → useAuth hook chiama syncUserToSupabase (Server Action)
  → UI chiama POST /api/v1/auth/session con JWT Privy
  → Endpoint verifica JWT + risolve geo + upsert DB
  → Risposta: { user: {..., geo_block_status}, session: { expires_at } }
```

Tutto il codice necessario esiste già. Questo sprint produce:

1. La pagina `/test-signup` che esercita il flusso completo via browser
2. Un hook `useSession` che i component potranno usare in futuro per chiamare l'endpoint

Se la pagina mostra dati corretti dopo login, MA2 è completata.

> **Leggi questo prompt fino in fondo prima di iniziare.**

---

## Task

1. Creare hook `lib/hooks/useSession.ts` che chiama `POST /api/v1/auth/session`
2. Creare pagina `app/test-signup/page.tsx` con flusso E2E visibile
3. Scrivere test per `useSession`
4. Verificare build e test
5. Commit e push

---

## Step operativi

### Step 1 — Crea `lib/hooks/useSession.ts`

Questo hook:

- Usa `usePrivy()` per ottenere il JWT (`getAccessToken()`)
- Chiama `POST /api/v1/auth/session` con `Authorization: Bearer <jwt>`
- Gestisce loading / error / data

```typescript
'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useState, useCallback } from 'react'

export interface SessionUser {
  id: string
  wallet_address: string | null
  username: string | null
  email: string | null
  country_code: string | null
  geo_block_status: string | null
  language: string | null
  onboarding_completed: boolean | null
}

export interface SessionData {
  user: SessionUser
  session: { expires_at: string }
}

export type SessionStatus = 'idle' | 'loading' | 'ok' | 'error'

export function useSession() {
  const { getAccessToken } = usePrivy()
  const [status, setStatus] = useState<SessionStatus>('idle')
  const [data, setData] = useState<SessionData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchSession = useCallback(async () => {
    setStatus('loading')
    setError(null)

    try {
      const token = await getAccessToken()
      if (!token) {
        setStatus('error')
        setError('JWT Privy non disponibile — sei loggato?')
        return
      }

      const res = await fetch('/api/v1/auth/session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const body = await res.json()

      if (!res.ok) {
        setStatus('error')
        setError(body?.error?.message ?? `HTTP ${res.status}`)
        return
      }

      setData(body as SessionData)
      setStatus('ok')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    }
  }, [getAccessToken])

  return { status, data, error, fetchSession }
}
```

### Step 2 — Crea `app/test-signup/page.tsx`

```typescript
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
            {authenticated ? `✅ Loggato come ${user?.email ?? user?.walletAddress ?? user?.id}` : '⏳ Non loggato'}
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

      {/* Risultato */}
      {status !== 'idle' && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            Risposta endpoint
          </h2>

          {status === 'error' && (
            <div
              className="p-4 rounded"
              style={{ background: 'var(--color-danger-bg, #2a1a1a)', border: '1px solid var(--color-danger)' }}
            >
              <span style={{ color: 'var(--color-danger)' }}>❌ Errore: {error}</span>
            </div>
          )}

          {status === 'ok' && data && (
            <div className="space-y-4">
              {/* Geo status badge */}
              <div className="flex items-center gap-3">
                <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>geo_block_status:</span>
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

              {/* JSON completo */}
              <div
                className="p-4 rounded"
                style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-default)' }}
              >
                <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>
                  RESPONSE JSON
                </div>
                <pre style={{ color: 'var(--color-text-primary)', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Checklist MA2 */}
      <section>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          Checklist MA2
        </h2>
        <div className="space-y-2" style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          <div>{authenticated ? '✅' : '⬜'} Privy login funziona</div>
          <div>{status === 'ok' ? '✅' : '⬜'} /api/v1/auth/session risponde 200</div>
          <div>{data?.user.id ? '✅' : '⬜'} user.id presente in risposta</div>
          <div>{data?.user.geo_block_status !== undefined ? '✅' : '⬜'} geo_block_status risolto</div>
          <div>{data?.session.expires_at ? '✅' : '⬜'} session.expires_at presente</div>
        </div>
      </section>
    </div>
  )
}
```

### Step 3 — Crea `lib/hooks/__tests__/useSession.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('@privy-io/react-auth', () => ({
  usePrivy: vi.fn(),
}))

import { useSession } from '../useSession'
import { usePrivy } from '@privy-io/react-auth'

describe('useSession', () => {
  const mockGetAccessToken = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePrivy).mockReturnValue({
      getAccessToken: mockGetAccessToken,
    } as never)
  })

  it('inizia in stato idle', () => {
    const { result } = renderHook(() => useSession())
    expect(result.current.status).toBe('idle')
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('errore se getAccessToken ritorna null', async () => {
    mockGetAccessToken.mockResolvedValueOnce(null)
    const { result } = renderHook(() => useSession())

    await act(async () => {
      await result.current.fetchSession()
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toContain('JWT Privy non disponibile')
  })

  it('ok con risposta 200', async () => {
    mockGetAccessToken.mockResolvedValueOnce('valid-jwt')

    const mockResponse = {
      user: {
        id: 'uuid-test',
        wallet_address: '0xabc',
        username: null,
        email: 'test@example.com',
        country_code: 'DE',
        geo_block_status: 'allowed',
        language: null,
        onboarding_completed: false,
      },
      session: { expires_at: '2026-05-03T00:00:00Z' },
    }

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as never)

    const { result } = renderHook(() => useSession())

    await act(async () => {
      await result.current.fetchSession()
    })

    expect(result.current.status).toBe('ok')
    expect(result.current.data?.user.id).toBe('uuid-test')
    expect(result.current.data?.user.geo_block_status).toBe('allowed')
  })

  it('errore con risposta HTTP 401', async () => {
    mockGetAccessToken.mockResolvedValueOnce('invalid-jwt')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: { code: 'AUTH_INVALID', message: 'JWT non valido' } }),
    } as never)

    const { result } = renderHook(() => useSession())

    await act(async () => {
      await result.current.fetchSession()
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('JWT non valido')
  })
})
```

### Step 4 — Verifica build e test

```bash
npm run test
# Target: ≥ 21 test (17 esistenti + 4 nuovi useSession)

npm run build
# Deve compilare senza errori TypeScript
# Deve mostrare route /test-signup

npm run validate
# Deve passare
```

### Step 5 — Test manuale nel browser

Avvia il dev server e vai su `http://localhost:3001/test-signup`:

1. Clicca **Login con Privy** → fai login con la tua email
2. Clicca **Chiama /api/v1/auth/session**
3. Verifica che la risposta mostri:
   - `user.id` — UUID del tuo record in `public.users`
   - `user.geo_block_status` — `'allowed'` (sei in Italia → dovrebbe essere `'demo_only'` se IT è in geo_blocks, oppure `'allowed'` se non lo è)
   - `session.expires_at` — data fra 7 giorni
4. Tutte le 5 checklist in fondo alla pagina mostrano ✅

Segnalami l'output JSON che vedi (specialmente `geo_block_status` e `country_code`).

### Step 6 — Commit e push

```bash
git add .
git status

git commit -m "feat: useSession hook + /test-signup page — E2E flow completo MA2 (Sprint 2.6.2)

- lib/hooks/useSession.ts: hook che chiama POST /api/v1/auth/session con JWT Privy
- app/test-signup/page.tsx: pagina E2E con checklist MA2
- test: 4 test per useSession (idle, null-token, 200ok, 401)"

git push origin main
```

---

## Acceptance criteria

- [ ] `lib/hooks/useSession.ts` esiste con `fetchSession()` e stati `idle/loading/ok/error`
- [ ] `app/test-signup/page.tsx` esiste e si carica senza errori
- [ ] Pagina in browser: dopo login + click bottone → risposta 200 con `user.id` e `session.expires_at`
- [ ] `geo_block_status` visibile nella risposta
- [ ] `npm run test` → almeno 21 test passati
- [ ] `npm run build` → exit 0
- [ ] `npm run validate` → exit 0
- [ ] Commit pushato su GitHub

---

## Cosa segnalare al completamento

```
Sprint 2.6.2 completato ✅ — MA2 CHIUSA

Acceptance criteria verificati:
- useSession hook: ✅
- /test-signup page: ✅
- Test manuale browser:
  - Login Privy: ✅
  - /api/v1/auth/session 200: ✅
  - user.id: [valore]
  - country_code: [valore]
  - geo_block_status: [allowed / demo_only / blocked]
  - session.expires_at: ✅
- npm run test: ✅ [N] test
- npm run build: ✅ exit 0
- push GitHub: ✅ [link commit]

Deviazioni dal prompt: [eventuali]
```

---

_Prompt preparato da Cowork — Predimark V2 Sprint 2.6.2_
_Questo è l'ultimo sprint MA2. Al completamento → MA3 (Core Pages)_
