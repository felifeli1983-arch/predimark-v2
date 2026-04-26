# Predimark V2

Prediction markets platform — powered by Polymarket.

## Stack

- **Framework**: Next.js 16 + React 19 + TypeScript (strict)
- **Styling**: Tailwind 4 (`@theme` in `globals.css`)
- **State**: Zustand + TanStack Query v5
- **Auth**: Privy (setup pendente)
- **Database**: Supabase (staging + production — gestito da Cowork)
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint 9 flat config + Prettier + Husky pre-commit

## Dev

```bash
npm run dev          # avvia su localhost:3001
npm run typecheck    # type check
npm run lint         # eslint
npm run test         # vitest run
npm run validate     # typecheck + lint + test
```

## Testing

```bash
npm run test          # run once
npm run test:watch    # watch mode
npm run test:coverage # with coverage
```

## Struttura

```
app/                  # Next.js App Router
components/           # componenti React riutilizzabili
  __tests__/          # test componenti
lib/                  # utility e helpers
  __tests__/          # test utility
docs/                 # documentazione interna e prompt sprint
public/               # asset statici
supabase/migrations/  # migration DB (gestite da Cowork via MCP)
```

## Variabili d'ambiente

Copia `.env.example` in `.env.local` e compila con i valori reali:

```bash
cp .env.example .env.local
```

## Note

- Porta default: 3001 (3000 potrebbe essere occupata)
- Supabase DB gestito interamente da Cowork via MCP — non usare Supabase CLI
- Documenti di design e sprint prompt in `docs/`
