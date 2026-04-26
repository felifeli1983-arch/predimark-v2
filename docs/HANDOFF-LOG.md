# Predimark V2 — Handoff Log

> Aggiornato da Cowork dopo ogni sprint chiuso
> Ultimo update: 2026-04-26

---

## Stato corrente

- **Sprint corrente**: 1.1.3 (da iniziare — Design tokens globals.css completi)
- **Prossimo sprint**: 1.1.4 o 1.5.1 (ESLint/Prettier)
- **Macro Area attiva**: MA1 — Foundation & Setup
- **Blockers attivi**: nessuno
- **Note speciali**: DB setup completato da Cowork via MCP (vedi sotto) — MA2 parzialmente anticipata

---

## Sprint completati

### ✅ Sprint 1.1.2 — Init Next.js 16 project con stack base
- **Chiuso**: 2026-04-26
- **Verificato da**: Cowork (file letti direttamente)
- **Output**:
  - Next.js 16.2.4 + React 19.2.4 scaffoldato nella cartella esistente
  - TypeScript strict (`strict: true` + `noUncheckedIndexedAccess: true`)
  - Tailwind 4 via `@theme` in `globals.css` — no `tailwind.config.ts`
  - Pacchetti: `lucide-react ^1.11.0`, `@tanstack/react-query ^5.100.5`, `zustand ^5.0.12`
  - Home page placeholder funzionante su localhost:3001
  - Commit `060af81` pushato su `main`
- **Note**:
  - `.gitignore` sostituito da create-next-app con versione migliore (`.env` + `.env.*` + `!.env.example`)
  - `CLAUDE.md` → `AGENTS.md` generati automaticamente con istruzioni Next.js 16 per agenti — utili, lasciati
  - Port 3001 usato (3000 occupato) — nessun impatto funzionale
- **PR**: N/A (push diretto su main — CI non ancora configurata)

### ✅ Sprint 1.1.1 — Setup credenziali GitHub
- **Chiuso**: 2026-04-26
- **Eseguito da**: Claude in VS Code
- **Output**:
  - `git config` impostato (Feliciano Ciccarelli / felicianociccarelli1983@gmail.com)
  - PAT GitHub validato (scopes: repo, workflow, read:org) + salvato in macOS Keychain via osxkeychain
  - `.env.local` verificato con tutti i valori reali Supabase
  - `.env.example` creato con placeholder
  - `.gitignore` configurato
  - `git init` + remote `origin` collegato a `https://github.com/felifeli1983-arch/predimark-v2.git`
- **Note**: `gh` CLI non installato (Homebrew/sudo non disponibile) — deferred a quando servirà `gh pr create`. Auth funziona comunque via PAT/keychain.
- **PR**: N/A (sprint di setup locale)

### ✅ DB Setup completo — Cowork via Supabase MCP (fuori-sprint)
- **Chiuso**: 2026-04-26
- **Eseguito da**: Cowork direttamente via Supabase MCP (non Claude in VS Code)
- **Output**:
  - Progetto staging creato: `hhuwxcijarcyivwzpqfp` → https://hhuwxcijarcyivwzpqfp.supabase.co
  - Progetto production creato: `vlrvixndaeqcxftovzmw` → https://vlrvixndaeqcxftovzmw.supabase.co
  - 12 migrations applicate su entrambi (001→012)
  - 39 tabelle create con RLS abilitato su tutte
  - Seed data: 5 achievements, 5 geo_blocks, 4 feature_flags
