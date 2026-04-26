# PROMPT OPERATIVO — SPRINT 1.1.2
## Init Next.js 16 project con stack base

> Preparato da: Cowork (Claude Desktop)
> Data: 26 aprile 2026
> Destinatario: Claude in VS Code (incolla questo prompt nella chat VS Code)
> Sprint: MA1 / Step 1.1 / Sprint 1.1.2
> Stima: 2-3 ore
> Dipendenze: 1.1.1 ✅ completato

---

## Contesto

Stai iniziando lo **Sprint 1.1.2** di Predimark V2. Il repo è già inizializzato con remote origin su GitHub (`https://github.com/felifeli1983-arch/predimark-v2.git`). La cartella `~/predimark-v2/` contiene già: `docs/`, `.env.local`, `.env.example`, `.gitignore`.

**Obiettivo**: scaffoldare il progetto Next.js 16 nella cartella esistente, configurare lo stack base (TypeScript strict, Tailwind 4, pacchetti core), e fare il primo push del codice su GitHub.

**Stack obbligatorio:**
- Next.js 16 (App Router + Turbopack)
- React 19
- TypeScript strict (no `any`)
- Tailwind 4 con `@theme` directive in `globals.css` — **niente `tailwind.config.ts`**
- `lucide-react`, `@tanstack/react-query`, `zustand`

> **Leggi questo prompt fino in fondo prima di iniziare.**

---

## Task

1. Scaffoldare Next.js 16 nella cartella esistente `~/predimark-v2/`
2. Configurare `tsconfig.json` con `strict: true`
3. Configurare Tailwind 4 con `@theme` directive (rimuovere `tailwind.config.ts` se creato)
4. Installare i pacchetti core
5. Creare una home page placeholder che verifica il funzionamento dello stack
6. Primo commit e push su GitHub
7. Verificare tutti gli acceptance criteria

---

## Step operativi

### Step 1 — Verifica versione Next.js disponibile

```bash
npm view next version
```

Usa la versione stabile più recente (deve essere 16.x o superiore). Se `npm view next version` ritorna 15.x, usa comunque quella — il progetto è documentato per 16.x ma funziona con l'ultima stabile disponibile. **Non installare versioni beta o RC.**

### Step 2 — Scaffold Next.js nella cartella esistente

La cartella `~/predimark-v2/` esiste già con alcuni file (docs, .env.local, ecc.). Scaffolda nella directory corrente:

```bash
cd ~/predimark-v2
npx create-next-app@latest . --typescript --app --tailwind --turbopack
```

Quando `create-next-app` chiede:
- **Would you like to use ESLint?** → Yes
- **Would you like to use `src/` directory?** → No (usiamo `app/` nella root)
- **Would you like to customize the import alias?** → Yes → usa `@/*`
- Se chiede di procedere su cartella non vuota → Yes, proceed

> ⚠️ `create-next-app` potrebbe creare un `tailwind.config.ts` — lo rimuoveremo nello step 4.

### Step 3 — Configura TypeScript strict

Apri `tsconfig.json` e verifica/aggiungi nella sezione `compilerOptions`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

Verifica che compili senza errori:

```bash
npx tsc --noEmit
```

### Step 4 — Configura Tailwind 4 con @theme directive

**Predimark V2 usa Tailwind 4 — la configurazione è SOLO in `globals.css` via `@theme` directive. Niente `tailwind.config.ts`.**

1. Rimuovi `tailwind.config.ts` se esiste:

```bash
rm -f tailwind.config.ts tailwind.config.js
```

2. Sostituisci il contenuto di `app/globals.css` con questo template base (i design tokens completi arriveranno in Sprint 1.1.3):

```css
@import "tailwindcss";

@theme {
  /* ============================================
     PREDIMARK V2 — Design Tokens Base
     Tokens completi in Sprint 1.1.3
     ============================================ */

  /* Colors — Brand */
  --color-brand-primary: oklch(65% 0.2 250);
  --color-brand-secondary: oklch(60% 0.18 280);

  /* Colors — Background */
  --color-bg-primary: oklch(10% 0.01 240);
  --color-bg-secondary: oklch(14% 0.01 240);
  --color-bg-tertiary: oklch(18% 0.01 240);

  /* Colors — Text */
  --color-text-primary: oklch(95% 0 0);
  --color-text-secondary: oklch(70% 0.01 240);
  --color-text-muted: oklch(50% 0.01 240);

  /* Colors — Status */
  --color-success: oklch(65% 0.2 145);
  --color-danger: oklch(60% 0.22 25);
  --color-warning: oklch(75% 0.18 85);

  /* Font */
  --font-sans: 'Inter Variable', ui-sans-serif, system-ui, sans-serif;

  /* Border radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}

/* Dark mode default */
:root {
  color-scheme: dark;
}

body {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}
```

