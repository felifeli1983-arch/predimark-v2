# Predimark V2 — Roadmap & Sprint Plan (v2 completo)

> **Documento 9 di 10** — Operations Layer
> Autore: Feliciano + Claude (architetto)
> Data: 25 aprile 2026
> Status: bozza v2 — Framework + Macro aree + Step + Sprint dettagliati
> Predecessori: Doc 1-8
> Audience: Cowork (per preparare prompt operativi) + Feliciano (per orientarsi)
>
> **Note v2 rispetto a v1.1**: aggiunto dettaglio degli sprint (Parte 8). Le parti 1-7 rimangono identiche a v1.1.
>
> **Update v2.1 (2026-04-29)**: roadmap MA4 e MA6 ridefinita post-pivot CLOB V2:
>
> - **MA4.4** ✅ chiuso — CLOB V2 SDK + onboard L2 + sell REAL + wrap USDC.e→pUSD + geo-block 33 paesi (vedi HANDOFF-LOG)
> - **MA4.5** ✅ chiuso — Positions + History + Sell flow DEMO end-to-end
> - **MA4.6** ✅ chiuso — Funding flow (Deposit Privy useFundWallet + Withdraw 2-step pUSD→USDC.e + MoonPay)
> - **MA4.7** 📋 NEW (inserito 2026-04-29) — Polymarket Account Import via Privy external wallet + `clobClient.deriveApiKey()`. Effort 2-3h. UX wording obbligatorio "Collega il tuo account Polymarket". Acquisition multiplier per utenti Polymarket esistenti, prerequisito Creator program MA6. Vedi `PROMPT-SPRINT-MA4.7.md`
> - **MA5** — Signal AI (gratis fino a track record validato >55% win rate, 6+ mesi). NO sub iniziale
> - **MA6** — Copy trading: Creator opt-in 30/70 split + External Traders no-opt-in 100% Auktora (vedi `PROMPT-SPRINT-MA6.md` + Doc 14 Monetization). Schema DB già pronto al 80% (creators/follows/copy_trading_sessions/external_traders esistenti)
> - **MA6.1** — Auto-copy con session keys (schema `copy_trading_sessions` già esistente)
> - **MA7** — Telegram bot @AuktoraBot (vedi Doc 11)
> - **MA8** — Discord bot + design polish + Auktora Pro €9.99 SE Signal AI valida

---

# PARTE 8 — SPRINT LIBRARY (~80 sprint operativi)

Questa è la **libreria operativa** degli sprint che Cowork userà per preparare i prompt da incollare in VS Code.

## Convenzioni format sprint

Ogni sprint segue questo schema:

```
SPRINT X.Y.Z — [Titolo breve]
───────────────────────────────
Macro Area: [numero + nome]
Step: [numero + nome]
Stima Claude in VS Code: [ore]
Dipendenze: [sprint da completare prima]

COSA PRODUCE:
[output concreto e verificabile]

ACCEPTANCE CRITERIA:
[checklist verificabile da Cowork]

RIFERIMENTI DOC:
[quali sezioni dei Doc 1-8 servono]

NOTE PER COWORK (preparazione prompt):
[cosa enfatizzare, cosa evitare, gotcha da menzionare]
```

---

## MACRO AREA 1 — FOUNDATION & SETUP

**Obiettivo**: infrastruttura tecnica completa pronta a ospitare il prodotto.
**Sprint totali**: 12
**Stima**: 8-12 giorni

### Step 1.1 — Repo + Next.js init

#### SPRINT 1.1.1 — Setup credenziali GitHub e Supabase per Claude in VS Code

- **Stima**: 1-2 ore
- **Dipendenze**: nessuna (primo sprint)
- **Cosa produce**:
  - Personal Access Token GitHub configurato in env locale
  - Supabase CLI installato (`brew install supabase/tap/supabase`)
  - Service role keys Supabase configurati in env (.env.local)
  - Verifica che `git` e `supabase` CLI funzionano
- **Acceptance criteria**:
  - [ ] `git config --get user.email` ritorna email Feliciano
  - [ ] `gh auth status` mostra autenticato
  - [ ] `supabase --version` ritorna versione installata
  - [ ] `supabase projects list` mostra progetti
- **Riferimenti**: Doc 5 sezione "DevOps", Doc 9 sezione 1.4 e 1.5
- **Note Cowork**: questo è il setup PRIMO assoluto. Senza, niente sprint successivi. Il prompt deve includere: come creare PAT GitHub (link a docs), come trovare service role key Supabase. Feliciano deve fornire credenziali account.

#### SPRINT 1.1.2 — Init Next.js 16 project con stack base

- **Stima**: 2-3 ore
- **Dipendenze**: 1.1.1
- **Cosa produce**:
  - `npx create-next-app@latest predimark-v2 --typescript --app --tailwind --turbopack`
  - Config `tsconfig.json` con `strict: true`, no `any`
  - Tailwind 4 con `@theme` directive in `globals.css` (NO `tailwind.config.ts`)
  - `lucide-react` installato
  - `@tanstack/react-query` installato
  - `zustand` installato
  - Repo Git inizializzato + push su GitHub
- **Acceptance criteria**:
  - [ ] `npm run dev` avvia su localhost:3000
  - [ ] Page `/` mostra placeholder con Tailwind funzionante
  - [ ] `tsc --noEmit` passa senza errori
  - [ ] Repo pushato su GitHub
- **Riferimenti**: Doc 5 sezione 1, Doc 8 sezione 10.1
- **Note Cowork**: package.json deve usare versions latest stable (Next 16.x, React 19.x). Verifica con `npm view next version` prima di scrivere prompt.

#### SPRINT 1.1.3 — Setup design tokens globals.css

- **Stima**: 2 ore
- **Dipendenze**: 1.1.2
- **Cosa produce**:
  - File `app/globals.css` completo con tutti i design tokens da Doc 8 sezione 1
  - Import font Inter Variable via `next/font/google` in `app/layout.tsx`
  - Dark mode default + light mode supportato
  - Test page con colori, tipografia, spacing visualizzati
- **Acceptance criteria**:
  - [ ] CSS vars `--color-bg-primary`, `--color-success`, ecc. tutti presenti
  - [ ] Font Inter caricato e visibile
  - [ ] Toggle dark/light funziona (test manuale via DevTools `prefers-color-scheme`)
  - [ ] Test page in `/test-design-system` mostra palette + typography
- **Riferimenti**: Doc 8 intera (sezioni 1, 10)
- **Note Cowork**: copia ESATTAMENTE i CSS vars da Doc 8 sezione 1.1. Niente colori hardcoded nei componenti, sempre via Tailwind classes.

### Step 1.2 — Supabase project setup

#### SPRINT 1.2.1 — Crea Supabase projects (staging + production)

- **Stima**: 1 ora
- **Dipendenze**: 1.1.1
- **Cosa produce**:
  - Progetto Supabase "predimark-staging" creato
  - Progetto Supabase "predimark-production" creato
  - Connection strings salvate in env vars (.env.staging, .env.production)
  - TimescaleDB extension abilitata su entrambi
  - Test connessione OK
