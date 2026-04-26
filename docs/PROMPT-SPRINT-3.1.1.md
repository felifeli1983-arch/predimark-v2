# PROMPT OPERATIVO — SPRINT 3.1.1

## Root layout + Header globale — inizio MA3

> Preparato da: Cowork (Claude Desktop)
> Data: 26 aprile 2026
> Destinatario: Claude in VS Code (incolla questo prompt nella chat VS Code)
> Sprint: MA3 / Step 3.1 / Sprint 3.1.1
> Stima: 3 ore
> Dipendenze: 2.6.2 ✅, 1.1.3 ✅

---

## Contesto

Inizia **MA3 — Core Pages**. Questo sprint costruisce il layout globale e l'Header dell'app. È il componente più importante dell'intera UI — visibile su ogni pagina.

**Stato attuale del progetto:**

- `app/layout.tsx` esiste ma ha solo `PrivyProvider` — va ampliato
- `providers/PrivyProvider.tsx` esiste ✅
- `@tanstack/react-query` installato ✅ (da Sprint 1.1.2)
- `zustand` installato ✅
- `lucide-react` installato ✅
- Design tokens completi in `app/globals.css` ✅
- Inter font configurato con `--font-sans` ✅

**Non è richiesta** nessuna data reale da API in questo sprint. Header e layout usano dati statici/mock o stato utente da `useAuth`. I dati live (portfolio, balance) arriveranno in sprint successivi (MA4-5).

> **Leggi questo prompt fino in fondo prima di iniziare.**

---

## Task

1. Creare `providers/ReactQueryProvider.tsx`
2. Creare `providers/ThemeProvider.tsx` con Zustand store
3. Aggiornare `app/layout.tsx` con tutti i provider
4. Creare `components/layout/Header.tsx` (desktop + mobile)
5. Creare `components/layout/BottomNav.tsx` (mobile sticky — solo stub per ora)
6. Verificare build e test
7. Commit e push

---

## Step operativi

### Step 1 — Crea `providers/ReactQueryProvider.tsx`

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

### Step 2 — Crea `lib/stores/themeStore.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'
type AnimationsEnabled = boolean

interface ThemeStore {
  theme: Theme
  animationsEnabled: AnimationsEnabled
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setAnimationsEnabled: (enabled: boolean) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      animationsEnabled: true,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      setAnimationsEnabled: (enabled) => set({ animationsEnabled: enabled }),
    }),
    {
      name: 'predimark-theme',
    }
  )
)
```

### Step 3 — Crea `providers/ThemeProvider.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/lib/stores/themeStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, animationsEnabled } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    if (animationsEnabled) {
      root.classList.remove('no-animations')
    } else {
      root.classList.add('no-animations')
    }
  }, [theme, animationsEnabled])

  return <>{children}</>
}
```

Aggiungi in `app/globals.css` (dopo i token esistenti):

```css
/* Theme override — light mode via data-theme attribute */
[data-theme='light'] {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #f3f4f6;
  --color-bg-elevated: #ffffff;
  --color-text-primary: #0a0e1a;
  --color-text-secondary: #4a5169;
  --color-text-tertiary: #6b7280;
  --color-text-muted: #9ca3af;
  --color-border-default: #e5e7eb;
  --color-border-strong: #d1d5db;
  --color-border-subtle: #f3f4f6;
  --color-success: #059669;
  --color-success-bg: #05966915;
  --color-danger: #dc2626;
  --color-danger-bg: #dc262615;
  --color-cta: #3b82f6;
  --color-cta-hover: #2563eb;
  --color-cta-bg: #3b82f615;
  --color-live: #dc2626;
  --color-hot: #ea580c;
  --color-info: #0891b2;
  --color-warning: #d97706;
  --color-warning-bg: #d9770615;
}

/* Disable animations */
.no-animations *,
.no-animations *::before,
.no-animations *::after {
  animation-duration: 0ms !important;
  transition-duration: 0ms !important;
}
```

### Step 4 — Aggiorna `app/layout.tsx`

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PrivyProvider } from '@/providers/PrivyProvider'
import { ReactQueryProvider } from '@/providers/ReactQueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://auktora.com'

export const metadata: Metadata = {
  title: {
    default: 'Auktora',
    template: '%s | Auktora',
  },
  description: 'Prediction markets platform — powered by Polymarket.',
  metadataBase: new URL(appUrl),
  openGraph: {
    title: 'Auktora',
    description: 'Prediction markets platform — powered by Polymarket.',
    url: appUrl,
    siteName: 'Auktora',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Auktora',
    description: 'Prediction markets platform — powered by Polymarket.',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <ReactQueryProvider>
          <PrivyProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </PrivyProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
```

