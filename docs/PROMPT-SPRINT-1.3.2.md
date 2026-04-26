# PROMPT OPERATIVO — SPRINT 1.3.2

## Privy ↔ Supabase sync — upsert users al login

> Preparato da: Cowork (Claude Desktop)
> Data: 26 aprile 2026
> Destinatario: Claude in VS Code (incolla questo prompt nella chat VS Code)
> Sprint: MA1 / Step 1.3 / Sprint 1.3.2
> Stima: 1 ora
> Dipendenze: 1.3.1 ✅, 1.4.2 ✅

---

## Contesto

Stai implementando lo **Sprint 1.3.2** di Predimark V2. L'obiettivo è sincronizzare Privy con Supabase: ogni volta che un utente fa login tramite Privy, i suoi dati vengono scritti (o aggiornati) nella tabella `public.users` del DB Supabase.

**Stack già configurato:**

- Privy (`@privy-io/react-auth@3.22.2`) — auth provider, Sprint 1.3.1 ✅
- Supabase client (`@supabase/supabase-js`, `@supabase/ssr`) — Sprint 1.4.2 ✅
- `lib/supabase/admin.ts` → `createAdminClient()` — bypassa RLS, da usare solo server-side

**Schema tabella `public.users`** (già creata, migration applicata da Cowork):

```
id               UUID        PK, gen_random_uuid()
privy_did        TEXT        UNIQUE — identificatore Privy ('did:privy:...')
auth_id          UUID        nullable — non usato con Privy
wallet_address   TEXT        nullable
email            TEXT        nullable
email_verified   BOOLEAN     default false
username         TEXT        nullable
display_name     TEXT        nullable
avatar_url       TEXT        nullable
last_login_at    TIMESTAMPTZ nullable
updated_at       TIMESTAMPTZ default now()
created_at       TIMESTAMPTZ default now()
onboarding_completed BOOLEAN default false
is_suspended     BOOLEAN     default false
theme            TEXT        default 'dark'
language         CHAR        default 'en'
geo_block_status TEXT        default 'allowed'
```

**Nota importante**: le RLS policy su `users` usano `auth.uid()` di Supabase Auth (non usato con Privy). L'upsert userà `createAdminClient()` che bypassa RLS — corretto per le Server Actions. Non aggiungere middleware Supabase Auth in questo sprint.

> **Leggi questo prompt fino in fondo prima di iniziare.**

---

## Task

1. Creare `lib/actions/syncUser.ts` — Server Action per upsert su `public.users`
2. Aggiornare `lib/hooks/useAuth.ts` — chiamare sync dopo login Privy
3. Aggiornare `app/test-auth/page.tsx` — mostrare stato sync nel pannello debug
4. Aggiungere test per la Server Action
5. Build + validate + push

---

## Step operativi

### Step 1 — Crea `lib/actions/syncUser.ts`

Crea la cartella `lib/actions/` e il file `lib/actions/syncUser.ts`:

```typescript
'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface SyncUserInput {
  privyDid: string
  email?: string
  emailVerified?: boolean
  walletAddress?: string
}

export async function syncUserToSupabase(data: SyncUserInput): Promise<{ error: string | null }> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from('users').upsert(
      {
        privy_did: data.privyDid,
        wallet_address: data.walletAddress ?? null,
        email: data.email ?? null,
        email_verified: data.emailVerified ?? false,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'privy_did' }
    )

    if (error) return { error: error.message }
    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Errore sconosciuto' }
  }
}
```

### Step 2 — Aggiorna `lib/hooks/useAuth.ts`

Aggiungi il sync automatico al login. Il `useRef` evita chiamate multiple nella stessa sessione:

```typescript
'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useEffect, useRef } from 'react'
import { syncUserToSupabase } from '@/lib/actions/syncUser'

export interface AuthUser {
  id: string
  email?: string
  walletAddress?: string
  isCreator: boolean
}

export function useAuth() {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const hasSynced = useRef(false)

  // Sync a Supabase quando l'utente si autentica
  useEffect(() => {
    if (!ready || !authenticated || !user || hasSynced.current) return
    hasSynced.current = true

    syncUserToSupabase({
      privyDid: user.id,
      email: user.email?.address,
      emailVerified: user.email?.verified ?? false,
      walletAddress: user.wallet?.address,
    }).catch((err: unknown) => {
      console.error('[useAuth] syncUserToSupabase failed:', err)
    })
  }, [ready, authenticated, user])

  // Reset flag al logout
  useEffect(() => {
    if (!authenticated) hasSynced.current = false
  }, [authenticated])

  const authUser: AuthUser | null = user
    ? {
        id: user.id,
        email: user.email?.address,
        walletAddress: user.wallet?.address,
        isCreator: false,
      }
    : null

  return { ready, authenticated, user: authUser, login, logout }
}
```