- **Acceptance criteria**:
  - [ ] `supabase projects list` mostra entrambi
  - [ ] `psql $STAGING_DB_URL -c "SELECT version();"` ritorna versione PG
  - [ ] `psql $STAGING_DB_URL -c "SELECT * FROM pg_extension WHERE extname='timescaledb';"` ritorna riga
- **Riferimenti**: Doc 5 sezione 2, Doc 6 sezione 8 (TimescaleDB)
- **Note Cowork**: TimescaleDB extension richiede plan Pro Supabase oppure setup manuale. Verifica disponibilità su free tier prima.

#### SPRINT 1.2.2 — Setup Supabase client e helpers

- **Stima**: 2 ore
- **Dipendenze**: 1.2.1
- **Cosa produce**:
  - `lib/supabase/client.ts` (browser client con anon key)
  - `lib/supabase/server.ts` (server client con cookies)
  - `lib/supabase/admin.ts` (service role per Edge Functions)
  - Types generati da Supabase: `lib/supabase/database.types.ts` (vuoto inizialmente)
- **Acceptance criteria**:
  - [ ] Client browser funziona in test page
  - [ ] Client server funziona in API route test
  - [ ] Service role key MAI esposto al client (verifica via grep)
- **Riferimenti**: Doc 5 sezione 2, Doc 7 sezione 6.1
- **Note Cowork**: enfatizza che `service_role` key va SOLO in env server-side. Mai in `NEXT_PUBLIC_*`.

### Step 1.3 — Privy app setup

#### SPRINT 1.3.1 — Crea Privy app + configurazione

- **Stima**: 1-2 ore
- **Dipendenze**: 1.1.1
- **Cosa produce**:
  - Privy app creata su dashboard.privy.io
  - Login methods abilitati: email, google, apple, twitter, wallet
  - Embedded wallet: auto-create on signup, network Polygon
  - App ID e secret salvati in env vars
- **Acceptance criteria**:
  - [ ] App ID configurato in `.env.local`
  - [ ] Test login email funziona da playground Privy
- **Riferimenti**: Doc 5 sezione 3.3, Doc 7 sezione 5.3
- **Note Cowork**: account Privy va creato da Feliciano (decisione Feliciano: usare email aziendale per il dominio).

#### SPRINT 1.3.2 — Integrazione Privy SDK in Next.js

- **Stima**: 3 ore
- **Dipendenze**: 1.3.1, 1.1.3
- **Cosa produce**:
  - `@privy-io/react-auth` installato
  - `<PrivyProvider>` wrapper in `app/providers.tsx`
  - `lib/privy/client.ts` (configurazione)
  - `lib/privy/server.ts` (verifyToken helper per API routes)
  - Test page `/test-privy` con bottone "Sign in with email"
- **Acceptance criteria**:
  - [ ] Click "Sign in" apre widget Privy
  - [ ] Email OTP arriva e verifica funziona
  - [ ] User loggato vede `userId` mostrato in pagina
  - [ ] Logout funziona
- **Riferimenti**: Doc 5 sezione 3.3, Doc 4 Pagina 7
- **Note Cowork**: configurazione `PrivyProvider` deve includere `defaultChain: polygon`. Test su localhost:3000.

### Step 1.4 — Vercel + CI/CD

#### SPRINT 1.4.1 — Setup Vercel project + environments

- **Stima**: 1 ora
- **Dipendenze**: 1.1.2
- **Cosa produce**:
  - Repo collegato a Vercel project
  - 3 environments configurati (development, staging, production)
  - Env vars copied to Vercel per ogni env
  - Custom domains configurati: predimark.com (production), staging.predimark.com (staging)
- **Acceptance criteria**:
  - [ ] Push su `main` deploya automaticamente su predimark.com (404 OK per ora)
  - [ ] Push su `staging` deploya su staging.predimark.com
  - [ ] PR aprono preview deployment automatico
- **Riferimenti**: Doc 5 sezione 10
- **Note Cowork**: Feliciano deve fornire credenziali Vercel + accesso pannello DNS registrar per impostare CNAME. Cowork dà istruzioni step-by-step DNS.

#### SPRINT 1.4.2 — GitHub Actions CI pipeline

- **Stima**: 2-3 ore
- **Dipendenze**: 1.4.1
- **Cosa produce**:
  - `.github/workflows/ci.yml` con: type check, lint, test, build
  - `.github/workflows/deploy-staging.yml` (auto su merge to staging)
  - `.github/workflows/deploy-edge-functions.yml` (auto su merge to main)
  - Branch protection rules su main: PR required, CI must pass
- **Acceptance criteria**:
  - [ ] PR aperta → CI corre e passa (verde)
  - [ ] Merge to staging → deploy staging (verifica con commit visibile su staging.predimark.com)
- **Riferimenti**: Doc 5 sezione 10
- **Note Cowork**: includi cache `node_modules` per velocizzare CI.

### Step 1.5 — Dev environment & tooling

#### SPRINT 1.5.1 — Setup ESLint, Prettier, Husky pre-commit

- **Stima**: 1-2 ore
- **Dipendenze**: 1.1.2
- **Cosa produce**:
  - ESLint configurato con `next/core-web-vitals` + custom rules
  - Prettier configurato con `singleQuote`, `trailingComma`
  - Husky pre-commit: lint-staged + tsc check
- **Acceptance criteria**:
  - [ ] `npm run lint` funziona
  - [ ] Commit con codice malformato viene bloccato
- **Riferimenti**: Doc 5 sezione 10
- **Note Cowork**: lint rules non eccessivamente strict, evitiamo over-tooling.

#### SPRINT 1.5.2 — Setup Vitest + React Testing Library

- **Stima**: 2 ore
- **Dipendenze**: 1.1.2
- **Cosa produce**:
  - Vitest configurato per unit + integration tests
  - React Testing Library setup per test componenti
  - `npm run test` funziona con esempio test che passa
- **Acceptance criteria**:
  - [ ] `npm run test` esegue test
  - [ ] CI esegue test automaticamente
- **Riferimenti**: Doc 5 sezione 10
- **Note Cowork**: niente setup Playwright qui (sarà sprint MA8). Solo unit/integration.

#### SPRINT 1.5.3 — Inserimento doc 1-8 in cartella progetto

- **Stima**: 30 min
- **Dipendenze**: nessuna
- **Cosa produce**:
  - Cartella `docs/` con tutti i 10 documenti markdown
  - File `HANDOFF-LOG.md` inizializzato con template Doc 9 sezione 1.6
  - File `README.md` di progetto aggiornato con link ai docs
- **Acceptance criteria**:
  - [ ] Tutti i Doc 1-9 presenti in `~/predimark-v2/docs/`
  - [ ] HANDOFF-LOG vuoto ma con header
- **Riferimenti**: Doc 9 sezione 1.3
- **Note Cowork**: questo sprint NON richiede Claude in VS Code, può essere fatto da Feliciano direttamente (drag-and-drop file). Cowork lo segna come done quando Feliciano conferma.

---

## MACRO AREA 2 — DATABASE & AUTH

**Obiettivo**: schema DB completo + auth flow Privy → Supabase end-to-end.
**Sprint totali**: 11
**Stima**: 6-8 giorni

### Step 2.1 — Core tables migrations

#### SPRINT 2.1.1 — Migration users + external_traders