### Step 5 — Crea `components/layout/Header.tsx`

Header completo con variante desktop e mobile. Usa `useAuth` per stato login.

**Regole da rispettare (Doc 4 + Doc 8):**

- Logo cliccabile → `/`
- Nav primaria: Markets · Signals · Leaderboard · News · Creator
- Search globale centrale (solo UI, senza logica per ora — placeholder)
- Switch REAL/DEMO: visibile solo se `authenticated`
- Portfolio + Cash: visibili solo se `authenticated` (valori statici `$0.00` per ora — i dati reali arrivano in MA5)
- Bottone Deposit: visibile solo se `authenticated`
- Header sticky in alto
- Mobile: hamburger sx, logo centro, bell dx, avatar/login dx
- Icone: Lucide React (zero emoji, tranne 🔔 già esistente → usa `Bell` Lucide)
- Token CSS: **mai hardcode hex**, sempre via CSS vars

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  Search,
  Bell,
  Gift,
  ChevronDown,
  LogOut,
  User,
  Sun,
  Moon,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useThemeStore } from '@/lib/stores/themeStore'

const NAV_LINKS = [
  { href: '/markets', label: 'Markets' },
  { href: '/signals', label: 'Signals' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/news', label: 'News' },
  { href: '/creator', label: 'Creator' },
]

export function Header() {
  const { ready, authenticated, user, login, logout } = useAuth()
  const { theme, toggleTheme } = useThemeStore()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [isDemo, setIsDemo] = useState(false)

  const displayName = user?.email ?? user?.walletAddress?.slice(0, 6) + '…' ?? 'Profile'

  return (
    <>
      <header
        style={{
          background: 'var(--color-bg-primary)',
          borderBottom: '1px solid var(--color-border-default)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 24px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* === MOBILE: hamburger === */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
            style={{ color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
          >
            <Menu size={20} />
          </button>

          {/* === LOGO === */}
          <Link
            href="/"
            style={{
              fontWeight: 700,
              fontSize: '18px',
              color: 'var(--color-text-primary)',
              textDecoration: 'none',
              letterSpacing: '-0.02em',
              flexShrink: 0,
            }}
          >
            Auktora
          </Link>

          {/* === DESKTOP NAV === */}
          <nav className="hidden md:flex" style={{ gap: '4px', marginLeft: '8px' }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: pathname?.startsWith(link.href)
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-secondary)',
                  background: pathname?.startsWith(link.href)
                    ? 'var(--color-bg-tertiary)'
                    : 'transparent',
                  transition: 'color 150ms, background 150ms',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* === SEARCH (desktop, flex-grow) === */}
          <div className="hidden md:flex" style={{ flex: 1, maxWidth: '360px', margin: '0 auto' }}>
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-default)',
                borderRadius: '8px',
                padding: '7px 12px',
                cursor: 'text',
              }}
            >
              <Search size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Search markets…
              </span>
            </div>
          </div>

          {/* === SPACER mobile === */}
          <div className="flex-1 md:hidden" />

          {/* === RIGHT SIDE === */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

            {/* Portfolio + Cash (desktop, authenticated only) */}
            {authenticated && (
              <div className="hidden lg:flex" style={{ gap: '12px', marginRight: '4px' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  Portfolio{' '}
                  <strong style={{ color: 'var(--color-text-primary)' }}>$0.00</strong>
                </span>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  Cash{' '}
                  <strong style={{ color: 'var(--color-text-primary)' }}>$0.00</strong>
                </span>
              </div>
            )}

            {/* Deposit (desktop, authenticated only) */}
            {authenticated && (
              <button
                className="hidden md:block"
                style={{
                  background: 'var(--color-cta)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Deposit
              </button>
            )}

            {/* Theme toggle (desktop) */}
            <button
              className="hidden md:flex"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-tertiary)',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Gift / Referral (desktop, authenticated) */}
            {authenticated && (
              <button
                className="hidden md:flex"
                aria-label="Referral"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-tertiary)',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Gift size={16} />
              </button>
            )}

            {/* Notifications */}
            <button
              aria-label="Notifications"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-tertiary)',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <Bell size={16} />
            </button>

            {/* REAL/DEMO switch (authenticated only) */}
            {authenticated && (
              <button
                onClick={() => setIsDemo(!isDemo)}
                style={{
                  background: isDemo ? 'var(--color-warning-bg)' : 'var(--color-cta-bg)',
                  color: isDemo ? 'var(--color-warning)' : 'var(--color-cta)',
                  border: `1px solid ${isDemo ? 'var(--color-warning)' : 'var(--color-cta)'}`,
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  letterSpacing: '0.04em',
                }}
              >
                <Zap size={11} />
                {isDemo ? 'DEMO' : 'REAL'}
              </button>
            )}

            {/* Profile / Login */}
            {!ready ? (
              <div
                style={{
                  width: '80px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--color-bg-tertiary)',
                }}
              />
            ) : authenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    color: 'var(--color-text-primary)',
                    fontSize: '13px',
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: 'var(--color-cta)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    {(user?.email?.[0] ?? 'U').toUpperCase()}
                  </div>
                  <span className="hidden md:inline" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName}
                  </span>
                  <ChevronDown size={12} style={{ color: 'var(--color-text-muted)' }} />
                </button>

                {/* Profile dropdown */}
                {profileMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 6px)',
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: '10px',
                      minWidth: '180px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      zIndex: 100,
                      overflow: 'hidden',
                    }}
                  >
                    <Link
                      href="/me"
                      onClick={() => setProfileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 16px',
                        color: 'var(--color-text-secondary)',
                        textDecoration: 'none',
                        fontSize: '14px',
                      }}
                    >
                      <User size={14} />
                      My Profile
                    </Link>
                    <div style={{ height: '1px', background: 'var(--color-border-subtle)' }} />
                    <button
                      onClick={() => { logout(); setProfileMenuOpen(false) }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 16px',
                        color: 'var(--color-danger)',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={login}
                style={{
                  background: 'var(--color-cta)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* === MOBILE MENU DRAWER === */}
      {mobileMenuOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }}
          />
          {/* Drawer */}
          <nav
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '280px',
              background: 'var(--color-bg-secondary)',
              borderRight: '1px solid var(--color-border-default)',
              padding: '24px 16px',
              overflowY: 'auto',
            }}
          >
            <div style={{ marginBottom: '24px', fontWeight: 700, fontSize: '18px', color: 'var(--color-text-primary)' }}>
              Auktora
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: pathname?.startsWith(link.href)
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-secondary)',
                  background: pathname?.startsWith(link.href)
                    ? 'var(--color-bg-tertiary)'
                    : 'transparent',
                  marginBottom: '4px',
                }}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ height: '1px', background: 'var(--color-border-subtle)', margin: '16px 0' }} />
            <button
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                fontSize: '15px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
          </nav>
        </div>
      )}
    </>
  )
}
```

### Step 6 — Crea `components/layout/BottomNav.tsx`

Stub mobile per ora (le rotte non esistono ancora — collegamento completo in Sprint 3.1.2):

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Zap, ShoppingCart, MoreHorizontal } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/signals', icon: Zap, label: 'Signals' },
  { href: '/slip', icon: ShoppingCart, label: 'Slip' },
  { href: '/more', icon: MoreHorizontal, label: 'More' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--color-border-default)',
        display: 'flex',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 4px',
              gap: '4px',
              textDecoration: 'none',
              color: isActive ? 'var(--color-cta)' : 'var(--color-text-muted)',
              transition: 'color 150ms',
            }}
          >
            <Icon size={20} />
            <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 400 }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
```