- **Migrations applicate**:
  - `001_extensions` — pgcrypto, pg_trgm, uuid-ossp
  - `002_core_users` — users, external_traders, admin_users
  - `003_creators` — creators, creator_payouts
  - `004_markets_trading` — markets, positions, balances, trades
  - `005_social` — follows, copy_trading_sessions, notifications, watchlist
  - `006_signals_kyc` — signals, kyc_submissions, user_preferences
  - `007_gamification_admin` — geo_blocks, referrals, achievements, user_achievements, feature_flags, ab_tests, ab_test_assignments
  - `008_audit_log` — audit_log partitioned + partizioni 2026-05 → 2027-04
  - `008b_audit_log_april_partition` — partizione 2026-04 (mancante)
  - `009_timeseries` — equity_curve, price_history, market_comments_internal (regular tables, no hypertable — TimescaleDB non disponibile su free tier)
  - `010_rls_policies` — tutte le RLS policies su tutte le tabelle
  - `011_audit_triggers` — trigger `audit_critical_changes()` su tabelle sensibili
  - `011b_fix_audit_trigger` — fix: feature_flags ha `key TEXT PK` non `id UUID`
  - `011c_fix_audit_trigger_system_ops` — fix: early return se `auth.uid()` è NULL (operations di sistema/migration)
  - `012_seed_data` — dati iniziali (achievements catalog, geo_blocks, feature_flags)
- **Note**:
  - service_role keys e DB passwords non presenti qui — recuperare dalla dashboard Supabase
  - Anon keys già inserite in `docs/PROMPT-SPRINT-1.1.1.md`
  - I sprint MA2 relativi a DB setup possono essere considerati anticipati da Cowork e saltati da Claude in VS Code
- **PR**: N/A (operazione diretta Supabase MCP)

---

## Sprint in corso

(Nessuno — pronti a iniziare con Sprint 1.1.1)

---

## Blockers / questioni aperte

- [ ] Acquistare dominio `predimark.com` (o nome finale alternativo)
- [ ] Creare account Vercel (se non esistente)
- [x] ~~Creare account Supabase~~ — fatto, due progetti creati (staging + production)
- [ ] Creare account Privy
- [ ] Creare account MoonPay (KYC business in corso quando serve)
- [ ] Personal Access Token GitHub configurato per Claude in VS Code
- [ ] Feliciano deve fornire `SUPABASE_SERVICE_ROLE_KEY_STAGING` e `_PRODUCTION` per `.env.local`
- [ ] Feliciano deve fornire `SUPABASE_DB_PASSWORD_STAGING` e `_PRODUCTION` per `.env.local`

---

## Decisioni prese in corsa

(Vuoto — verrà popolato durante l'esecuzione)

---

## Riepilogo macro aree

| MA | Nome | Sprint completati | Sprint totali | Status |
|---|---|---|---|---|
| MA1 | Foundation & Setup | 2 | 12 | ⏳ In corso |
| MA2 | Database & Auth | ~10 | 11 | 🔶 DB setup anticipato da Cowork via MCP |
| MA3 | Core Pages | 0 | 14 | ⚪ Non iniziata |
| MA4 | Trading Core | 0 | 12 | ⚪ Non iniziata |
| MA5 | User Profile & Demo | 0 | 9 | ⚪ Non iniziata |
| MA6 | Creator Program & Leaderboard | 0 | 11 | ⚪ Non iniziata |
| MA7 | Admin Panel | 0 | 13 | ⚪ Non iniziata |
| MA8 | Polish, Testing, Launch | 0 | 10 | ⚪ Non iniziata |

**Totale sprint**: 2 / 92

---

## Template per nuova entry sprint completato

Quando un nuovo sprint si chiude, aggiungere all'inizio della sezione "Sprint completati":

```markdown
### ✅ Sprint X.Y.Z — [Titolo]
- **Chiuso**: YYYY-MM-DD HH:MM
- **Output**: [breve descrizione di cosa è stato prodotto]
- **Test**: [come è stato verificato]
- **Note**: [eventuali considerazioni]
- **Files modificati**: [lista file principali]
- **PR**: #N (mergiata)
```

---

*File mantenuto da Cowork. Feliciano e Claude in VS Code possono leggerlo ma di norma solo Cowork lo scrive.*
