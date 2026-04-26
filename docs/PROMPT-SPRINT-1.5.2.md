# PROMPT OPERATIVO — SPRINT 1.5.2

## Setup Vitest + React Testing Library

> Preparato da: Cowork (Claude Desktop)
> Data: 26 aprile 2026
> Destinatario: Claude in VS Code (incolla questo prompt nella chat VS Code)
> Sprint: MA1 / Step 1.5 / Sprint 1.5.2
> Stima: 2 ore
> Dipendenze: 1.5.1 ✅ completato

---

## Contesto

Stai implementando lo **Sprint 1.5.2** di Predimark V2. ESLint + Prettier + Husky sono operativi. Questo sprint aggiunge il framework di testing: **Vitest** per unit/integration tests e **React Testing Library** per test sui componenti.

**Filosofia**: niente over-testing. L'obiettivo è avere l'infrastruttura pronta e un paio di test esempio che passano. I test veri arrivano sprint per sprint man mano che si costruiscono i componenti. Niente Playwright qui — end-to-end viene in MA8.

> **Leggi questo prompt fino in fondo prima di iniziare.**

---

## Task

1. Installare Vitest + React Testing Library + dipendenze
2. Configurare `vitest.config.ts`
3. Configurare `vitest.setup.ts`
4. Aggiungere script npm `test` e `test:ui`
5. Scrivere 2 test esempio che passano
6. Verificare che `npm run test` funzioni
7. Commit e push

---

## Step operativi

### Step 1 — Installa le dipendenze

```bash
cd ~/predimark-v2
npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Verifica installazione:

```bash
npm ls vitest @testing-library/react --depth=0
```

### Step 2 — Crea `vitest.config.ts`

Crea il file `vitest.config.ts` nella root del progetto:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    css: false,
    include: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'out'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['node_modules', '.next', 'vitest.setup.ts', '*.config.*'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

### Step 3 — Crea `vitest.setup.ts`

Crea il file `vitest.setup.ts` nella root del progetto:

```typescript
import '@testing-library/jest-dom'
```

### Step 4 — Aggiorna `tsconfig.json`

Aggiungi `vitest/globals` ai types in `tsconfig.json` per avere `describe`, `it`, `expect` senza import espliciti:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

### Step 5 — Aggiorna gli script in `package.json`

Aggiungi gli script di test alla sezione `"scripts"` esistente:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest run --coverage"
```

Aggiorna anche `"validate"` per includere i test:

```json
"validate": "npm run typecheck && npm run lint && npm run test"
```

### Step 6 — Crea i test esempio

#### Test 1 — Utility function test (puro TypeScript)

Crea `lib/__tests__/utils.test.ts`:

```typescript
describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatUSDC(1234.56)).toBe('$1,234.56')
  })

  it('formats zero', () => {
    expect(formatUSDC(0)).toBe('$0.00')
  })

  it('formats negative numbers', () => {
    expect(formatUSDC(-99.5)).toBe('-$99.50')
  })
})

// Utility locale usata solo in questo test
function formatUSDC(amount: number): string {
  const abs = Math.abs(amount)
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return amount < 0 ? `-$${formatted}` : `$${formatted}`
}
```

#### Test 2 — React component test

Crea `components/__tests__/Badge.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'

// Componente inline per il test — il vero Badge arriverà in MA3
function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'danger'
}) {
  return <span data-testid="badge" data-variant={variant}>{children}</span>
}

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Test Label</Badge>)
    expect(screen.getByTestId('badge')).toHaveTextContent('Test Label')
  })

  it('applies default variant', () => {
    render(<Badge>Default</Badge>)
    expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'default')
  })

  it('applies success variant', () => {
    render(<Badge variant="success">Win</Badge>)
    expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'success')
  })

  it('applies danger variant', () => {
    render(<Badge variant="danger">Loss</Badge>)
    expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'danger')
  })
})
```

### Step 7 — Crea le cartelle necessarie

```bash
mkdir -p lib/__tests__ components/__tests__
```

### Step 8 — Esegui i test

```bash
npm run test
```

Deve mostrare qualcosa tipo:

```
✓ lib/__tests__/utils.test.ts (3 tests)
✓ components/__tests__/Badge.test.tsx (4 tests)

Test Files  2 passed (2)
Tests       7 passed (7)
```

Se tutti i test passano, verifica anche che `npm run validate` (typecheck + lint + test) passi interamente:

```bash
npm run validate
```

### Step 9 — Verifica che ESLint non blocchi i file di test

I file di test usano `describe`, `it`, `expect` senza import (globals: true in vitest config). ESLint potrebbe protestare per variabili non definite. Se succede, aggiungi questa sezione a `eslint.config.mjs`:

```js
// Aggiungere nel defineConfig:
{
  files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
  rules: {
    'no-undef': 'off', // vitest globals (describe, it, expect, ecc.)
  },
}
```

### Step 10 — Commit e push

```bash
git add .
git status  # verifica: nessun file sensibile

git commit -m "chore: setup Vitest + React Testing Library (Sprint 1.5.2)

- Vitest con jsdom environment
- React Testing Library + jest-dom matchers
- vitest.config.ts con alias @/* e coverage v8
- 2 test esempio: utils (3 test) + Badge component (4 test)
- Script npm: test, test:watch, test:coverage
- validate aggiornato: typecheck + lint + test"

git push origin main
```

---

## Acceptance criteria

- [ ] `npm run test` → tutti i test passano (minimo 7 test in 2 file)
- [ ] `npm run validate` → exit 0 (typecheck + lint + test)
- [ ] `vitest.config.ts` esiste con `environment: 'jsdom'` e alias `@/*`
- [ ] `vitest.setup.ts` esiste e importa `@testing-library/jest-dom`
- [ ] `lib/__tests__/utils.test.ts` esiste con 3 test
- [ ] `components/__tests__/Badge.test.tsx` esiste con 4 test
- [ ] `package.json` ha script `test`, `test:watch`, `test:coverage`
- [ ] Commit pushato su GitHub

---

## Cosa NON fare in questo sprint

- ❌ Non installare Playwright — end-to-end viene in MA8
- ❌ Non installare Jest — usiamo Vitest (più veloce, nativo ESM, compatibile con Vite/Next)
- ❌ Non scrivere test per tutto il codebase esistente ora — solo i 2 test esempio
- ❌ Non aggiungere coverage threshold obbligatorio in CI ora — troppo presto

---

## Cosa segnalare al completamento

```
Sprint 1.5.2 completato ✅

Acceptance criteria verificati:
- npm run test: ✅ [N test passati in M file]
- npm run validate: ✅ exit 0
- vitest.config.ts: ✅
- vitest.setup.ts: ✅
- utils.test.ts: ✅ 3 test
- Badge.test.tsx: ✅ 4 test
- script npm: ✅
- push GitHub: ✅ [link commit]

Note: [eventuali problemi di compatibilità ESM/CJS o peer deps]

Pronto per Sprint 1.5.3 — Docs in cartella progetto + README.
```

---

_Prompt preparato da Cowork — Predimark V2 Sprint 1.5.2_
_Prossimo sprint: 1.5.3 — Inserimento docs + README (sprint veloce, 30 min)_
