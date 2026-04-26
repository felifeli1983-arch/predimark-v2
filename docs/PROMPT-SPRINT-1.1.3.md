# PROMPT OPERATIVO — SPRINT 1.1.3
## Setup design tokens globals.css completi

> Preparato da: Cowork (Claude Desktop)
> Data: 26 aprile 2026
> Destinatario: Claude in VS Code (incolla questo prompt nella chat VS Code)
> Sprint: MA1 / Step 1.1 / Sprint 1.1.3
> Stima: 2 ore
> Dipendenze: 1.1.2 ✅ completato

---

## Contesto

Stai implementando lo **Sprint 1.1.3** di Predimark V2. Il progetto Next.js 16 è operativo con Tailwind 4 base. Questo sprint sostituisce il `globals.css` placeholder con il **Design System completo** di Predimark V2 (Doc 8).

**Obiettivo**: scrivere `app/globals.css` con tutti i design tokens ufficiali, configurare il font Inter Variable, aggiungere le animazioni base, e creare una test page che mostri visivamente il design system.

> **Leggi questo prompt fino in fondo prima di iniziare.**

---

## Task

1. Sostituire `app/globals.css` con il Design System completo (tokens + animazioni + base styles)
2. Configurare Inter Variable via `next/font/google` in `app/layout.tsx`
3. Creare la test page `/test-design-system`
4. Verificare dark mode (default) e light mode (`prefers-color-scheme`)
5. Commit e push su GitHub

---

## Step operativi

### Step 1 — Configura Inter Variable in `app/layout.tsx`

Sostituisci il contenuto di `app/layout.tsx` con:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Predimark V2',
  description: 'Prediction markets, simplified.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

### Step 2 — Sostituisci `app/globals.css` con il Design System completo

Sostituisci TUTTO il contenuto di `app/globals.css` con questo file:

```css
@import 'tailwindcss';

/* ============================================================
   PREDIMARK V2 — DESIGN SYSTEM
   Source of truth: docs/08-DESIGN-SYSTEM.md
   ============================================================ */

@theme {

  /* ----------------------------------------------------------
     COLORS — Dark mode (default)
  ---------------------------------------------------------- */

  /* Backgrounds */
  --color-bg-primary: #0a0e1a;
  --color-bg-secondary: #141a2a;
  --color-bg-tertiary: #1c2333;
  --color-bg-elevated: #232b3d;

  /* Text */
  --color-text-primary: #ffffff;
  --color-text-secondary: #b8c2d4;
  --color-text-tertiary: #7a849a;
  --color-text-muted: #4a5169;

  /* Borders */
  --color-border-default: #2a3142;
  --color-border-strong: #3a4258;
  --color-border-subtle: #1f2535;

  /* Semantic */
  --color-success: #10b981;
  --color-success-bg: #10b98115;
  --color-success-border: #10b981;

  --color-danger: #ef4444;
  --color-danger-bg: #ef444415;
  --color-danger-border: #ef4444;

  --color-cta: #3b82f6;
  --color-cta-hover: #2563eb;
  --color-cta-bg: #3b82f615;

  --color-live: #dc2626;
  --color-hot: #f97316;
  --color-info: #06b6d4;
  --color-warning: #fbbf24;
  --color-warning-bg: #fbbf2415;

  /* Category colors */
  --color-cat-sport: #3b82f6;
  --color-cat-politics: #ef4444;
  --color-cat-crypto: #f97316;
  --color-cat-culture: #a855f7;
  --color-cat-news: #06b6d4;
  --color-cat-geopolitics: #1e40af;
  --color-cat-economy: #047857;
  --color-cat-tech: #6d28d9;

  /* ----------------------------------------------------------
     TYPOGRAPHY
  ---------------------------------------------------------- */

  --font-sans: 'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Monaco, monospace;

  --text-xs: 11px;
  --text-sm: 13px;
  --text-base: 15px;
  --text-lg: 17px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 30px;
  --text-4xl: 36px;
  --text-5xl: 48px;
  --text-6xl: 60px;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.7;

  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.05em;

  /* ----------------------------------------------------------
     SPACING
  ---------------------------------------------------------- */

  --spacing-0: 0;
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-20: 80px;
  --spacing-24: 96px;

  /* ----------------------------------------------------------
     BORDER RADIUS
  ---------------------------------------------------------- */

  --radius-none: 0;
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* ----------------------------------------------------------
     SHADOWS
  ---------------------------------------------------------- */

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.6);
  --shadow-xl: 0 12px 32px rgba(0, 0, 0, 0.7);

  --glow-cta: 0 0 0 3px rgba(59, 130, 246, 0.4);
  --glow-success: 0 0 0 3px rgba(16, 185, 129, 0.4);
  --glow-danger: 0 0 0 3px rgba(239, 68, 68, 0.4);

  /* ----------------------------------------------------------
     Z-INDEX
  ---------------------------------------------------------- */

  --z-base: 1;
  --z-sticky: 10;
  --z-dropdown: 20;
  --z-tooltip: 30;
  --z-modal-backdrop: 40;
  --z-modal: 50;
  --z-toast: 60;
  --z-skip-link: 100;

  /* ----------------------------------------------------------
     TRANSITIONS
  ---------------------------------------------------------- */

  --transition-fast: 100ms;
  --transition-base: 200ms;
  --transition-slow: 300ms;
  --transition-slower: 500ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.27, 1.55);

  /* ----------------------------------------------------------
     BREAKPOINTS
  ---------------------------------------------------------- */

  --breakpoint-xs: 480px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* ----------------------------------------------------------
   LIGHT MODE OVERRIDES
---------------------------------------------------------- */

@media (prefers-color-scheme: light) {
  @theme {
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

    --color-cat-sport: #2563eb;
    --color-cat-politics: #dc2626;
    --color-cat-crypto: #ea580c;
    --color-cat-culture: #9333ea;
    --color-cat-news: #0891b2;
    --color-cat-geopolitics: #1e3a8a;
    --color-cat-economy: #065f46;
    --color-cat-tech: #5b21b6;

    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
    --shadow-xl: 0 12px 32px rgba(0, 0, 0, 0.15);
  }
}

/* ----------------------------------------------------------
   BASE STYLES
---------------------------------------------------------- */

@layer base {
  :root {
    color-scheme: dark light;
  }

  body {
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    line-height: var(--leading-normal);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *:focus-visible {
    outline: none;
    box-shadow: var(--glow-cta);
    border-radius: var(--radius);
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

/* ----------------------------------------------------------
   ANIMATIONS
---------------------------------------------------------- */

@keyframes pulse-live {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.3); }
}

@keyframes shimmer {
  from { background-position: -200% 0; }
  to { background-position: 200% 0; }
}

@keyframes flash-up {
  0% { background-color: var(--color-success); color: white; }
  100% { background-color: transparent; }
}

@keyframes flash-down {
  0% { background-color: var(--color-danger); color: white; }
  100% { background-color: transparent; }
}

/* ----------------------------------------------------------
   UTILITY CLASSES
---------------------------------------------------------- */

.live-dot {
  animation: pulse-live 1.5s ease-in-out infinite;
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 0%,
    var(--color-bg-tertiary) 50%,
    var(--color-bg-secondary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.font-mono {
  font-family: var(--font-mono);
}

/* Touch hover — solo su device con hover capability */
@media (hover: hover) {
  .hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.hover-lift:active {
  transform: scale(0.98);
}
```

### Step 3 — Crea la test page `/test-design-system`

Crea il file `app/test-design-system/page.tsx`:

```tsx
export default function TestDesignSystem() {
  return (
    <main className="min-h-screen p-8" style={{ background: 'var(--color-bg-primary)' }}>
      <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-4xl)' }}>
        Design System
      </h1>
      <p className="mb-12" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
        Predimark V2 — Sprint 1.1.3
      </p>

      {/* PALETTE */}
      <section className="mb-12">
        <h2 className="mb-4 font-semibold" style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-2xl)' }}>
          Colors
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'bg-primary', bg: 'var(--color-bg-primary)', border: true },
            { label: 'bg-secondary', bg: 'var(--color-bg-secondary)' },
            { label: 'bg-tertiary', bg: 'var(--color-bg-tertiary)' },
            { label: 'bg-elevated', bg: 'var(--color-bg-elevated)' },
            { label: 'success', bg: 'var(--color-success)' },
            { label: 'danger', bg: 'var(--color-danger)' },
            { label: 'cta', bg: 'var(--color-cta)' },
            { label: 'live', bg: 'var(--color-live)' },
            { label: 'hot', bg: 'var(--color-hot)' },
            { label: 'info', bg: 'var(--color-info)' },
            { label: 'warning', bg: 'var(--color-warning)' },
          ].map(({ label, bg, border }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className="w-14 h-14 rounded-lg"
                style={{
                  background: bg,
                  border: border ? '1px solid var(--color-border-strong)' : undefined,
                }}
              />
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY COLORS */}
      <section className="mb-12">
        <h2 className="mb-4 font-semibold" style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-xl)' }}>
          Category Colors
        </h2>
        <div className="flex flex-wrap gap-2">
          {['sport', 'politics', 'crypto', 'culture', 'news', 'geopolitics', 'economy', 'tech'].map((cat) => (
            <span
              key={cat}
              className="px-3 py-1 rounded-full text-white font-medium"
              style={{
                background: `var(--color-cat-${cat})`,
                fontSize: 'var(--text-sm)',
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* TYPOGRAPHY */}
      <section className="mb-12">
        <h2 className="mb-4 font-semibold" style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-2xl)' }}>
          Typography
        </h2>
        <div className="space-y-2">
          {[
            { label: 'text-6xl / 60px', size: 'var(--text-6xl)', weight: 700 },
            { label: 'text-5xl / 48px', size: 'var(--text-5xl)', weight: 700 },
            { label: 'text-4xl / 36px', size: 'var(--text-4xl)', weight: 700 },
            { label: 'text-3xl / 30px', size: 'var(--text-3xl)', weight: 700 },
            { label: 'text-2xl / 24px', size: 'var(--text-2xl)', weight: 600 },
            { label: 'text-xl / 20px', size: 'var(--text-xl)', weight: 600 },
            { label: 'text-lg / 17px', size: 'var(--text-lg)', weight: 400 },
            { label: 'text-base / 15px (default)', size: 'var(--text-base)', weight: 400 },
            { label: 'text-sm / 13px', size: 'var(--text-sm)', weight: 400 },
            { label: 'text-xs / 11px', size: 'var(--text-xs)', weight: 400 },
          ].map(({ label, size, weight }) => (
            <div key={label} style={{ fontSize: size, fontWeight: weight, color: 'var(--color-text-primary)' }}>
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* BORDER RADIUS */}
      <section className="mb-12">
        <h2 className="mb-4 font-semibold" style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-xl)' }}>
          Border Radius
        </h2>
        <div className="flex flex-wrap gap-4 items-end">
          {[
            { label: 'xs / 2px', r: 'var(--radius-xs)' },
            { label: 'sm / 4px', r: 'var(--radius-sm)' },
            { label: 'default / 8px', r: 'var(--radius)' },
            { label: 'md / 12px', r: 'var(--radius-md)' },
            { label: 'lg / 16px', r: 'var(--radius-lg)' },
            { label: 'xl / 24px', r: 'var(--radius-xl)' },
            { label: 'full', r: 'var(--radius-full)' },
          ].map(({ label, r }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div
                className="w-14 h-14"
                style={{
                  borderRadius: r,
                  background: 'var(--color-cta)',
                }}
              />
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ANIMATIONS */}
      <section className="mb-12">
        <h2 className="mb-4 font-semibold" style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-xl)' }}>
          Animations
        </h2>
        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-center gap-2">
            <div
              className="live-dot w-3 h-3 rounded-full"
              style={{ background: 'var(--color-live)' }}
            />
            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>live-dot</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div
              className="skeleton w-32 h-4 rounded"
            />
            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>skeleton</span>
          </div>
        </div>
      </section>

      {/* SEMANTIC BADGES */}
      <section className="mb-12">
        <h2 className="mb-4 font-semibold" style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-xl)' }}>
          Semantic Badges
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Success', bg: 'var(--color-success-bg)', color: 'var(--color-success)', border: 'var(--color-success)' },
            { label: 'Danger', bg: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: 'var(--color-danger)' },
            { label: 'CTA', bg: 'var(--color-cta-bg)', color: 'var(--color-cta)', border: 'var(--color-cta)' },
            { label: 'Warning', bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', border: 'var(--color-warning)' },
          ].map(({ label, bg, color, border }) => (
            <span
              key={label}
              className="px-3 py-1 font-medium"
              style={{
                background: bg,
                color,
                border: `1px solid ${border}`,
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
        Nota: per verificare light mode, usa DevTools → Rendering → Emulate CSS media → prefers-color-scheme: light
      </p>
    </main>
  )
}
```

### Step 4 — Aggiorna la home page

Aggiorna `app/page.tsx` per usare i design token reali (non `bg-green-900` hardcoded):

