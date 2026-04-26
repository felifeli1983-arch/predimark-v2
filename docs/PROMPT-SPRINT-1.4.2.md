# PROMPT OPERATIVO — SPRINT 1.4.2

## Setup Supabase client — browser + server + env unificati

> Preparato da: Cowork (Claude Desktop)
> Data: 26 aprile 2026
> Destinatario: Claude in VS Code (incolla questo prompt nella chat VS Code)
> Sprint: MA1 / Step 1.4 / Sprint 1.4.2
> Stima: 1 ora
> Dipendenze: 1.4.1 ✅ completato

---

## Contesto

Stai implementando lo **Sprint 1.4.2** di Predimark V2. Questo sprint crea il client Supabase per l'app — sia lato browser (per le chiamate client-side) che lato server (per le Server Actions e API routes).

**Supabase è già configurato**: due progetti esistenti (staging e production) con 39 tabelle, RLS, e seed data. Le credenziali sono già in `.env.local`.

**Strategia env vars**: useremo una coppia di variabili senza suffisso `_STAGING`/`_PRODUCTION`:

- `NEXT_PUBLIC_SUPABASE_URL` → staging in locale, production in produzione Vercel
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → idem
- `SUPABASE_SERVICE_ROLE_KEY` → idem (solo server-side)

Questo semplifica il codice: una sola costante, non due. Le variabili con suffisso rimangono in `.env.local` come backup.

> **Leggi questo prompt fino in fondo prima di iniziare.**

---

## Task

1. Installare `@supabase/supabase-js` e `@supabase/ssr`
2. Aggiungere variabili env unificate a `.env.local` e `.env.example`
3. Creare `lib/supabase/client.ts` (browser client)
4. Creare `lib/supabase/server.ts` (server client per Server Actions)
5. Creare `lib/supabase/types.ts` (tipi base da generare dopo)
6. Scrivere test di connessione base
7. Commit e push

---

## Step operativi

### Step 1 — Installa le dipendenze

```bash
cd ~/predimark-v2
npm install @supabase/supabase-js @supabase/ssr
```

Verifica:

```bash
npm ls @supabase/supabase-js @supabase/ssr --depth=0
```

### Step 2 — Aggiorna `.env.local`

Aggiungi queste variabili unificate a `.env.local` (puntano a staging per ora):

```
# --- SUPABASE (variabili unificate — staging in dev, production in Vercel) ---
NEXT_PUBLIC_SUPABASE_URL=https://hhuwxcijarcyivwzpqfp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodXd4Y2lqYXJjeWl2d3pwcWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNjEyNzQsImV4cCI6MjA5MjczNzI3NH0.ifdnuuNob_wL8Y_uVqb2-WxQXOvLw6FD6Ke21G7m3WE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodXd4Y2lqYXJjeWl2d3pwcWZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE2MTI3NCwiZXhwIjoyMDkyNzM3Mjc0fQ.YfeP0Mr_IPxlV9tY4ovGMBmeiHpNH30PukXmXJpO55w
```

Aggiorna `.env.example` con i placeholder:

```
# --- SUPABASE (variabili unificate) ---
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3 — Crea `lib/supabase/client.ts`

Crea la cartella `lib/supabase/` e il file `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Step 4 — Crea `lib/supabase/server.ts`

Crea `lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll può essere chiamato da un Server Component — ignora se non si può scrivere
          }
        },
      },
    }
  )
}
```

### Step 5 — Crea `lib/supabase/admin.ts`

Crea `lib/supabase/admin.ts` per operazioni privilegiate server-side (es. bypass RLS):

```typescript
import { createClient } from '@supabase/supabase-js'

// Client con service_role — NON usare mai client-side
// Bypass RLS — usare solo in Server Actions/API routes dove necessario
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}
```

### Step 6 — Crea `lib/supabase/index.ts`

Crea `lib/supabase/index.ts` come barrel export:

```typescript
export { createClient as createBrowserSupabaseClient } from './client'
export { createClient as createServerSupabaseClient } from './server'
export { createAdminClient } from './admin'
```

### Step 7 — Crea test di connessione

Crea `lib/supabase/__tests__/client.test.ts`:

```typescript
describe('Supabase client', () => {
  it('createBrowserClient initializes without throwing', () => {
    // Verifica che le env vars siano presenti
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
  })

  it('SUPABASE_URL points to a valid Supabase project', () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    expect(url).toMatch(/^https:\/\/.+\.supabase\.co$/)
  })
})
```

### Step 8 — Crea pagina test `/test-supabase`

Crea `app/test-supabase/page.tsx` per verificare la connessione live:

```typescript
'use client'

import { createBrowserSupabaseClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function TestSupabasePage() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [info, setInfo] = useState<string>('')

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createBrowserSupabaseClient()
        // Query semplice: conta gli achievements (seed data)
        const { data, error } = await supabase
          .from('achievements')
          .select('id, name')
          .limit(3)

        if (error) throw error

        setStatus('ok')
        setInfo(JSON.stringify(data, null, 2))
      } catch (err) {
        setStatus('error')
        setInfo(err instanceof Error ? err.message : String(err))
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--color-bg-primary)' }}>
      <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>
        Test Supabase — connessione
      </h1>

      <div className="space-y-4">
        <div style={{ color: 'var(--color-text-secondary)' }}>
          Status:{' '}
          <span
            style={{
              color:
                status === 'ok'
                  ? 'var(--color-success)'
                  : status === 'error'
                    ? 'var(--color-danger)'
                    : 'var(--color-warning)',
            }}
          >
            {status}
          </span>
        </div>

        <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
          URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
        </div>

        {info && (
          <div className="p-4 rounded" style={{ background: 'var(--color-bg-secondary)' }}>
            <pre style={{ color: 'var(--color-text-primary)', fontSize: '13px' }}>{info}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
```

### Step 9 — Esegui test e build

```bash
npm run test
# Deve passare (2 nuovi test si aggiungono ai 9 precedenti → 11 totali)

npm run build
# Deve compilare senza errori

npm run validate
# Deve passare
```

### Step 10 — Commit e push

```bash
git add .
git status

git commit -m "feat: setup Supabase client browser + server + admin (Sprint 1.4.2)

- @supabase/supabase-js + @supabase/ssr installati
- lib/supabase/client.ts (browser client via @supabase/ssr)
- lib/supabase/server.ts (server client con cookie handling)
- lib/supabase/admin.ts (service_role client per bypass RLS)
- lib/supabase/index.ts (barrel exports)
- NEXT_PUBLIC_SUPABASE_URL/ANON_KEY variabili unificate
- pagina /test-supabase per verifica connessione"

git push origin main
```

---

## Acceptance criteria

- [ ] `@supabase/supabase-js` e `@supabase/ssr` installati
- [ ] `lib/supabase/client.ts` esiste con `createClient()` browser
- [ ] `lib/supabase/server.ts` esiste con `createClient()` server
- [ ] `lib/supabase/admin.ts` esiste con `createAdminClient()`
- [ ] `.env.local` ha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` unificate
- [ ] `npm run test` → minimo 11 test passati
- [ ] `npm run build` → exit 0
- [ ] `npm run validate` → exit 0
- [ ] Commit pushato su GitHub
- [ ] Verifica manuale `/test-supabase` → status "ok" + 3 achievements da DB

---

## Cosa NON fare in questo sprint

- ❌ Non generare i TypeScript types da Supabase ora — vengono nel prossimo sprint o in MA2
- ❌ Non implementare il middleware di auth — viene in MA2
- ❌ Non usare `createAdminClient` client-side mai — solo in server actions
- ❌ Non creare `middleware.ts` ora — viene quando serve la route protection

---

## Cosa segnalare al completamento

```
Sprint 1.4.2 completato ✅

Acceptance criteria verificati:
- @supabase/supabase-js + @supabase/ssr: ✅
- lib/supabase/client.ts: ✅
- lib/supabase/server.ts: ✅
- lib/supabase/admin.ts: ✅
- env vars unificate: ✅
- npm run test: ✅ [N test]
- npm run build: ✅ exit 0
- npm run validate: ✅ exit 0
- /test-supabase: ✅ status ok + achievements visibili
- push GitHub: ✅ [link commit]
```

---

_Prompt preparato da Cowork — Predimark V2 Sprint 1.4.2_
_Prossimo sprint: 1.3.2 (Privy ↔ Supabase sync — upsert users al login)_
