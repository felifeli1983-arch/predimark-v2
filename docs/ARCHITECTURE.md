# Predimark V2 — Architettura

> Documento vivo — aggiornato sprint per sprint

## Stack tecnico

| Layer     | Tecnologia                      | Note                                  |
| --------- | ------------------------------- | ------------------------------------- |
| Framework | Next.js 16 (App Router)         | React 19, TypeScript strict           |
| Styling   | Tailwind 4 `@theme`             | No `tailwind.config.ts`               |
| State     | Zustand + TanStack Query v5     | Client state + server state separati  |
| Auth      | Privy                           | Setup in Sprint 1.3.x                 |
| Database  | Supabase (Postgres)             | Staging + Production, 39 tabelle, RLS |
| Testing   | Vitest + React Testing Library  | No Playwright (rinviato a MA8)        |
| Linting   | ESLint 9 flat config + Prettier | Husky pre-commit via lint-staged      |
| Deploy    | Vercel                          | Setup in Sprint 1.4.x                 |

## Struttura cartelle

```
predimark-v2/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # root layout (Inter font, globals.css)
│   ├── page.tsx            # home page
│   └── globals.css         # design tokens (@theme Tailwind 4)
├── components/             # React components riutilizzabili
│   └── __tests__/          # test componenti
├── lib/                    # utility, helpers, hooks
│   └── __tests__/          # test utility
├── docs/                   # documentazione interna
│   ├── HANDOFF-LOG.md      # stato sprint (gestito da Cowork)
│   ├── ARCHITECTURE.md     # questo file
│   └── PROMPT-SPRINT-*.md  # prompt operativi per Claude in VS Code
├── supabase/
│   └── migrations/         # SQL migrations (gestite da Cowork via MCP)
├── public/                 # asset statici
├── vitest.config.ts        # config Vitest
├── vitest.setup.ts         # setup jest-dom
├── eslint.config.mjs       # ESLint 9 flat config
└── AGENTS.md               # istruzioni per agenti AI
```

## Database (Supabase)

- **Staging**: `hhuwxcijarcyivwzpqfp.supabase.co`
- **Production**: `vlrvixndaeqcxftovzmw.supabase.co`
- **Migrations**: 012 applicate su entrambi (tutte le tabelle core)
- **RLS**: abilitato su tutte le 39 tabelle
- **Gestione**: Cowork via Supabase MCP (non Supabase CLI)

## Macro Aree (roadmap)

| MA  | Nome                          | Status             |
| --- | ----------------------------- | ------------------ |
| MA1 | Foundation & Setup            | ⏳ In corso (5/12) |
| MA2 | Database & Auth               | 🔶 DB completato   |
| MA3 | Core Pages                    | ⚪ Non iniziata    |
| MA4 | Trading Core                  | ⚪ Non iniziata    |
| MA5 | User Profile & Demo           | ⚪ Non iniziata    |
| MA6 | Creator Program & Leaderboard | ⚪ Non iniziata    |
| MA7 | Admin Panel                   | ⚪ Non iniziata    |
| MA8 | Polish, Testing, Launch       | ⚪ Non iniziata    |

Target launch: **ottobre 2026**
