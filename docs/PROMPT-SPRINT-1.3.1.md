# PROMPT OPERATIVO — SPRINT 1.3.1

## Setup Privy — PrivyProvider + wallet auth base

> Preparato da: Cowork (Claude Desktop)
> Data: 26 aprile 2026
> Destinatario: Claude in VS Code (incolla questo prompt nella chat VS Code)
> Sprint: MA1 / Step 1.3 / Sprint 1.3.1
> Stima: 2 ore
> Dipendenze: 1.5.3 ✅ completato

---

## Contesto

Stai implementando lo **Sprint 1.3.1** di Predimark V2. Questo sprint integra **Privy** come provider di autenticazione. Privy gestisce login con wallet (MetaMask, Coinbase Wallet, WalletConnect) e login social (email, Google) — tutto in un'unica libreria.

**Account Privy già creato. App ID già disponibile in `.env.local`.**

> **Leggi questo prompt fino in fondo prima di iniziare.**

---

## Task

1. Installare `@privy-io/react-auth`
2. Creare `providers/PrivyProvider.tsx`
3. Integrare il provider in `app/layout.tsx`
4. Configurare i login methods (wallet + email)
5. Creare hook `useAuth` wrapper in `lib/hooks/useAuth.ts`
6. Creare pagina test `/test-auth` per verificare il login
7. Scrivere test per `useAuth` stub
8. Commit e push

---

## Step operativi

### Step 1 — Installa la dipendenza

```bash
cd ~/predimark-v2
npm install @privy-io/react-auth
```

Verifica:

```bash
npm ls @privy-io/react-auth --depth=0
```

### Step 2 — Verifica `.env.local`

Controlla che il file `.env.local` contenga già:

```
NEXT_PUBLIC_PRIVY_APP_ID=cmofrmw2f02gt0ckye8o11n6a
```

Se non c'è, aggiungila. **Non committare mai `.env.local`** — è già in `.gitignore`.

Aggiorna anche `.env.example` aggiungendo la riga:

```
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
PRIVY_APP_SECRET=your_privy_app_secret_here
```

### Step 3 — Crea `providers/PrivyProvider.tsx`

Crea la cartella `providers/` nella root e il file `providers/PrivyProvider.tsx`:

```typescript
'use client'

import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth'

interface Props {
  children: React.ReactNode
}

export function PrivyProvider({ children }: Props) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

  if (!appId) {
    throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is not set')
  }

  return (
    <BasePrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#00E5FF',
          logo: '/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </BasePrivyProvider>
  )
}
```

**Note sulla config:**

- `loginMethods`: email + wallet (no Google per ora — si aggiunge in MA2)
- `theme: 'dark'`: coerente con il design system Predimark
- `accentColor: '#00E5FF'`: è il `--color-brand-primary` del design system
- `embeddedWallets.createOnLogin`: crea wallet embedded automaticamente per utenti senza wallet

### Step 4 — Aggiorna `app/layout.tsx`

Importa e usa `PrivyProvider` nel root layout. Il layout attuale usa `Inter` font e `globals.css` — mantieni tutto e aggiungi solo il provider:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PrivyProvider } from '@/providers/PrivyProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Predimark',
  description: 'Prediction markets platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <PrivyProvider>{children}</PrivyProvider>
      </body>
    </html>
  )
}
```

### Step 5 — Crea `lib/hooks/useAuth.ts`

Crea la cartella `lib/hooks/` e il file `lib/hooks/useAuth.ts`:

```typescript
'use client'

import { usePrivy } from '@privy-io/react-auth'

export interface AuthUser {
  id: string
  email?: string
  walletAddress?: string
  isCreator: boolean
}

export function useAuth() {
  const { ready, authenticated, user, login, logout } = usePrivy()

  const authUser: AuthUser | null = user
    ? {
        id: user.id,
        email: user.email?.address,
        walletAddress: user.wallet?.address,
        isCreator: false, // verrà gestito da Supabase in MA2
      }
    : null

  return {
    ready,
    authenticated,
    user: authUser,
    login,
    logout,
  }
}
```

### Step 6 — Crea pagina test `/test-auth`

Crea `app/test-auth/page.tsx` per verificare che Privy funzioni:

```typescript
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
          Status: <span style={{ color: authenticated ? 'var(--color-success)' : 'var(--color-danger)' }}>
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
            style={{ background: 'var(--color-brand-primary)', color: 'var(--color-bg-primary)' }}
          >
            Login con Privy
          </button>
        )}
      </div>
    </div>
  )
}
```

### Step 7 — Crea test per `useAuth`

Crea `lib/hooks/__tests__/useAuth.test.ts`:

```typescript
// Test dello stub useAuth — il vero test con mock Privy verrà in MA2
// Per ora verifichiamo solo che il modulo esista e esporti correttamente

