# PROMPT OPERATIVO — SPRINT 1.4.3

## TypeScript types da Supabase + verifica Vercel production env

> Preparato da: Cowork (Claude Desktop)
> Data: 26 aprile 2026
> Destinatario: Claude in VS Code (incolla questo prompt nella chat VS Code)
> Sprint: MA1 / Step 1.4 / Sprint 1.4.3
> Stima: 45 minuti
> Dipendenze: 1.4.2 ✅, 1.3.2 ✅

---

## Contesto

Stai implementando lo **Sprint 1.4.3** di Predimark V2, l'ultimo sprint di MA1. Questo sprint ha due obiettivi:

1. **TypeScript types da Supabase**: generare i tipi TypeScript dallo schema DB e integrarli nei client Supabase. Senza questi tipi, ogni query al DB ritorna `any` — TypeScript strict è inutile.

2. **Verifica Vercel production env**: verificare che le variabili d'ambiente su Vercel puntino al DB production (non staging) e aggiornare il codice per supportare la variabile `SUPABASE_SERVICE_ROLE_KEY` server-side su Vercel.

**Progetto Supabase staging**: `hhuwxcijarcyivwzpqfp`
**Progetto Supabase production**: `vlrvixndaeqcxftovzmw`

> **Leggi questo prompt fino in fondo prima di iniziare.**

---

## Task

1. Installare Supabase CLI (o verificare che sia disponibile)
2. Generare `lib/supabase/database.types.ts` dallo schema staging
3. Aggiornare `lib/supabase/client.ts`, `server.ts`, `admin.ts` per usare i tipi generati
4. Aggiornare `lib/actions/syncUser.ts` con tipi DB corretti
5. Aggiungere script npm `types:gen` per rigenerare i tipi in futuro
6. Verificare build e test
7. Commit e push

---

## Step operativi

### Step 1 — Genera i tipi TypeScript

Prima verifica se Supabase CLI è disponibile:

```bash
npx supabase --version
```

Se disponibile, genera i tipi:

```bash
npx supabase gen types typescript \
  --project-id hhuwxcijarcyivwzpqfp \
  --schema public \
  > lib/supabase/database.types.ts
```

**Se il comando fallisce** (auth required, rate limit, ecc.), usa questo fallback — crea `lib/supabase/database.types.ts` con il seguente contenuto minimo funzionale e continua:

```typescript
// Auto-generated types placeholder — regenerate with: npm run types:gen
// Full types available after: npx supabase login && npm run types:gen

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          privy_did: string | null
          auth_id: string | null
          wallet_address: string | null
          email: string | null
          email_verified: boolean | null
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          phone: string | null
          phone_verified: boolean | null
          country_code: string | null
          geo_block_status: string | null
          language: string | null
          theme: string | null
          created_at: string | null
          updated_at: string | null
          last_login_at: string | null
          deleted_at: string | null
          is_suspended: boolean | null
          suspended_at: string | null
          suspended_reason: string | null
          onboarding_completed: boolean | null
        }
        Insert: {
          id?: string
          privy_did?: string | null
          auth_id?: string | null
          wallet_address?: string | null
          email?: string | null
          email_verified?: boolean | null
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          country_code?: string | null
          geo_block_status?: string | null
          language?: string | null
          theme?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_login_at?: string | null
          deleted_at?: string | null
          is_suspended?: boolean | null
          suspended_at?: string | null
          suspended_reason?: string | null
          onboarding_completed?: boolean | null
        }
        Update: {
          id?: string
          privy_did?: string | null
          auth_id?: string | null
          wallet_address?: string | null
          email?: string | null
          email_verified?: boolean | null
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          country_code?: string | null
          geo_block_status?: string | null
          language?: string | null
          theme?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_login_at?: string | null
          deleted_at?: string | null
          is_suspended?: boolean | null
          suspended_at?: string | null
          suspended_reason?: string | null
          onboarding_completed?: boolean | null
        }
        Relationships: []
      }
      achievements: {
        Row: {
          id: string
          key: string
          name: string
          description: string
          icon: string | null
          category: string | null
          points: number | null
          rarity: string | null
          trigger_condition: Json
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          key: string
          name: string
          description: string
          icon?: string | null
          category?: string | null
          points?: number | null
          rarity?: string | null
          trigger_condition: Json
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          key?: string
          name?: string
          description?: string
          icon?: string | null
          category?: string | null
          points?: number | null
          rarity?: string | null
          trigger_condition?: Json
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_role: {
        Args: { uid: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
```

### Step 2 — Aggiorna `lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Step 3 — Aggiorna `lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
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