- **Stima**: 2-3 ore
- **Dipendenze**: 1.2.2, 1.5.3
- **Cosa produce**:
  - File `supabase/migrations/20260501000001_users.sql` con tabelle `users` + `external_traders` complete
  - Indici, RLS policies, constraints come da Doc 6
  - Migration applicata a staging
- **Acceptance criteria**:
  - [ ] `\d users` mostra schema corretto
  - [ ] Tutti gli indici elencati Doc 6 presenti
  - [ ] RLS abilitato e policy funzionanti
  - [ ] Test: insert user via SQL, query con auth fittizia → funziona
- **Riferimenti**: Doc 6 sezione 1 (users + external_traders)
- **Note Cowork**: copia il SQL ESATTAMENTE da Doc 6. Verifica con grep che ogni colonna del Doc 6 è in migration. Se Doc 6 ha typos, segnala a Feliciano.

#### SPRINT 2.1.2 — Migration markets

- **Stima**: 2 ore
- **Dipendenze**: 2.1.1
- **Cosa produce**: tabella `markets` con tutti gli indici e RLS
- **Acceptance criteria**: come 2.1.1 ma per `markets`
- **Riferimenti**: Doc 6 sezione 1 (markets)

#### SPRINT 2.1.3 — Migration positions + trades + balances

- **Stima**: 3 ore
- **Dipendenze**: 2.1.2
- **Cosa produce**: tabelle `positions`, `trades`, `balances` con flag `is_demo`
- **Acceptance criteria**:
  - [ ] Tutte e 3 le tabelle create
  - [ ] Foreign keys funzionano (CASCADE delete users)
  - [ ] Test query con filtro `is_demo = false` ritorna solo real
  - [ ] RLS policy "creator delayed view" testata (positions visibili dopo 30 min)
- **Riferimenti**: Doc 6 sezione 1 (positions, trades, balances)
- **Note Cowork**: la RLS policy con `INTERVAL '30 minutes'` è critica per privacy creator. Test specifico richiesto.

### Step 2.2 — Creator + signal tables

#### SPRINT 2.2.1 — Migration creators + creator_payouts + follows + copy_trading_sessions

- **Stima**: 3 ore
- **Dipendenze**: 2.1.3
- **Cosa produce**: 4 tabelle programma creator
- **Acceptance criteria**:
  - [ ] Tutte e 4 create
  - [ ] Constraint `exactly_one_followed` (in `follows`) funziona
  - [ ] Constraint `exactly_one_target` (in `copy_trading_sessions`) funziona
- **Riferimenti**: Doc 6 sezione 2

#### SPRINT 2.2.2 — Migration signals + notifications

- **Stima**: 2 ore
- **Dipendenze**: 2.2.1
- **Cosa produce**: tabelle `signals` + `notifications`
- **Acceptance criteria**: come 2.1.1 per le tabelle
- **Riferimenti**: Doc 6 sezione 3

#### SPRINT 2.2.3 — Migration watchlist + user_preferences + kyc + referrals + achievements

- **Stima**: 3 ore
- **Dipendenze**: 2.2.2
- **Cosa produce**: 6 tabelle minor (watchlist, user_preferences, kyc_submissions, geo_blocks, referrals, achievements + user_achievements)
- **Acceptance criteria**: tutte create con indici e RLS
- **Riferimenti**: Doc 6 sezioni 4, 5, 6

### Step 2.3 — Admin tables + audit log

#### SPRINT 2.3.1 — Migration admin_users + audit_log partitioned

- **Stima**: 3 ore
- **Dipendenze**: 2.2.3
- **Cosa produce**:
  - Tabella `admin_users`
  - Tabella `audit_log` PARTITIONED by month
  - Partitions create per i prossimi 12 mesi
  - Trigger Postgres `audit_critical_changes` per logging automatico
- **Acceptance criteria**:
  - [ ] `\d audit_log` mostra partitioned table
  - [ ] Insert su audit_log routing alla partition corretta
  - [ ] Trigger logga automatic UPDATE su `users`
- **Riferimenti**: Doc 6 sezione 7
- **Note Cowork**: partitioning è un po' tricky. Includi nel prompt esempi PG ufficiali partitioning.

#### SPRINT 2.3.2 — Migration feature_flags + ab_tests

- **Stima**: 2 ore
- **Dipendenze**: 2.3.1
- **Cosa produce**: tabelle feature flags + A/B tests + ab_test_assignments
- **Acceptance criteria**: tabelle create + seed data feature flags default
- **Riferimenti**: Doc 6 sezione 7

### Step 2.4 — TimescaleDB hypertables

#### SPRINT 2.4.1 — Migration equity_curve + price_history hypertables

- **Stima**: 2 ore
- **Dipendenze**: 2.3.2
- **Cosa produce**:
  - Tabelle `equity_curve` + `price_history`
  - Convertite a hypertables via `create_hypertable()`
  - Compression policy + retention policy configurate
- **Acceptance criteria**:
  - [ ] `SELECT * FROM timescaledb_information.hypertables` mostra entrambe
  - [ ] Insert + query funzionano
- **Riferimenti**: Doc 6 sezione 8

### Step 2.5 — Helper functions + seed data

#### SPRINT 2.5.1 — Helper functions + triggers update_updated_at

- **Stima**: 2 ore
- **Dipendenze**: 2.4.1
- **Cosa produce**:
  - Function `update_updated_at()` + trigger applicato a tutte le tabelle con `updated_at`
  - Function `user_positions(user_id, is_demo)` helper
- **Acceptance criteria**: trigger funziona, function ritorna risultati
- **Riferimenti**: Doc 6 sezione 10

#### SPRINT 2.5.2 — Seed data iniziale

- **Stima**: 1-2 ore
- **Dipendenze**: 2.5.1
- **Cosa produce**:
  - File `supabase/seed.sql` con: achievements catalog, geo_blocks default, feature_flags default
  - Eseguito su staging
- **Acceptance criteria**:
  - [ ] `SELECT COUNT(*) FROM achievements` ritorna >= 5
  - [ ] `SELECT COUNT(*) FROM geo_blocks` ritorna >= 5
- **Riferimenti**: Doc 6 sezione 11

### Step 2.6 — Auth flow integration

#### SPRINT 2.6.1 — API endpoint /api/v1/auth/session

- **Stima**: 4 ore
- **Dipendenze**: 1.3.2, 2.5.2
- **Cosa produce**:
  - File `app/api/v1/auth/session/route.ts`
  - Verifica Privy JWT
  - Find or create user in tabella `users`
  - Geo-detection da IP via Cloudflare/MaxMind
  - Set `geo_block_status` corretto
  - Return user object completo
- **Acceptance criteria**:
  - [ ] POST `/api/v1/auth/session` con valid JWT crea record `users`
  - [ ] User da IT ottiene `geo_block_status='demo_only'`
  - [ ] User da paese sanzionato → 403 GEO_BLOCKED
  - [ ] Test con JWT invalido → 401
- **Riferimenti**: Doc 7 sezione 2.1, Doc 5 sezione 5
- **Note Cowork**: usa MaxMind GeoIP2 Lite database (free download). Inizialmente fallback a header `cf-ipcountry` (Cloudflare).

#### SPRINT 2.6.2 — End-to-end signup test