### Step 7 — Integra Header + BottomNav in `app/layout.tsx`

Aggiorna `app/layout.tsx` aggiungendo Header e BottomNav dentro il body:

```typescript
// ... (imports esistenti + aggiungi:)
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

// Nel body:
<ReactQueryProvider>
  <PrivyProvider>
    <ThemeProvider>
      <Header />
      <main style={{ paddingBottom: '64px' /* spazio per BottomNav mobile */ }}>
        {children}
      </main>
      <BottomNav />
    </ThemeProvider>
  </PrivyProvider>
</ReactQueryProvider>
```

### Step 8 — Verifica build e test

```bash
npm run typecheck
# Deve passare senza errori TypeScript

npm run build
# Deve mostrare route /, /test-auth, /test-signup, /test-design-system
# Deve compilare senza errori

npm run test
# I 21 test esistenti devono continuare a passare
# (nessun nuovo test richiesto per questo sprint — i componenti UI puri si testano in sprint futuri con Playwright)

npm run validate
# Deve passare
```

### Step 9 — Test manuale nel browser

Avvia dev server (`npm run dev`) e vai su `http://localhost:3001`:

1. **Desktop** (allarga finestra > 1024px):
   - Header sticky visibile con logo "Auktora" + nav links + search + icone
   - Clic "Sign in" → apre Privy modal
   - Dopo login → header mostra nome utente, switch REAL/DEMO, Deposit
   - Toggle tema (sole/luna) → pagina cambia aspetto
   - Dropdown profilo → voce "My Profile" e "Logout"