### Step 4 — Aggiorna `lib/supabase/admin.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Client con service_role — NON usare mai client-side
// Bypass RLS — usare solo in Server Actions/API routes dove necessario
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

### Step 5 — Aggiorna `lib/actions/syncUser.ts`

Aggiungi il tipo `TablesInsert<'users'>` per la type-safety sull'upsert:

```typescript
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { TablesInsert } from '@/lib/supabase/database.types'

export interface SyncUserInput {
  privyDid: string
  email?: string
  emailVerified?: boolean
  walletAddress?: string
}

export async function syncUserToSupabase(data: SyncUserInput): Promise<{ error: string | null }> {
  try {
    const supabase = createAdminClient()

    const payload: TablesInsert<'users'> = {
      privy_did: data.privyDid,
      wallet_address: data.walletAddress ?? null,
      email: data.email ?? null,
      email_verified: data.emailVerified ?? false,
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('users').upsert(payload, { onConflict: 'privy_did' })

    if (error) return { error: error.message }
    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Errore sconosciuto' }
  }
}
```

### Step 6 — Aggiorna `package.json` con script types:gen

Aggiungi questo script a `package.json` nella sezione `scripts`:

```json
"types:gen": "supabase gen types typescript --project-id hhuwxcijarcyivwzpqfp --schema public > lib/supabase/database.types.ts"
```

### Step 7 — Verifica Vercel production env

Questo step richiede di verificare la dashboard Vercel. Controlla che su Vercel (https://vercel.com/funerixs-projects/predimark-v2/settings/environment-variables) esistano queste variabili per l'ambiente **Production**:

| Variabile                       | Valore atteso                              |
| ------------------------------- | ------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://vlrvixndaeqcxftovzmw.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key del progetto production           |
| `SUPABASE_SERVICE_ROLE_KEY`     | service_role key del progetto production   |
| `NEXT_PUBLIC_PRIVY_APP_ID`      | `cmofrmw2f02gt0ckye8o11n6a`                |

**Segnalami cosa trovi** — se mancano o puntano a staging, te lo dirò io come sistemare.

### Step 8 — Esegui test e build

```bash
npm run test
# Deve passare (13 test, nessuno nuovo in questo sprint)

npm run build
# Deve compilare senza errori TypeScript

npm run validate
# Deve passare
```

### Step 9 — Commit e push

```bash
git add .
git status

git commit -m "feat: Supabase TypeScript types + typed clients (Sprint 1.4.3)

- lib/supabase/database.types.ts generato da schema staging
- createClient<Database> in client.ts, server.ts, admin.ts
- syncUser.ts usa TablesInsert<'users'> per type-safety
- package.json: script types:gen per rigenerare i tipi"

git push origin main
```

---

## Acceptance criteria

- [ ] `lib/supabase/database.types.ts` esiste con tipo `Database`
- [ ] `createClient()` in client.ts, server.ts, admin.ts hanno `<Database>` generic
- [ ] `syncUserToSupabase` usa `TablesInsert<'users'>` — nessun `any` implicito
- [ ] `npm run test` → 13 test passati
- [ ] `npm run build` → exit 0, nessun TypeScript error
- [ ] `npm run validate` → exit 0
- [ ] `package.json` ha script `types:gen`
- [ ] Commit pushato su GitHub
- [ ] Segnalato stato variabili Vercel production

---

## Cosa NON fare in questo sprint

- ❌ Non aggiungere tipi per ogni tabella a mano — usare il CLI o il fallback fornito
- ❌ Non modificare le migrazioni SQL — gestite da Cowork
- ❌ Non configurare le variabili su Vercel — solo verificare e segnalare

---

## Cosa segnalare al completamento

```
Sprint 1.4.3 completato ✅

Acceptance criteria verificati:
- database.types.ts: ✅ [generato via CLI / fallback usato]
- client/server/admin typed: ✅
- syncUser TablesInsert: ✅
- npm run test: ✅ 13 test
- npm run build: ✅ exit 0
- npm run validate: ✅ exit 0
- push GitHub: ✅ [link commit]

Vercel production env vars:
- NEXT_PUBLIC_SUPABASE_URL: [staging / production / mancante]
- NEXT_PUBLIC_SUPABASE_ANON_KEY: [presente / mancante]
- SUPABASE_SERVICE_ROLE_KEY: [presente / mancante]
- NEXT_PUBLIC_PRIVY_APP_ID: [presente / mancante]
```

---

_Prompt preparato da Cowork — Predimark V2 Sprint 1.4.3_
_Questo è l'ultimo sprint MA1. Al completamento → MA2 (Core Pages + Auth flow)_