```tsx
export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-8 p-8"
      style={{ background: 'var(--color-bg-primary)' }}
    >
      <div className="text-center">
        <h1
          className="font-bold mb-2"
          style={{
            color: 'var(--color-cta)',
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--font-weight-bold)',
          }}
        >
          Predimark V2
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)' }}>
          Prediction markets, simplified.
        </p>
      </div>

      <div className="flex gap-3">
        {[
          { label: 'Next.js ✓', bg: 'var(--color-success-bg)', color: 'var(--color-success)', border: 'var(--color-success)' },
          { label: 'Tailwind 4 ✓', bg: 'var(--color-cta-bg)', color: 'var(--color-cta)', border: 'var(--color-cta)' },
          { label: 'TypeScript ✓', bg: '#a855f715', color: 'var(--color-cat-culture)', border: 'var(--color-cat-culture)' },
        ].map(({ label, bg, color, border }) => (
          <span
            key={label}
            className="px-3 py-1 font-medium"
            style={{
              background: bg,
              color,
              border: `1px solid ${border}`,
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-sm)',
            }}
          >
            {label}
          </span>
        ))}
      </div>

      <a
        href="/test-design-system"
        style={{
          color: 'var(--color-cta)',
          fontSize: 'var(--text-sm)',
        }}
      >
        → Apri test design system
      </a>
    </main>
  )
}
```

### Step 5 — Verifica TypeScript e build

```bash
cd ~/predimark-v2

# TypeScript check
npx tsc --noEmit

# Avvia dev server
npm run dev
```

Verifica:
- `http://localhost:3000` — home page con badge colorati correttamente
- `http://localhost:3000/test-design-system` — palette, tipografia, border radius, animazioni visibili
- Apri DevTools → Rendering → "Emulate CSS media feature prefers-color-scheme" → `light` → verifica che i colori cambino (sfondo diventa bianco, testo diventa scuro)

### Step 6 — Commit e push

```bash
git add .
git status   # verifica: nessun file sensibile incluso

git commit -m "feat: design system completo globals.css (Sprint 1.1.3)

- Tutti i design token Doc 8: colori dark/light, tipografia, spacing,
  radius, shadows, z-index, transitions, breakpoints
- Inter Variable via next/font/google
- Light mode via prefers-color-scheme
- Animazioni: pulse-live, shimmer, flash-up/down
- Test page /test-design-system
- focus-visible ring globale, reduced-motion support"

git push origin main
```

---

## Acceptance criteria

- [ ] `app/globals.css` contiene `@theme` con TUTTI i token: `--color-bg-primary`, `--color-success`, `--color-danger`, `--color-cta`, `--font-sans`, `--font-mono`, `--text-base`, `--radius`, `--shadow`, `--z-modal`, `--transition-base`
- [ ] `app/layout.tsx` importa Inter via `next/font/google` con variable `--font-sans`
- [ ] `http://localhost:3000/test-design-system` carica e mostra palette, tipografia, border radius, badge semantici
- [ ] Dark mode (default): sfondo `#0a0e1a`, testo bianco
- [ ] Light mode: cambia con `prefers-color-scheme: light` in DevTools
- [ ] `.live-dot` anima (pulse) su `/test-design-system`
- [ ] `.skeleton` shimmer visibile su `/test-design-system`
- [ ] `npx tsc --noEmit` — exit 0
- [ ] Commit pushato su GitHub

---

## Cosa NON fare in questo sprint

- ❌ Non installare shadcn/ui — viene in sprint dedicato MA3
- ❌ Non installare Framer Motion — viene quando si costruiscono modal/drawer
- ❌ Non creare componenti Button, Card, Input — questo sprint è SOLO tokens e test page
- ❌ Non hardcodare colori hex nei componenti — sempre via CSS var o Tailwind utility
- ❌ Non usare `tailwind.config.ts` — già rimosso, non ricrearlo

---

## Cosa segnalare al completamento

```
Sprint 1.1.3 completato ✅

Acceptance criteria verificati:
- globals.css token completi: ✅
- Inter Variable: ✅
- test page /test-design-system: ✅
- dark mode default: ✅
- light mode prefers-color-scheme: ✅
- live-dot pulse: ✅
- skeleton shimmer: ✅
- tsc --noEmit: ✅ (exit 0)
- push GitHub: ✅ [link commit]

Note: [eventuali considerazioni]

Pronto per Sprint 1.1.4 o 1.5.1 — ESLint/Prettier/Husky.
```

---

*Prompt preparato da Cowork — Predimark V2 Sprint 1.1.3*
*Prossimo sprint: 1.5.1 — ESLint, Prettier, Husky pre-commit*
