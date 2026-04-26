# PROMPT OPERATIVO — SPRINT 1.5.3

## Docs in cartella progetto + README

> Preparato da: Cowork (Claude Desktop)
> Data: 26 aprile 2026
> Destinatario: Claude in VS Code (incolla questo prompt nella chat VS Code)
> Sprint: MA1 / Step 1.5 / Sprint 1.5.3
> Stima: 30 minuti
> Dipendenze: 1.5.2 ✅ completato

---

## Contesto

Stai implementando lo **Sprint 1.5.3** di Predimark V2. Vitest + React Testing Library sono operativi. Questo sprint è veloce: aggiorna il `README.md` e verifica che la cartella `docs/` sia in ordine per lo sviluppo futuro.

La cartella `docs/` esiste già e contiene i prompt degli sprint. Non devi toccarla — è gestita da Cowork.

> **Leggi questo prompt fino in fondo prima di iniziare.**

---

## Task

1. Aggiornare `README.md` con le informazioni reali del progetto
2. Creare `docs/ARCHITECTURE.md` con la struttura attuale del progetto
3. Verificare che `AGENTS.md` sia aggiornato (se serve)
4. Commit e push

---

## Step operativi

### Step 1 — Aggiorna `README.md`

Sostituisci il contenuto autogenerato da `create-next-app` con questo:

````markdown
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
````

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

````

### Step 2 — Crea `docs/ARCHITECTURE.md`

Crea il file `docs/ARCHITECTURE.md`:

```markdown
# Predimark V2 — Architettura

> Documento vivo — aggiornato sprint per sprint

## Stack tecnico

| Layer      | Tecnologia                         | Note                                  |
| ---------- | ---------------------------------- | ------------------------------------- |
| Framework  | Next.js 16 (App Router)            | React 19, TypeScript strict           |
| Styling    | Tailwind 4 `@theme`                | No `tailwind.config.ts`               |
| State      | Zustand + TanStack Query v5        | Client state + server state separati  |
| Auth       | Privy                              | Setup in Sprint 1.3.x                 |
| Database   | Supabase (Postgres)                | Staging + Production, 39 tabelle, RLS |
| Testing    | Vitest + React Testing Library     | No Playwright (rinviato a MA8)        |
| Linting    | ESLint 9 flat config + Prettier    | Husky pre-commit via lint-staged      |
| Deploy     | Vercel                             | Setup in Sprint 1.4.x                 |

## Struttura cartelle

````

predimark-v2/
├── app/ # Next.js App Router
│ ├── layout.tsx # root layout (Inter font, globals.css)
│ ├── page.tsx # home page
│ └── globals.css # design tokens (@theme Tailwind 4)
├── components/ # React components riutilizzabili
│ └── **tests**/ # test componenti
├── lib/ # utility, helpers, hooks
│ └── **tests**/ # test utility
├── docs/ # documentazione interna
│ ├── HANDOFF-LOG.md # stato sprint (gestito da Cowork)
│ ├── ARCHITECTURE.md # questo file
│ └── PROMPT-SPRINT-\*.md # prompt operativi per Claude in VS Code
├── supabase/
│ └── migrations/ # SQL migrations (gestite da Cowork via MCP)
├── public/ # asset statici
├── vitest.config.ts # config Vitest
├── vitest.setup.ts # setup jest-dom
├── eslint.config.mjs # ESLint 9 flat config
└── AGENTS.md # istruzioni per agenti AI

```

## Database (Supabase)

- **Staging**: `hhuwxcijarcyivwzpqfp.supabase.co`
- **Production**: `vlrvixndaeqcxftovzmw.supabase.co`
- **Migrations**: 012 applicate su entrambi (tutte le tabelle core)
- **RLS**: abilitato su tutte le 39 tabelle
- **Gestione**: Cowork via Supabase MCP (non Supabase CLI)

## Macro Aree (roadmap)

| MA  | Nome                          | Status               |
| --- | ----------------------------- | -------------------- |
| MA1 | Foundation & Setup            | ⏳ In corso (5/12)   |
| MA2 | Database & Auth               | 🔶 DB completato     |
| MA3 | Core Pages                    | ⚪ Non iniziata       |
| MA4 | Trading Core                  | ⚪ Non iniziata       |
| MA5 | User Profile & Demo           | ⚪ Non iniziata       |
| MA6 | Creator Program & Leaderboard | ⚪ Non iniziata       |
| MA7 | Admin Panel                   | ⚪ Non iniziata       |
| MA8 | Polish, Testing, Launch       | ⚪ Non iniziata       |

Target launch: **ottobre 2026**
```

### Step 3 — Verifica `AGENTS.md`

Leggi `AGENTS.md` nella root. Se contiene le istruzioni base di Next.js generate automaticamente, è a posto — non modificare. Se è vuoto o non esiste, crealo con questo contenuto minimo:

````markdown
# Predimark V2 — Istruzioni per agenti

## Regole generali

- Non modificare `docs/HANDOFF-LOG.md` — lo gestisce Cowork
- Non eseguire migration Supabase — le gestisce Cowork via MCP
- Non installare Playwright — end-to-end rinviato a MA8
- Usare `vitest` (non Jest)
- TypeScript strict — niente `any` espliciti

## Comandi utili

```bash
npm run dev         # avvia su localhost:3001
npm run validate    # typecheck + lint + test (deve passare prima di ogni commit)
npm run test        # solo i test
```
````

## Conventions

- Tailwind 4: styling via `@theme` in `globals.css`, no `tailwind.config.ts`
- Import alias: `@/` mappa alla root del progetto
- Font: Inter via `next/font/google`, variabile CSS `--font-sans`
- ESLint: `no-explicit-any: error`, `no-unused-vars: error` (prefix `_` per ignorare)

````

Se `AGENTS.md` esiste già con contenuto simile, aggiungilo solo se manca qualcosa di importante.

### Step 4 — Commit e push

```bash
git add .
git status  # verifica: README.md, docs/ARCHITECTURE.md, AGENTS.md (se modificato)

git commit -m "docs: update README + add ARCHITECTURE.md (Sprint 1.5.3)

- README.md: stack, comandi, struttura cartelle
- docs/ARCHITECTURE.md: overview tecnica + roadmap MA
- AGENTS.md: regole per agenti AI (se aggiornato)"

git push origin main
````

---

## Acceptance criteria

- [ ] `README.md` non è più il template di create-next-app — contiene info reali del progetto
- [ ] `docs/ARCHITECTURE.md` esiste con stack table, struttura cartelle, DB info
- [ ] `AGENTS.md` esiste con regole base per agenti
- [ ] `npm run validate` passa ancora (nessuna regressione)
- [ ] Commit pushato su GitHub

---

## Cosa NON fare in questo sprint

- ❌ Non toccare `docs/HANDOFF-LOG.md` — lo gestisce Cowork
- ❌ Non modificare i `PROMPT-SPRINT-*.md` esistenti
- ❌ Non aggiungere dipendenze npm
- ❌ Non creare documentazione per ogni singolo componente — troppo presto

---

## Cosa segnalare al completamento

```
Sprint 1.5.3 completato ✅

Acceptance criteria verificati:
- README.md: ✅ aggiornato con info reali
- ARCHITECTURE.md: ✅ creato in docs/
- AGENTS.md: ✅ [aggiornato / già ok — specificare]
- npm run validate: ✅ exit 0
- push GitHub: ✅ [link commit]
```

---

_Prompt preparato da Cowork — Predimark V2 Sprint 1.5.3_
_Prossimo sprint: 1.3.1 (Privy) se account pronto, altrimenti 1.4.1 (Vercel)_
