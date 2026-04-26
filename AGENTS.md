<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

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

## Conventions

- Tailwind 4: styling via `@theme` in `globals.css`, no `tailwind.config.ts`
- Import alias: `@/` mappa alla root del progetto
- Font: Inter via `next/font/google`, variabile CSS `--font-sans`
- ESLint: `no-explicit-any: error`, `no-unused-vars: error` (prefix `_` per ignorare)