2. **Mobile** (restringi < 768px):
   - Header compatto (hamburger + logo + bell + avatar)
   - Hamburger → apre drawer con nav links
   - Bottom nav visibile in fondo
   - REAL/DEMO badge visibile solo se loggato

3. **Controlla pagine esistenti** `/test-auth` e `/test-signup`:
   - Non devono essere rotte (solo test pages) — l'header non deve apparirci se è nelle pagine test-\* (opzionale: le pagine test non usano il layout root, sono gestite internamente, quindi va bene)

### Step 10 — Commit e push

```bash
git add .
git status

git commit -m "feat: Root layout + Header globale + BottomNav stub — Sprint 3.1.1 (MA3 start)

- providers/ReactQueryProvider.tsx: TanStack Query wrapper (staleTime 30s)
- lib/stores/themeStore.ts: Zustand store per dark/light + animations toggle
- providers/ThemeProvider.tsx: applica data-theme + no-animations class
- app/globals.css: light mode override via [data-theme='light']
- app/layout.tsx: updated con ReactQueryProvider + ThemeProvider + Header + BottomNav
- components/layout/Header.tsx: sticky header desktop+mobile (nav, search, REAL/DEMO, profile dropdown)
- components/layout/BottomNav.tsx: stub bottom nav mobile (5 voci)"

git push origin main
```

---

## Acceptance criteria

- [ ] `providers/ReactQueryProvider.tsx` esiste e wrappa correttamente TanStack Query
- [ ] `lib/stores/themeStore.ts` esiste con `theme`, `animationsEnabled`, persist in localStorage
- [ ] `providers/ThemeProvider.tsx` applica `data-theme` su `<html>`
- [ ] `app/layout.tsx` ha tutti e 3 i provider: ReactQuery → Privy → Theme
- [ ] `components/layout/Header.tsx` visibile in tutte le pagine
- [ ] Header desktop: logo, nav links, search placeholder, icone, Sign in / profilo
- [ ] Header mobile: hamburger, logo, bell, avatar — drawer con nav links funzionante
- [ ] Switch REAL/DEMO visibile SOLO se `authenticated`
- [ ] Toggle tema funziona e persiste (localStorage)
- [ ] `components/layout/BottomNav.tsx` visibile solo mobile (nascosto `md:hidden`)
- [ ] `npm run build` → exit 0
- [ ] `npm run test` → 21 test passati (nessuno rotto)
- [ ] Commit pushato su GitHub

---

## Cosa segnalare al completamento

```
Sprint 3.1.1 completato ✅

Acceptance criteria verificati:
- ReactQueryProvider: ✅
- ThemeStore + ThemeProvider: ✅
- layout.tsx aggiornato: ✅
- Header.tsx (desktop): ✅
- Header.tsx (mobile + drawer): ✅
- REAL/DEMO switch: ✅ (solo se loggato)
- Theme toggle: ✅ persiste
- BottomNav stub: ✅
- npm run build: ✅ exit 0
- npm run test: ✅ [N] test
- push GitHub: ✅ [link commit]

Deviazioni dal prompt: [eventuali]
```

---

## Note per Claude in VS Code

- **Importa da `@/lib/hooks/useAuth`** — hook già esistente (non creare un nuovo hook auth)
- **Usa CSS vars per tutti i colori** — mai hardcode `#hex` nei componenti. Es: `var(--color-cta)` non `#3b82f6`
- **`suppressHydrationWarning`** su `<html>` è necessario perché ThemeProvider modifica l'attributo `data-theme` lato client
- **Il `paddingBottom: '64px'`** su `<main>` serve per non nascondere contenuto sotto il BottomNav mobile
- **Non installare nulla di nuovo** — tutte le dipendenze sono già presenti (`zustand`, `@tanstack/react-query`, `lucide-react`, `next`)
- **Le rotte `/markets`, `/signals`, ecc. non esistono ancora** — i link nell'header sono placeholder, non genera 404 bloccante (Next.js mostra 404 soft)
- **Le pagine `/test-*` continuano a funzionare** — il layout si applica anche lì, è OK per ora

---

_Prompt preparato da Cowork — Predimark V2 Sprint 3.1.1_
_Prossimo sprint dopo questo: 3.1.2 (BottomNav completo) e 3.1.3 (Footer) — oppure saltiamo direttamente a 3.2.1 (Polymarket API) se vogliamo avanzare sui dati_