- **Stima**: 2 ore
- **Dipendenze**: 2.6.1
- **Cosa produce**: flusso E2E signup → user record in DB
- **Acceptance criteria**:
  - [ ] Test page `/test-signup`: utente fa signup → vede il suo wallet address
  - [ ] DB `users` table contiene record nuovo
  - [ ] `auth.users` di Supabase contiene record nuovo
- **Riferimenti**: Doc 7 sezione 2.1
- **Note Cowork**: this is the moment of truth. Se funziona, MA2 è done.

---

## MACRO AREA 3 — CORE PAGES (PUBLIC)

**Obiettivo**: pagine pubbliche del prodotto navigabili.
**Sprint totali**: 14
**Stima**: 12-15 giorni

### Step 3.1 — Layout globale

#### SPRINT 3.1.1 — Root layout + Header globale

- **Stima**: 3 ore
- **Dipendenze**: 2.6.2, 1.1.3
- **Cosa produce**:
  - `app/layout.tsx` con providers (PrivyProvider, ThemeProvider, ReactQueryProvider)
  - `components/layout/Header.tsx` (logo + nav + search + user menu + theme toggle + REAL/DEMO switch)
  - Responsive: hamburger menu mobile
- **Acceptance criteria**:
  - [ ] Header sticky in cima
  - [ ] Logo navigates to /
  - [ ] User menu mostra "Sign in" se non loggato, avatar+dropdown se loggato
  - [ ] Theme toggle dark/light funziona
  - [ ] Mobile: hamburger menu apre drawer
- **Riferimenti**: Doc 4 Pagina 1, Doc 8 sezione 5.5
- **Note Cowork**: la REAL/DEMO switch è nascosta se utente non loggato.

#### SPRINT 3.1.2 — Bottom navigation mobile

- **Stima**: 2 ore
- **Dipendenze**: 3.1.1
- **Cosa produce**:
  - `components/layout/BottomNav.tsx` con 5 voci (Home, Search, Signals, Bet Slip, Altro)
  - Visibile solo mobile (`<md`)
  - Active state per pagina corrente
- **Acceptance criteria**:
  - [ ] Bottom nav fixed in bottom mobile
  - [ ] Click su voce naviga a route
  - [ ] Active state corretto su pagina corrente
- **Riferimenti**: Doc 4 Pagina 1 (sezione mobile), Doc 8 sezione 9.5

#### SPRINT 3.1.3 — Footer minimal

- **Stima**: 1 ora
- **Dipendenze**: 3.1.1
- **Cosa produce**: footer con link essential (Privacy, Terms, Support, lingua switch)
- **Acceptance criteria**: footer presente in tutte le pagine pubbliche
- **Riferimenti**: Doc 4 Pagina 1

### Step 3.2 — Polymarket integration

#### SPRINT 3.2.1 — Polymarket Gamma API client

- **Stima**: 4 ore
- **Dipendenze**: 1.5.2
- **Cosa produce**:
  - `lib/polymarket/client.ts` (gammaGet wrapper con retry + cache)
  - `lib/polymarket/queries.ts` (funzioni: searchEvents, getMarketBySlug, getEventById, etc.)
  - `lib/polymarket/mappers.ts` (Polymarket → Predimark types)
  - Types TypeScript per response API
- **Acceptance criteria**:
  - [ ] `searchEvents()` ritorna lista eventi
  - [ ] `getMarketBySlug('trump-2028')` ritorna mercato (test con slug reale)
  - [ ] Cache funziona (no duplicate requests)
- **Riferimenti**: Doc 5 sezione 3.1, Doc 7 sezione 5.1
- **Note Cowork**: V1 codice Predimark esistente ha già queste cose, possiamo riusarne logica/types. Cowork copia adapter da V1 con permission Feliciano.

#### SPRINT 3.2.2 — classifyEvent → 5 CardKind

- **Stima**: 3 ore
- **Dipendenze**: 3.2.1
- **Cosa produce**:
  - `lib/polymarket/classify.ts` con function `classifyEvent(event) → CardKind`
  - 5 CardKind: binary, multi_outcome, multi_strike, h2h_sport, crypto_up_down
- **Acceptance criteria**:
  - [ ] Test con 5 eventi reali (1 per CardKind) → classificazione corretta
  - [ ] Edge case: evento ambiguo → fallback a binary
- **Riferimenti**: Doc 1 sezione "5 CardKind", Doc 4 Pagina 1
- **Note Cowork**: V1 ha già questa logica, riusabile.

#### SPRINT 3.2.3 — WebSocket Polymarket CLOB singleton

- **Stima**: 4 ore
- **Dipendenze**: 3.2.1
- **Cosa produce**:
  - `lib/ws/SingletonWS.ts` (singleton manager generico)
  - `lib/ws/clob.ts` (CLOB WebSocket wrapper)
  - Hooks: `useLiveMidpoint(marketId)`, `useLiveOrderbook(marketId)`
- **Acceptance criteria**:
  - [ ] Hook `useLiveMidpoint` in test page aggiorna in real-time
  - [ ] Una sola WS connection anche con N hook subscriber
  - [ ] Auto-reconnect funziona
- **Riferimenti**: Doc 5 sezione 4, Doc 7 sezione 3.1, Doc 7 sezione 6.1
- **Note Cowork**: V1 ha pattern simile, riusabile.

#### SPRINT 3.2.4 — WebSocket RTDS singleton

- **Stima**: 3 ore
- **Dipendenze**: 3.2.3
- **Cosa produce**:
  - `lib/ws/rtds.ts` (RTDS WebSocket per crypto prices, activity, comments)
  - Hooks: `useCryptoLivePrice(symbol, source)`, `useLiveActivity()`
- **Acceptance criteria**:
  - [ ] Hook `useCryptoLivePrice('btcusdt', 'binance')` aggiorna real-time
  - [ ] Hook `useCryptoLivePrice('btc/usd', 'chainlink')` aggiorna real-time
- **Riferimenti**: Doc 5 sezione 3.1
- **Note Cowork**: importante distinzione fonte risoluzione round 5m/15m (Chainlink) vs 1h/1d (Binance).

### Step 3.3 — EventCard varianti

#### SPRINT 3.3.1 — EventCard Binary variant

- **Stima**: 3 ore
- **Dipendenze**: 3.2.2
- **Cosa produce**:
  - `components/markets/EventCard.tsx` (componente container)
  - `components/markets/cards/BinaryCard.tsx` (variant)
  - Donut probability prominente
- **Acceptance criteria**:
  - [ ] Card mostra title, image, donut prob, prezzo Yes/No
  - [ ] Click su card naviga a `/event/[slug]`
  - [ ] Hover state con shadow
  - [ ] Mobile responsive
- **Riferimenti**: Doc 4 Pagina 1, Doc 8 sezione 3.3

#### SPRINT 3.3.2 — EventCard Multi-outcome + Multi-strike

- **Stima**: 4 ore
- **Dipendenze**: 3.3.1
- **Cosa produce**: 2 variant cards
- **Acceptance criteria**: lista candidates / strike correttamente mostrata
- **Riferimenti**: Doc 4 Pagina 1

#### SPRINT 3.3.3 — EventCard H2H Sport

