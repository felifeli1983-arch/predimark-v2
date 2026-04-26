# PROMPT OPERATIVO — SPRINT 1.5.1

## Setup ESLint, Prettier, Husky pre-commit

> Preparato da: Cowork (Claude Desktop)
> Data: 26 aprile 2026
> Destinatario: Claude in VS Code (incolla questo prompt nella chat VS Code)
> Sprint: MA1 / Step 1.5 / Sprint 1.5.1
> Stima: 1-2 ore
> Dipendenze: 1.1.2 ✅ completato

---

## Contesto

Stai implementando lo **Sprint 1.5.1** di Predimark V2. Il progetto Next.js 16 è operativo con design system completo. Questo sprint configura gli strumenti di qualità del codice: ESLint, Prettier e Husky pre-commit hook.

**Filosofia**: lint rules utili ma non oppressive — evitiamo over-tooling. L'obiettivo è bloccare errori reali e garantire formattazione consistente, non fare la guerra agli sviluppatori.

> **Leggi questo prompt fino in fondo prima di iniziare.**

---

## Task

1. Configurare ESLint con `next/core-web-vitals` + regole custom Predimark
2. Configurare Prettier con le convenzioni del progetto
3. Installare e configurare Husky pre-commit (lint-staged + tsc check)
4. Aggiungere script npm utili
5. Verificare che lint e pre-commit funzionino
6. Commit e push

---

## Step operativi

### Step 1 — Verifica ESLint esistente

`create-next-app` ha già installato ESLint. Verifica:

```bash
cd ~/predimark-v2
cat eslint.config.mjs  # o eslint.config.js o .eslintrc.json — dipende dalla versione
npm run lint
```

### Step 2 — Sostituisci la config ESLint

Next.js 16 usa il nuovo flat config system di ESLint 9. Crea/sostituisci `eslint.config.mjs`:

```js
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // TypeScript — no any
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // React — non necessarie in Next.js 16
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Import — no duplicati
      'no-duplicate-imports': 'error',

      // Console — warn in dev (non error, non blocca dev)
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Predimark — no hardcoded colori nei componenti
      // (regola manuale, non automatica — Cowork la verifica in review)
    },
  },
  {
    // Ignora file generati
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      '*.config.mjs',
      '*.config.js',
      '*.config.ts',
    ],
  },
]

export default eslintConfig
```

### Step 3 — Installa e configura Prettier

```bash
npm install --save-dev prettier eslint-config-prettier
```

Crea `.prettierrc`:

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "semi": false,
  "tabWidth": 2,
  "printWidth": 100,
  "plugins": []
}
```

Crea `.prettierignore`:

```
.next/
node_modules/
out/
public/
*.lock
```

### Step 4 — Aggiungi `eslint-config-prettier` alla config ESLint

Aggiorna `eslint.config.mjs` — aggiungi `prettier` all'estensione per evitare conflitti tra ESLint e Prettier:

```js
// Cambia la riga:
...compat.extends('next/core-web-vitals', 'next/typescript'),
// In:
...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
```

### Step 5 — Installa Husky e lint-staged

```bash
npm install --save-dev husky lint-staged
npx husky init
```

Questo crea la cartella `.husky/` con un file `pre-commit` di esempio. Sostituisci il contenuto di `.husky/pre-commit`:

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### Step 6 — Configura lint-staged in `package.json`

Aggiungi questa sezione a `package.json` (dopo `"devDependencies"`):

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,css}": [
    "prettier --write"
  ]
}
```

### Step 7 — Aggiorna gli script in `package.json`

Aggiungi/aggiorna la sezione `"scripts"`:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "typecheck": "tsc --noEmit",
  "validate": "npm run typecheck && npm run lint"
}
```

### Step 8 — Verifica tutto funziona

```bash
# Lint
npm run lint

# Prettier check
npm run format:check

# Typecheck
npm run typecheck

# Validate (tutto insieme)
npm run validate
```

Tutti devono passare senza errori.

### Step 9 — Test pre-commit hook

Crea un file temporaneo con un errore TypeScript per verificare che il pre-commit lo blocchi:

```bash
# Crea file test con errore
echo "const x: any = 'test'" > /tmp/test-lint.ts

# Aggiungi un file con errore reale al progetto (poi lo rimuoviamo)
echo "export const badCode: any = 'forbidden'" > app/_test_lint.ts
git add app/_test_lint.ts
git commit -m "test: should be blocked by pre-commit"
# Deve fallire con errore ESLint su @typescript-eslint/no-explicit-any
```

Se il commit viene bloccato — Husky funziona. Rimuovi il file test:

```bash
git rm app/_test_lint.ts
```

### Step 10 — Commit finale

```bash
git add .
git status  # verifica

git commit -m "chore: setup ESLint + Prettier + Husky pre-commit (Sprint 1.5.1)

- ESLint flat config con next/core-web-vitals + typescript + prettier
- Regole custom: no-explicit-any error, no-unused-vars error
- Prettier: singleQuote, no semi, trailingComma es5, printWidth 100
- Husky pre-commit: lint-staged su ts/tsx/json/md/css
- Script npm: lint, lint:fix, format, format:check, typecheck, validate"

git push origin main
```

---

## Acceptance criteria

- [ ] `npm run lint` → exit 0 (zero errori sul codebase esistente)
- [ ] `npm run format:check` → exit 0
- [ ] `npm run typecheck` → exit 0
- [ ] `npm run validate` → exit 0
- [ ] Commit con `any` esplicito viene bloccato dal pre-commit hook
- [ ] `.prettierrc` esiste con `singleQuote: true`, `semi: false`
- [ ] `.husky/pre-commit` esiste e chiama `lint-staged`
- [ ] `package.json` ha la sezione `lint-staged`
- [ ] Commit pushato su GitHub

---

## Cosa NON fare in questo sprint

- ❌ Non aggiungere regole ESLint eccessivamente strict (niente `no-magic-numbers`, `max-lines`, ecc.)
- ❌ Non installare StyleLint — CSS è gestito via Tailwind, non serve
- ❌ Non aggiungere commit-msg hook o conventional commits ora — over-tooling per questo stage
- ❌ Non riformattare tutto il codebase esistente con Prettier se causa diff enormi — meglio farlo una volta sola in modo controllato

---

## Cosa segnalare al completamento

```
Sprint 1.5.1 completato ✅

Acceptance criteria verificati:
- npm run lint: ✅ exit 0
- npm run format:check: ✅ exit 0
- npm run typecheck: ✅ exit 0
- npm run validate: ✅ exit 0
- pre-commit blocca any: ✅ testato
- .prettierrc: ✅ creato
- .husky/pre-commit: ✅ creato
- lint-staged in package.json: ✅
- push GitHub: ✅ [link commit]

Note: [eventuali problemi con ESLint flat config o peer deps]

Pronto per Sprint 1.5.2 — Vitest + React Testing Library.
```

---

_Prompt preparato da Cowork — Predimark V2 Sprint 1.5.1_
_Prossimo sprint: 1.5.2 — Vitest + React Testing Library_