### Step 3 — Aggiorna `app/test-auth/page.tsx`

Aggiungi al pannello debug la visualizzazione dello stato sync. Importa `syncUserToSupabase` e aggiungi un bottone per testare manualmente:

```typescript
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
    }
  }

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--color-bg-primary)' }}>
      <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>
        Test Auth — Privy + Supabase sync
      </h1>

      <div className="space-y-4">
        {/* Stato auth */}
        <div style={{ color: 'var(--color-text-secondary)' }}>
          ready: <strong>{String(ready)}</strong> | authenticated:{' '}
          <strong>{String(authenticated)}</strong>
        </div>

        {/* Bottoni */}
        <div className="flex gap-4">
          <button
            onClick={authenticated ? logout : login}
            disabled={!ready}
            style={{
              background: 'var(--color-cta)',
              color: '#000',
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
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
              }}
            >
              {syncStatus === 'syncing' ? 'Syncing…' : 'Sync manuale → Supabase'}
            </button>
          )}
        </div>

        {/* Stato sync */}
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

        {/* Debug panel */}
        {user && (
          <div
            className="p-4 rounded"
            style={{ background: 'var(--color-bg-secondary)', marginTop: '16px' }}
          >
            <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>
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
```

### Step 4 — Crea test per la Server Action

Crea `lib/actions/__tests__/syncUser.test.ts`:

```typescript
import { syncUserToSupabase } from '../syncUser'

// Mock createAdminClient
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}))

describe('syncUserToSupabase', () => {
  it('ritorna { error: null } con dati validi', async () => {
    const result = await syncUserToSupabase({
      privyDid: 'did:privy:test123',
      email: 'test@example.com',
      emailVerified: true,
      walletAddress: '0x1234567890123456789012345678901234567890',
    })
    expect(result.error).toBeNull()
  })

  it('ritorna { error: null } senza wallet (email-only user)', async () => {
    const result = await syncUserToSupabase({
      privyDid: 'did:privy:test456',
      email: 'emailonly@example.com',
    })
    expect(result.error).toBeNull()
  })
})
```

### Step 5 — Esegui test e build

```bash
npm run test
# Deve passare (2 nuovi test → 13 totali)

npm run build
# Deve compilare senza errori

npm run validate
# Deve passare
```

### Step 6 — Commit e push

```bash
git add .
git status

git commit -m "feat: Privy ↔ Supabase user sync (Sprint 1.3.2)

- lib/actions/syncUser.ts: Server Action upsert su public.users
- lib/hooks/useAuth.ts: sync automatico al login Privy
- app/test-auth/page.tsx: bottone sync manuale + stato nel debug panel
- upsert su privy_did (UNIQUE) — insert first login, update last_login_at"

git push origin main
```

---

## Acceptance criteria

- [ ] `lib/actions/syncUser.ts` esiste con `syncUserToSupabase()`
- [ ] `useAuth` chiama `syncUserToSupabase` automaticamente al login
- [ ] Dopo login su `/test-auth`, premere "Sync manuale → Supabase" → status `ok`
- [ ] `npm run test` → minimo 13 test passati
- [ ] `npm run build` → exit 0
- [ ] `npm run validate` → exit 0
- [ ] Commit pushato su GitHub
- [ ] Verifica manuale: login → sync → riga in `public.users` con `privy_did` corretto

---

## Cosa NON fare in questo sprint

- ❌ Non modificare le RLS policy su `users` — vengono gestite da Cowork
- ❌ Non aggiungere Supabase Auth middleware — non usato con Privy
- ❌ Non creare `middleware.ts` — viene in MA2
- ❌ Non gestire la lettura di `users` lato client via anon key — le RLS per Privy vengono in un secondo momento
- ❌ Non usare `createServerSupabaseClient` per la sync — usare `createAdminClient` (bypass RLS)

---

## Verifica manuale post-sprint

1. Avvia `npm run dev`
2. Vai su `http://localhost:3001/test-auth`
3. Fai login con email + OTP
4. Premi "Sync manuale → Supabase" → deve mostrare `ok`
5. **Comunicami il `privy_did` mostrato nel pannello debug** — verifico io la riga su Supabase

---

## Cosa segnalare al completamento

```
Sprint 1.3.2 completato ✅

Acceptance criteria verificati:
- lib/actions/syncUser.ts: ✅
- useAuth sync automatico: ✅
- /test-auth sync manuale: ✅ status ok
- npm run test: ✅ [N test]
- npm run build: ✅ exit 0
- npm run validate: ✅ exit 0
- push GitHub: ✅ [link commit]
- privy_did nel debug panel: [incolla qui il valore]
```

---

_Prompt preparato da Cowork — Predimark V2 Sprint 1.3.2_
_Prossimo sprint: 1.3.3 o successivi MA1_