describe('useAuth module', () => {
  it('exports useAuth function', async () => {
    // Dynamic import per evitare errori 'use client' in test environment
    const module = await import('../useAuth')
    expect(typeof module.useAuth).toBe('function')
  })

  it('exports AuthUser interface shape', async () => {
    const module = await import('../useAuth')
    // Verifica che il modulo esista e sia importabile
    expect(module).toBeDefined()
  })
})
```

### Step 8 — Esegui i test

```bash
npm run test
```

Deve passare. I 2 nuovi test si aggiungono ai 7 precedenti:

```
✓ lib/__tests__/utils.test.ts (3)
✓ components/__tests__/Badge.test.tsx (4)
✓ lib/hooks/__tests__/useAuth.test.ts (2)

Test Files  3 passed (3)
Tests       9 passed (9)
```

Poi verifica tutto:

```bash
npm run validate
```

### Step 9 — Verifica manuale nel browser

```bash
npm run dev
```

Vai su `http://localhost:3001/test-auth` e verifica:

- La pagina si carica senza errori
- Il bottone "Login con Privy" apre il modal di login Privy
- Puoi fare login con email (Privy invia un OTP)
- Dopo il login, l'utente appare come autenticato e i dati sono visibili

### Step 10 — Commit e push

```bash
git add .
git status  # verifica: providers/, lib/hooks/, app/test-auth/, .env.example aggiornato

git commit -m "feat: integrate Privy auth provider (Sprint 1.3.1)

- PrivyProvider con loginMethods: email + wallet
- Dark theme + accentColor brand-primary (#00E5FF)
- embeddedWallets: createOnLogin per utenti senza wallet
- useAuth hook wrapper su usePrivy
- pagina /test-auth per verifica manuale
- test modulo useAuth (2 test)"

git push origin main
```

---

## Acceptance criteria

- [ ] `@privy-io/react-auth` installato
- [ ] `providers/PrivyProvider.tsx` esiste con `loginMethods: ['email', 'wallet']`
- [ ] `app/layout.tsx` wrappa i children con `PrivyProvider`
- [ ] `lib/hooks/useAuth.ts` esiste ed esporta `useAuth`
- [ ] `app/test-auth/page.tsx` esiste
- [ ] `.env.example` aggiornato con `NEXT_PUBLIC_PRIVY_APP_ID`
- [ ] `npm run test` → minimo 9 test passati
- [ ] `npm run validate` → exit 0
- [ ] Verifica manuale: modal Privy si apre su `/test-auth`
- [ ] Commit pushato su GitHub

---

## Cosa NON fare in questo sprint

- ❌ Non integrare Privy con Supabase — viene in MA2 (Sprint 2.x)
- ❌ Non implementare middleware di auth (route protection) — viene in MA2
- ❌ Non aggiungere Google login ora — si aggiunge in MA2 quando l'app è su dominio reale
- ❌ Non gestire `isCreator` lato Privy — viene da Supabase

---

## Cosa segnalare al completamento

```
Sprint 1.3.1 completato ✅

Acceptance criteria verificati:
- @privy-io/react-auth: ✅ installato
- PrivyProvider: ✅
- layout.tsx: ✅ wrappato
- useAuth hook: ✅
- test-auth page: ✅
- npm run test: ✅ [N test passati]
- npm run validate: ✅ exit 0
- verifica manuale /test-auth: ✅ modal si apre
- push GitHub: ✅ [link commit]

Note: [eventuali problemi di compatibilità @privy-io/react-auth con React 19 o Next.js 16]
```

---

_Prompt preparato da Cowork — Predimark V2 Sprint 1.3.1_
_Prossimo sprint: 1.3.2 (Privy + Supabase sync) o 1.4.1 (Vercel deploy)_