3. Verifica che `app/layout.tsx` importi `globals.css` (create-next-app lo fa automaticamente, ma controlla).

### Step 5 — Installa pacchetti core

```bash
npm install lucide-react @tanstack/react-query zustand
```

Verifica che non ci siano peer dependency warnings critici:

```bash
npm ls --depth=0
```

### Step 6 — Crea home page placeholder

Sostituisci il contenuto di `app/page.tsx` con un placeholder funzionale che verifica stack + styling:

```tsx
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-brand-primary)' }}>
          Predimark V2
        </h1>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Prediction markets, simplified.
        </p>
      </div>

      <div className="flex gap-3">
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-900 text-green-300">
          Next.js ✓
        </span>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-900 text-blue-300">
          Tailwind 4 ✓
        </span>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-900 text-purple-300">
          TypeScript ✓
        </span>
      </div>

      <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
        Sprint 1.1.2 completato — stack base operativo
      </p>
    </main>
  )
}
```

### Step 7 — Avvia in locale e verifica

```bash
npm run dev
```

Apri `http://localhost:3000` e verifica che:
- La pagina si carica senza errori
- I badge colorati sono visibili
- Nessun errore nella console del browser

### Step 8 — Commit e push su GitHub

```bash
cd ~/predimark-v2

# Verifica stato
git status

# Stage tutto (il .gitignore protegge .env.local e node_modules)
git add .

# Verifica cosa stai committando (deve NON includere .env.local e node_modules)
git status

# Commit
git commit -m "feat: init Next.js 16 stack base (Sprint 1.1.2)

- Next.js + React 19 + TypeScript strict
- Tailwind 4 con @theme directive in globals.css
- Pacchetti core: lucide-react, react-query, zustand
- Home page placeholder
- Design tokens base (completi in Sprint 1.1.3)"

# Push
git push origin main
```

> ⚠️ Se `git push` chiede credenziali, usa il PAT che hai configurato in Sprint 1.1.1 — dovrebbe andare automaticamente via keychain.

---

## Acceptance criteria

- [ ] `npm run dev` avvia su `localhost:3000` senza errori
- [ ] Pagina `/` mostra il placeholder con i 3 badge colorati
- [ ] `npx tsc --noEmit` passa senza errori
- [ ] `tailwind.config.ts` NON esiste nella root
- [ ] `app/globals.css` usa `@theme` directive
- [ ] `lucide-react`, `@tanstack/react-query`, `zustand` presenti in `package.json`
- [ ] `package.json` ha `"strict": true` in `tsconfig.json`
- [ ] Commit pushato su `https://github.com/felifeli1983-arch/predimark-v2`

---

## Cosa NON fare in questo sprint

- ❌ Non creare `tailwind.config.ts` — Tailwind 4 si configura solo in globals.css
- ❌ Non usare `any` in TypeScript — strict mode è obbligatorio
- ❌ Non installare Supabase client (`@supabase/supabase-js`) — lo fa Cowork in un sprint dedicato
- ❌ Non configurare Privy — Sprint 1.3.x
- ❌ Non creare componenti veri — questo sprint è solo bootstrap dello stack
- ❌ Non committare `.env.local` — verificare sempre con `git status` prima del push

---

## Cosa segnalare al completamento

```
Sprint 1.1.2 completato ✅

Acceptance criteria verificati:
- npm run dev: ✅ localhost:3000 funzionante
- tsc --noEmit: ✅ nessun errore
- tailwind.config.ts: ✅ non esiste
- globals.css @theme: ✅ configurato
- pacchetti core: ✅ installati
- push GitHub: ✅ [link commit]

Next.js version installata: [X.X.X]
Note: [eventuali considerazioni]

Pronto per Sprint 1.1.3 — Setup design tokens globals.css.
```

---

*Prompt preparato da Cowork — Predimark V2 Sprint 1.1.2*
*Prossimo sprint: 1.1.3 — Setup design tokens globals.css completi*