- **Stima**: 3 ore
- **Dipendenze**: 3.3.1
- **Cosa produce**: variant H2H sport con 2 team + score live
- **Acceptance criteria**: score live aggiornato via WS
- **Riferimenti**: Doc 4 Pagina 1

#### SPRINT 3.3.4 — EventCard Crypto Up/Down

- **Stima**: 4 ore
- **Dipendenze**: 3.3.1, 3.2.4
- **Cosa produce**: variant crypto round con countdown + bottoni Up/Down + prezzo live
- **Acceptance criteria**:
  - [ ] Countdown aggiorna ogni secondo
  - [ ] Prezzo crypto live via WS
  - [ ] Sorgente prezzo corretta (Chainlink per 5m/15m, Binance per 1h/1d)
- **Riferimenti**: Doc 4 Pagina 1, Doc 4 Pagina 2 (Crypto Round View)
- **Note Cowork**: V1 ha già componente CryptoRoundView, riusabile.

### Step 3.4 — Pagina Home

#### SPRINT 3.4.1 — Pagina Home layout

- **Stima**: 4 ore
- **Dipendenze**: 3.3.1-4, 3.1.1
- **Cosa produce**:
  - `app/page.tsx` (route /)
  - Hero card grandi (top 3-5 mercati featured)
  - Sidebar adattiva con filtri categoria
  - CryptoLiveRail con 6 coin (BTC ETH SOL XRP DOGE BNB)
  - Lista mercati con EventCard grid
  - Filtri tag
- **Acceptance criteria**:
  - [ ] Home carica e mostra mercati live
  - [ ] Filtri categoria funzionano
  - [ ] CryptoLiveRail aggiorna real-time
  - [ ] Mobile responsive
- **Riferimenti**: Doc 4 Pagina 1, Doc 7 sezione 2.3

### Step 3.5 — Pagina evento (5 layout)

#### SPRINT 3.5.1 — Pagina evento Binary layout

- **Stima**: 5 ore
- **Dipendenze**: 3.4.1, 3.3.1
- **Cosa produce**:
  - `app/event/[slug]/page.tsx`
  - Layout binary: hero + chart + orderbook expansion + comments
  - SVG CandleChart custom (line/candle/heikin con zoom+pan+tooltip)
- **Acceptance criteria**:
  - [ ] Pagina renders per evento binary
  - [ ] Chart mostra storia prezzi
  - [ ] Orderbook expansion accordion funziona
- **Riferimenti**: Doc 4 Pagina 2 sezione binary
- **Note Cowork**: V1 ha già CandleChart custom, riusabile.

#### SPRINT 3.5.2 — Pagina evento Multi-outcome + Multi-strike

- **Stima**: 4 ore
- **Dipendenze**: 3.5.1
- **Cosa produce**: 2 layout dedicati per multi-outcome (lista candidates) e multi-strike (ladder soglie)
- **Riferimenti**: Doc 4 Pagina 2

#### SPRINT 3.5.3 — Pagina evento H2H Sport con Hub Sport

- **Stima**: 5 ore
- **Dipendenze**: 3.5.1
- **Cosa produce**: layout sport + hub sport navigation (Live/NBA/UCL/NHL/UFC/Altro sub-nav)
- **Riferimenti**: Doc 4 Pagina 2

#### SPRINT 3.5.4 — Pagina evento Crypto Up/Down con CryptoRoundView

- **Stima**: 5 ore
- **Dipendenze**: 3.5.1, 3.3.4
- **Cosa produce**: layout crypto round + auto-redirect al round successivo se scaduto + navigation pallini orari
- **Acceptance criteria**: round 5m/15m/1h/1d tutti supportati, redirect funziona
- **Riferimenti**: Doc 4 Pagina 2

#### SPRINT 3.5.5 — Espansione inline orderbook

- **Stima**: 3 ore
- **Dipendenze**: 3.5.1
- **Cosa produce**: accordion orderbook completo (asks + bids + spread + depth)
- **Riferimenti**: Doc 4 Pagina 2 sezione orderbook
- **Note Cowork**: V1 ha già LiveMarketView con orderbook, riusabile.

### Step 3.6 — Signup flow

#### SPRINT 3.6.1 — Pagina /signup con 5 metodi auth

- **Stima**: 3 ore
- **Dipendenze**: 1.3.2, 3.1.1
- **Cosa produce**:
  - `app/signup/page.tsx` con 5 bottoni auth (Email, Google, Apple, X, Wallet)
  - Pagina `/signup/verify` per OTP
- **Acceptance criteria**:
  - [ ] Click Email → input email → ricevi OTP → verifica → atterra in home con DEMO mode
- **Riferimenti**: Doc 4 Pagina 7

#### SPRINT 3.6.2 — Onboarding soft modal

- **Stima**: 4 ore
- **Dipendenze**: 3.6.1
- **Cosa produce**:
  - Modal multi-step (Welcome / Interests / First trade demo / Telegram / Complete)
  - Skip facile in qualsiasi step
  - Apertura automatica al primo atterraggio post-signup
- **Acceptance criteria**: modal funziona end-to-end, skip persiste
- **Riferimenti**: Doc 4 Pagina 7

#### SPRINT 3.6.3 — Geo-block banner soft + redirect concreto

- **Stima**: 2 ore
- **Dipendenze**: 3.6.2, 2.6.1
- **Cosa produce**: banner per paesi demo-only + redirect quando prova trade real
- **Riferimenti**: Doc 4 Pagina 7

---

## MACRO AREA 4 — TRADING CORE

**Obiettivo**: flusso trade completo end-to-end (REAL + DEMO).
**Sprint totali**: 12
**Stima**: 10-12 giorni

### Step 4.1 — Trade widget UI

#### SPRINT 4.1.1 — Trade widget sidebar desktop

- **Stima**: 5 ore
- **Dipendenze**: 3.5.1
- **Cosa produce**:
  - `components/trade/TradeWidget.tsx` (sidebar fissa destra desktop)
  - Bottoni Compra/Vendi sticky
  - Tab Mercato/Limite
  - Importo input + quick amounts ($5, $10, $25, $50)
  - Preview shares + total + fees
- **Acceptance criteria**: widget visibile su desktop su pagine evento, calcoli corretti
- **Riferimenti**: Doc 4 Pagina 2 sezione Trade Widget

#### SPRINT 4.1.2 — Trade widget bottom sheet mobile

- **Stima**: 4 ore
- **Dipendenze**: 4.1.1
- **Cosa produce**: bottom sheet mobile con drag-to-close (Framer Motion)
- **Acceptance criteria**: swipe-down chiude, tap-on-card apre
- **Riferimenti**: Doc 4 Pagina 2, Doc 8 sezione 4.3

### Step 4.2 — Modalità Mercato

#### SPRINT 4.2.1 — API endpoint /api/v1/trades/submit (DEMO mode)

- **Stima**: 3 ore
- **Dipendenze**: 2.6.1, 4.1.1
- **Cosa produce**:
  - Endpoint per trade DEMO (no Polymarket, solo DB)
  - Validazione, balance check, position update
- **Acceptance criteria**:
  - [ ] DEMO trade riduce demo_balance
  - [ ] Position record creato/aggiornato
  - [ ] Trade record creato
- **Riferimenti**: Doc 7 sezione 2.4

#### SPRINT 4.2.2 — Submit trade DEMO frontend integration

- **Stima**: 3 ore
- **Dipendenze**: 4.2.1
- **Cosa produce**: hook `useSubmitTrade()` + UI feedback success/error
- **Acceptance criteria**: utente fa trade demo → vede position aggiornata
- **Riferimenti**: Doc 7 sezione 6.4

### Step 4.3 — Modalità Limit

#### SPRINT 4.3.1 — Limit order UI con scadenza preset

- **Stima**: 3 ore
- **Dipendenze**: 4.2.2
- **Cosa produce**:
  - Tab Limit nel widget
  - 6 preset scadenza (5m / 1h / 12h / 24h / Fine giornata / Personalizzato)
  - Slider/input prezzo limit
- **Acceptance criteria**: order limit creato (in DEMO per ora)
- **Riferimenti**: Doc 4 Pagina 2

### Step 4.4 — REAL mode CLOB integration

#### SPRINT 4.4.1 — EIP-712 typed data builder

- **Stima**: 4 ore
- **Dipendenze**: 4.2.2
- **Cosa produce**:
  - `lib/polymarket/trading/eip712.ts` (Order V2 types con builder bytes32)
  - `lib/polymarket/trading/sign.ts` (buildOrderTypedData con builder code)
- **Acceptance criteria**: typed data generato è valid Polymarket format
- **Riferimenti**: Doc 5 sezione 3.1, Doc 7 sezione 5.1
- **Note Cowork**: V1 ha già scaffold `lib/polymarket/trading/`, riusabile. Verifica builder code env var.

#### SPRINT 4.4.2 — CLOB submit trade REAL

- **Stima**: 5 ore
- **Dipendenze**: 4.4.1
- **Cosa produce**:
  - Edge Function `submit-trade` per signing + submit a Polymarket CLOB
  - L2 HMAC headers per auth
  - POST /order via CLOB client
  - Update DB con trade record
- **Acceptance criteria**:
  - [ ] Trade REAL submitto su Polymarket → tx hash visible on-chain
  - [ ] Builder fee accreditata al builder code
- **Riferimenti**: Doc 7 sezione 4.1
- **Note Cowork**: questo è uno sprint critico. Test con somme piccole ($1) prima.

### Step 4.5 — Position management

#### SPRINT 4.5.1 — Sell position (close)

- **Stima**: 3 ore
- **Dipendenze**: 4.4.2
- **Cosa produce**: API endpoint `/api/v1/trades/sell` + UI sell button su position card
- **Acceptance criteria**: utente vende N share → P&L calcolato corretto
- **Riferimenti**: Doc 7 sezione 2.4

#### SPRINT 4.5.2 — Auto-update positions on resolution

- **Stima**: 3 ore
- **Dipendenze**: 4.5.1
- **Cosa produce**:
  - Job nightly che check mercati risolti
  - Update positions con resolution outcome
  - Insert trade record type='resolution' con P&L finale
- **Acceptance criteria**: mercato risolto → position chiuso, balance aggiornato
- **Riferimenti**: Doc 7 sezione 4.5

### Step 4.6 — Real-time + signals

#### SPRINT 4.6.1 — Banner Segnale Predimark integration

- **Stima**: 3 ore
- **Dipendenze**: 4.4.2
- **Cosa produce**:
  - Banner in trade widget con segnale attivo per il mercato
  - "BUY UP +14% / Confidence 72%"
- **Acceptance criteria**: segnale mostrato se presente, hidden se assente
- **Riferimenti**: Doc 4 Pagina 2

---

## MACRO AREA 5 — USER PROFILE & DEMO

**Obiettivo**: pagina profilo /me completa + demo separation.
**Sprint totali**: 9
**Stima**: 7-9 giorni

### Step 5.1 — Layout /me

#### SPRINT 5.1.1 — Layout /me + sub-nav

- **Stima**: 3 ore
- **Dipendenze**: 4.6.1
- **Cosa produce**: `app/me/layout.tsx` con sub-nav (Overview / Positions / History / Watchlist / Stats / Settings)
- **Riferimenti**: Doc 4 Pagina 3

### Step 5.2 — Hero finanziario + equity curve

#### SPRINT 5.2.1 — Hero finanziario Robinhood-style

- **Stima**: 4 ore
- **Dipendenze**: 5.1.1
- **Cosa produce**:
  - Saldo principale grande + delta P&L oggi
  - Chart equity curve SVG custom (200-300px height)
  - Quick actions buttons (Deposit / Withdraw / View positions)
- **Acceptance criteria**: equity curve mostra dati reali utente
- **Riferimenti**: Doc 4 Pagina 3, Doc 8 sezione 5.4

#### SPRINT 5.2.2 — API equity curve + cron job snapshot

- **Stima**: 3 ore
- **Dipendenze**: 5.2.1, 2.4.1
- **Cosa produce**:
  - Edge Function `calculate-user-stats` (cron ogni 5 min)
  - Snapshot equity in hypertable
  - Endpoint `/api/v1/users/me/equity-curve`
- **Riferimenti**: Doc 7 sezione 4.5

### Step 5.3 — Sub-pages

#### SPRINT 5.3.1 — Sub-page Positions

- **Stima**: 3 ore
- **Dipendenze**: 5.1.1
- **Cosa produce**: lista posizioni aperte con filter + sort
- **Riferimenti**: Doc 4 Pagina 3

#### SPRINT 5.3.2 — Sub-page History con export CSV

- **Stima**: 3 ore
- **Dipendenze**: 5.3.1
- **Cosa produce**: history trade con filter + bottone export CSV
- **Riferimenti**: Doc 4 Pagina 3

#### SPRINT 5.3.3 — Sub-page Stats + Calibration curve

- **Stima**: 5 ore
- **Dipendenze**: 5.2.2
- **Cosa produce**:
  - KPI grid (Total P&L, ROI, Win rate, Sharpe, Brier, ECE)
  - Calibration curve chart (differenziatore Predimark)
  - Stats by category
- **Acceptance criteria**: calibration curve calcolata correttamente
- **Riferimenti**: Doc 4 Pagina 3, Doc 7 sezione 2.2 (calibration)
- **Note Cowork**: calibration formula da `prediction-market-analysis` di Becker repo (vedi memorie utente).

#### SPRINT 5.3.4 — Sub-page Watchlist

- **Stima**: 2 ore
- **Dipendenze**: 5.1.1
- **Cosa produce**: lista mercati seguiti con notify settings
- **Riferimenti**: Doc 4 Pagina 3

### Step 5.4 — Demo mode separation

#### SPRINT 5.4.1 — Routes /me/demo/\* parallele

- **Stima**: 4 ore
- **Dipendenze**: 5.3.4
- **Cosa produce**:
  - Sub-pages `/me/demo/positions`, `/me/demo/history`, ecc. parallele a /me/\*
  - Tutte le query con filtro `is_demo = true`
  - Banner persistente "DEMO MODE"
- **Riferimenti**: Doc 4 Pagina 3 sezione demo

#### SPRINT 5.4.2 — Switch REAL/DEMO redirect logic

- **Stima**: 2 ore
- **Dipendenze**: 5.4.1
- **Cosa produce**: switch in header redirect a `/me/demo/*` o `/me/*`
- **Riferimenti**: Doc 4 Pagina 7

### Step 5.5 — Settings sub-pages

#### SPRINT 5.5.1 — Settings sub-pages (7 sezioni)

- **Stima**: 5 ore
- **Dipendenze**: 5.4.2
- **Cosa produce**:
  - 7 sub-pages settings: profile, notifications, preferences, security, billing, language, data
  - Endpoint `/api/v1/users/me/preferences` PATCH
- **Riferimenti**: Doc 4 Pagina 3 sezione settings

---

## MACRO AREA 6 — CREATOR PROGRAM & LEADERBOARD

**Obiettivo**: programma creator + leaderboard ibrida + import top trader.
**Sprint totali**: 11
**Stima**: 9-11 giorni

### Step 6.1 — Creator profile page

#### SPRINT 6.1.1 — Pagina /creator/[username]

- **Stima**: 5 ore
- **Dipendenze**: 5.5.1
- **Cosa produce**: profilo Verified Creator completo (hero, stats, positions con delay 30min, achievements)
- **Riferimenti**: Doc 4 Pagina 4

#### SPRINT 6.1.2 — Pagina /trader/[address] per External

- **Stima**: 4 ore
- **Dipendenze**: 6.1.1
- **Cosa produce**: profilo External Trader con disclaimer permanente "⚠ Non partner Predimark"
- **Riferimenti**: Doc 4 Pagina 4

### Step 6.2 — Application form

#### SPRINT 6.2.1 — Form /creator/apply

- **Stima**: 3 ore
- **Dipendenze**: 6.1.1
- **Cosa produce**: form application + endpoint POST `/api/v1/creators/apply`
- **Riferimenti**: Doc 4 Pagina 4, Doc 7 sezione 2.5

### Step 6.3 — Leaderboard

#### SPRINT 6.3.1 — Endpoint leaderboard unified

- **Stima**: 4 ore
- **Dipendenze**: 6.1.2
- **Cosa produce**:
  - Endpoint `/api/v1/leaderboard` unified (Verified + External mescolati)
  - Filtri: period, sort, category, trader_type, min_volume
  - Cache 60s Redis Upstash
- **Riferimenti**: Doc 7 sezione 2.7

#### SPRINT 6.3.2 — Pagina /leaderboard

- **Stima**: 5 ore
- **Dipendenze**: 6.3.1
- **Cosa produce**:
  - Tabella desktop + card list mobile
  - Filtri (period, sort, category, trader type)
  - Pin riga utente loggato
  - Sharpe sort special behavior (filtra Verified)
- **Riferimenti**: Doc 4 Pagina 5

#### SPRINT 6.3.3 — Toggle leaderboard mode (1-tab vs 2-tab)

- **Stima**: 2 ore
- **Dipendenze**: 6.3.2
- **Cosa produce**: setting admin runtime + 2-tab UI quando attivata
- **Riferimenti**: Doc 4 Pagina 5

### Step 6.4 — Score + Tier + Import

#### SPRINT 6.4.1 — Score Predimark calcolo + Tier assignment

- **Stima**: 4 ore
- **Dipendenze**: 6.3.1
- **Cosa produce**:
  - Cron job nightly che calcola score 0-100 per Verified
  - Assignment tier (Gold ≥80, Silver 60-79, Bronze 40-59, Rising new high-performer, Standard rest)
- **Acceptance criteria**: tier corretto per ogni creator
- **Riferimenti**: Doc 4 Pagina 4

#### SPRINT 6.4.2 — Edge Function import-polymarket-leaderboard

- **Stima**: 4 ore
- **Dipendenze**: 6.4.1
- **Cosa produce**:
  - Cron ogni 6 ore: fetch top 2000 trader Polymarket Data API
  - UPSERT in `external_traders` table
  - Calcola ranking, win_rate, specialization
- **Acceptance criteria**: dopo run, `SELECT COUNT(*) FROM external_traders` ritorna >= 1000
- **Riferimenti**: Doc 7 sezione 4.4

### Step 6.5 — Follow + Copy

#### SPRINT 6.5.1 — Follow system + endpoint

- **Stima**: 3 ore
- **Dipendenze**: 6.1.2
- **Cosa produce**: bottone Follow + endpoint POST `/api/v1/creators/:username/follow`
- **Riferimenti**: Doc 7 sezione 2.5

#### SPRINT 6.5.2 — Notifiche follow (new position, position closed)

- **Stima**: 3 ore
- **Dipendenze**: 6.5.1
- **Cosa produce**: trigger Postgres che inserisce notification quando creator apre/chiude position
- **Riferimenti**: Doc 7 sezione 2.5

#### SPRINT 6.5.3 — Copy single trade UI manual

- **Stima**: 4 ore
- **Dipendenze**: 6.5.2
- **Cosa produce**:
  - Bottone "Copy this trade" in notifica + UI dialog
  - Dialog acknowledge per External Trader (caveat espliciti)
  - Submit copy trade come trade normale con `source='copy_creator'` o `'copy_external'` + service fee 1% se External
- **Riferimenti**: Doc 4 Pagina 4
- **Note Cowork**: copy auto via session keys è V1.1, qui solo manual.

---

## MACRO AREA 7 — ADMIN PANEL

**Obiettivo**: pannello admin completo per gestione operativa.
**Sprint totali**: 13
**Stima**: 11-13 giorni

### Step 7.1 — Layout admin + auth

#### SPRINT 7.1.1 — Layout admin con sidebar gerarchica

- **Stima**: 4 ore
- **Dipendenze**: 6.5.3
- **Cosa produce**: `app/admin/layout.tsx` con top bar + sidebar 12 sezioni
- **Riferimenti**: Doc 4 Pagina 6

#### SPRINT 7.1.2 — Role-based access (3 ruoli)

- **Stima**: 3 ore
- **Dipendenze**: 7.1.1, 2.3.1
- **Cosa produce**: middleware `requireAdminRole(['admin', 'super_admin', 'moderator'])` per ogni route admin
- **Acceptance criteria**: utente normale → 404, moderator → solo support pages, super-admin → tutto
- **Riferimenti**: Doc 4 Pagina 6

### Step 7.2 — Dashboard

#### SPRINT 7.2.1 — Dashboard admin con KPI

- **Stima**: 4 ore
- **Dipendenze**: 7.1.2
- **Cosa produce**: KPI grid + alerts bar + charts + recent activity
- **Riferimenti**: Doc 4 Pagina 6 sezione Dashboard

### Step 7.3 — Users management

#### SPRINT 7.3.1 — Lista users + dettaglio

- **Stima**: 5 ore
- **Dipendenze**: 7.2.1
- **Cosa produce**: tabella users + sub-page detail con tabs (Overview / Trades / KYC / Notifications / Audit)
- **Riferimenti**: Doc 4 Pagina 6 sezione Users

#### SPRINT 7.3.2 — KYC review queue + Refunds queue

- **Stima**: 4 ore
- **Dipendenze**: 7.3.1
- **Cosa produce**: 2 queue pages con approve/reject pattern
- **Riferimenti**: Doc 4 Pagina 6

### Step 7.4 — Markets + Fees

#### SPRINT 7.4.1 — Markets management (4 sub-pages)

- **Stima**: 4 ore
- **Dipendenze**: 7.2.1
- **Cosa produce**: lista, featured curate (drag-drop), hidden, import manual
- **Riferimenti**: Doc 4 Pagina 6 sezione Markets

#### SPRINT 7.4.2 — Fees configuration runtime

- **Stima**: 3 ore
- **Dipendenze**: 7.2.1
- **Cosa produce**: form per cambiare builder fee + service fee + creator share + telegram premium price con audit log
- **Riferimenti**: Doc 4 Pagina 6 sezione Fees

### Step 7.5 — Creators

#### SPRINT 7.5.1 — Creators applications review

- **Stima**: 3 ore
- **Dipendenze**: 7.3.2
- **Cosa produce**: queue applications con approve/reject + reason note
- **Riferimenti**: Doc 4 Pagina 6 sezione Creators

#### SPRINT 7.5.2 — Creator payouts queue

- **Stima**: 3 ore
- **Dipendenze**: 7.5.1
- **Cosa produce**: lista payouts pending + bottone "Process payouts batch"
- **Riferimenti**: Doc 4 Pagina 6

### Step 7.6 — Notifications + Analytics

#### SPRINT 7.6.1 — Broadcast notifications

- **Stima**: 4 ore
- **Dipendenze**: 7.2.1
- **Cosa produce**: form per inviare annuncio multi-canale (push, email, telegram)
- **Riferimenti**: Doc 4 Pagina 6 sezione Notifications

#### SPRINT 7.6.2 — Analytics dashboard

- **Stima**: 4 ore
- **Dipendenze**: 7.2.1
- **Cosa produce**: dashboard con DAU/MAU, funnel, retention, top markets
- **Riferimenti**: Doc 4 Pagina 6 sezione Analytics

### Step 7.7 — Audit + Settings

#### SPRINT 7.7.1 — Audit log viewer

- **Stima**: 3 ore
- **Dipendenze**: 7.2.1, 2.3.1
- **Cosa produce**: tabella audit log con filtri (actor, action, target, period) + expand JSON diff
- **Riferimenti**: Doc 4 Pagina 6 sezione Audit

#### SPRINT 7.7.2 — Feature flags + A/B tests UI

- **Stima**: 4 ore
- **Dipendenze**: 7.7.1, 2.3.2
- **Cosa produce**: gestione feature flags (enable/disable + rollout %) + A/B test config
- **Riferimenti**: Doc 4 Pagina 6 sezione Settings

#### SPRINT 7.7.3 — Settings (team, branding, integrations)

- **Stima**: 3 ore
- **Dipendenze**: 7.7.2
- **Cosa produce**: 3 settings pages restanti (team admin management, branding, integrations)
- **Riferimenti**: Doc 4 Pagina 6 sezione Settings

---

## MACRO AREA 8 — POLISH, TESTING, LAUNCH

**Obiettivo**: quality + production deploy + soft launch beta.
**Sprint totali**: 10
**Stima**: 8-10 giorni

### Step 8.1 — Testing

#### SPRINT 8.1.1 — Setup Playwright E2E

- **Stima**: 3 ore
- **Dipendenze**: 7.7.3
- **Cosa produce**: Playwright installato + test config + CI integration
- **Riferimenti**: Doc 5 sezione 10

#### SPRINT 8.1.2 — E2E test signup flow

- **Stima**: 3 ore
- **Dipendenze**: 8.1.1
- **Cosa produce**: test scenario signup → onboarding → first demo trade

#### SPRINT 8.1.3 — E2E test trade flow REAL

- **Stima**: 3 ore
- **Dipendenze**: 8.1.2
- **Cosa produce**: test scenario login → deposit → trade real → sell

#### SPRINT 8.1.4 — E2E test creator + leaderboard

- **Stima**: 3 ore
- **Dipendenze**: 8.1.3
- **Cosa produce**: test scenario follow creator + view leaderboard

### Step 8.2 — Performance + Accessibility

#### SPRINT 8.2.1 — Performance audit + optimization

- **Stima**: 4 ore
- **Dipendenze**: 8.1.4
- **Cosa produce**:
  - Lighthouse audit su pagine critiche
  - Bundle size analysis
  - ISR + cache tuning
- **Acceptance criteria**: Lighthouse score > 90 su pagine critiche

#### SPRINT 8.2.2 — Accessibility audit WCAG AA

- **Stima**: 4 ore
- **Dipendenze**: 8.2.1
- **Cosa produce**: audit con axe-core + fix issues
- **Acceptance criteria**: zero issues critical, zero issues serious

### Step 8.3 — Multilingua

#### SPRINT 8.3.1 — Setup next-intl + estrazione strings

- **Stima**: 3 ore
- **Dipendenze**: 8.2.2
- **Cosa produce**: next-intl configurato + tutti i testi UI in `messages/en.json`

#### SPRINT 8.3.2 — Traduzione 5 lingue (EN + ES + PT + IT + FR)

- **Stima**: 4 ore
- **Dipendenze**: 8.3.1
- **Cosa produce**: file `messages/[locale].json` per tutte e 5 le lingue (auto-translate via Claude API + review)
- **Note Cowork**: usa Claude API per traduzione automatica + review manuale Feliciano per termini critici (legali, finanziari).

### Step 8.4 — Launch

#### SPRINT 8.4.1 — Production setup + DNS + SSL

- **Stima**: 2 ore
- **Dipendenze**: 8.3.2
- **Cosa produce**: predimark.com configurato, SSL automatico Vercel, env vars production complete
- **Note Cowork**: Feliciano deve fare 1 click sul DNS registrar per ultimi record.

#### SPRINT 8.4.2 — Soft launch + waitlist + monitoring setup

- **Stima**: 3 ore
- **Dipendenze**: 8.4.1
- **Cosa produce**:
  - Landing page waitlist
  - Sentry + PostHog setup (free tier)
  - 100 inviti beta privata
- **Acceptance criteria**: 100 utenti possono fare signup ed esplorare il prodotto

---

## RIEPILOGO

**Totale sprint**: 92
**Macro aree**: 8
**Step**: 51
**Stima totale**: 73-95 giorni di lavoro Claude in VS Code
**Con buffer 30%**: 95-124 giorni = ~14-18 settimane
**Lancio target**: ottobre 2026 se inizio metà maggio

---

## PARTE 9 — COME COWORK USA QUESTA LIBRERIA

Quando arriva il momento di iniziare uno sprint:

1. Cowork legge la spec dello sprint qui
2. Cowork legge i Doc 1-8 referenziati
3. Cowork prepara un **prompt eseguibile** per Claude in VS Code che include:
   - Riferimento allo sprint ID
   - Cosa produrre (copiato/espanso da qui)
   - Acceptance criteria checklist
   - Sezioni rilevanti dei Doc copiate inline (es. SQL completo da Doc 6)
   - Istruzioni operative concrete (file path, commit message, branch name)
4. Feliciano copy-paste il prompt in VS Code
5. Claude in VS Code scrive codice + commit + push + PR
6. Cowork review + dà OK per merge
7. Claude in VS Code mergia
8. Cowork aggiorna HANDOFF-LOG
9. Next sprint

---

_Fine Documento 9 v2 — Roadmap & Sprint Plan completo_
_Continua con Documento 10 (Memo finale per Cowork) nella sessione successiva_
