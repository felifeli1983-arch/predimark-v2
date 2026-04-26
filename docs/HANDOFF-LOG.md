# Predimark V2 — Handoff Log

> Aggiornato da Cowork dopo ogni sprint chiuso
> Ultimo update: 2026-04-26

---

## Stato corrente

- **Sprint corrente**: MA3 — prossimo: Sprint 3.3.3 (EventCard H2H Sport)
- **Live URLs**: `https://auktora.com` / `https://predimark-v2.vercel.app`
- **Macro Area attiva**: MA3 — Core Pages
- **Blockers attivi**: nessuno
- **Note speciali**: MA1 ✅. MA2 ✅. Step 3.1 Layout ✅. Step 3.2 WS layer completo ✅. Sprint 3.3.1/3.3.2 EventCard ✅. Prossimo: 3.3.3 H2H → 3.3.4 Crypto → 3.4.1 Home layout. Badge Slip rinviato a MA4.

---

## Sprint completati

### ✅ Sprint 3.3.2 — EventCard Multi-outcome + Multi-strike

- **Chiuso**: 2026-04-26
- **Commit**: `febb39b` — feat: EventCard Multi-outcome + Multi-strike variants (3.3.2)
- **Output**:
  - `components/markets/cards/MultiOutcomeCard.tsx` (145 righe) — top 3 outcome per `yesPrice` desc, barra orizzontale proporzionale, `+ N altri →`. Euristica `looksLikeDate` per variante 2b: se ≥50% label top sembrano date → `showEndDate=false` nel footer
  - `components/markets/cards/MultiStrikeCard.tsx` (173 righe) — top 4 soglie per strike value desc (`extractStrike` regex su `$130,000`/`100k`/`$1.5M`/`2B`). Soglia "corrente" (prima con `yesPrice>0.5`) highlighted con `color-success` + bold. `showEndDate=false` sempre (Pattern 2)
  - `components/markets/EventCard.tsx` aggiornato — `multi_outcome` → `MultiOutcomeCard`, `multi_strike` → `MultiStrikeCard`. Placeholder rimasto solo per `h2h_sport` e `crypto_up_down`
- **Acceptance criteria**: tutti ✅ — sort desc ✅, `+ N altri →` ✅, variante 2b no endDate ✅, highlighted current strike ✅, Pattern 2 no endDate ✅, `stopPropagation` sui click outcome/strike ✅, nessun colore hardcoded ✅, nessun `display` inline su elementi responsive ✅, `tsc --noEmit` exit 0 ✅, 38/38 test ✅
- **Decisioni**:
  - `onAddToSlip` riceve `marketId` (non `'yes'/'no'`) — ogni outcome/strike è un mercato distinto con il proprio id
  - Il click su outcome/strike chiama `onAddToSlip` ma non naviga — `preventDefault + stopPropagation` evita il Link wrapper
- **PR**: N/A

### ✅ Sprint 3.2.4 — WebSocket RTDS singleton

- **Chiuso**: 2026-04-26
- **Commit**: `027d4a7` — feat: WebSocket RTDS singleton — activity feed + crypto live prices (3.2.4)
- **Output**:
  - `lib/ws/rtds.ts` (84 righe) — wrapper RTDS: `subscribeToActivity`, `subscribeToCryptoPrices`. URL: `wss://rpc.polymarket.com`. Topic: `activity` / `crypto_prices` (Binance) / `crypto_prices_chainlink` (Chainlink). Filter symbol case-insensitive inline nel listener
  - `lib/ws/hooks/useCryptoLivePrice.ts` (54 righe) — `'use client'`, ritorna `{ price, change24h, loading }` per `symbol + source`. Reset su cambio parametri
  - `lib/ws/hooks/useLiveActivity.ts` (61 righe) — `'use client'`, ritorna ultimi N trade, opzione `marketId` per filtraggio per mercato (usata dalla Crypto card live betting feed)
- **Acceptance criteria**: `npx tsc --noEmit` exit 0 ✅, `npx eslint .` exit 0 ✅, 38/38 test pass ✅, `npm run build` exit 0 ✅, tutti i file ≤150 righe ✅
- **Decisioni architetturali**:
  - `SingletonWS` riusato senza modifiche — CLOB e RTDS sono connessioni separate automaticamente per URL diversi
  - Regola sorgente prezzo rispettata: `source: 'chainlink'` → topic `crypto_prices_chainlink` (round 5m/15m), `source: 'binance'` → `crypto_prices` (round 1h/1d). Scelta delegata al consumer (la CryptoCard in 3.3.4 calcolerà la durata del round e passerà la source corretta)
  - 1 `eslint-disable` mirato su pattern `setState` in reset subscription
- **PR**: N/A

### ✅ Sprint 3.2.3 — WebSocket CLOB singleton

- **Chiuso**: 2026-04-26
- **Commit**: `26eb8a3` — feat: WebSocket CLOB singleton — live prices + orderbook hooks (3.2.3)
- **Output**:
  - `lib/ws/SingletonWS.ts` (137 righe) — manager generico: `Map<url, ManagedWS>` module-level, reference counting, auto-reconnect exponential backoff (max 30s), pending messages queue per subscribe durante CONNECTING, server-safe guard `typeof window`
  - `lib/ws/clob.ts` (99 righe) — wrapper CLOB: `subscribeToPriceChange`, `subscribeToBook`. URL: `wss://ws-subscriptions-clob.polymarket.com/ws/market`. Filter per `asset_id` nel listener — più hook con asset diversi coesistono sulla stessa connessione
  - `lib/ws/hooks/useLiveMidpoint.ts` (52 righe) — `'use client'`, ritorna `{ midpoint, change }` per `assetId | null`
  - `lib/ws/hooks/useLiveOrderbook.ts` (56 righe) — `'use client'`, ritorna `{ bids, asks }` normalizzati, gestisce alias `buys/sells` Polymarket
- **Acceptance criteria**: `npx tsc --noEmit` exit 0 ✅, `npx eslint .` exit 0 ✅, 38/38 test pass ✅, `npm run build` exit 0 ✅, tutti i file ≤150 righe ✅
- **Decisioni architetturali**:
  - Singleton via module-level Map, non Context/Zustand — hook trasparenti al pattern
  - Connessione si chiude solo quando `refCount === 0` — multi-componenti condividono 1 WS
  - 2 `eslint-disable` mirati documentati per pattern `setState` in `useEffect` su reset subscription
- **Test manuale** (da fare quando UI 3.3.4 è pronta): DevTools → Network → WS → 1 sola connessione `wss://ws-subscriptions-clob...` anche con più componenti che usano lo stesso asset
- **PR**: N/A

### ✅ Fix audit post-3.3.1 — Colori hardcoded + inline display (Cowork)

- **Chiuso**: 2026-04-26
- **Trovato da**: audit sistematico codebase vs docs
- **Output**:
  - `app/globals.css` — aggiunta `--color-overlay` in dark (0.65) e light (0.55) mode
  - `components/layout/header/MobileDrawer.tsx` — backdrop `rgba(0,0,0,0.65)` → `var(--color-overlay)`
  - `components/layout/BottomNav.tsx` — backdrop `rgba(0,0,0,0.65)` → `var(--color-overlay)`
  - `components/markets/cards/BinaryCard.tsx` — `style={{ display: 'flex' }}` inline → `className="flex flex-col"` / `className="flex w-full"` (rispetta regola AGENTS.md)
- **TypeScript**: `npx tsc --noEmit` exit 0 ✅
- **PR**: N/A

### ✅ Sprint 3.3.1 — EventCard Binary variant + DonutChart + shared Header/Footer

- **Chiuso**: 2026-04-26
- **Commit**: `88433d6` — `feat: EventCard Binary variant + DonutChart + shared Header/Footer (3.3.1)`
- **Output**:
  - `components/markets/charts/DonutChart.tsx` — SVG puro (no librerie): arco stroke-dasharray con rotazione -90°, percentuale centrata, label Yes/No, colori via CSS vars (--color-success/>0.5, --color-danger/<0.5), no animazioni
  - `components/markets/EventCardHeader.tsx` — immagine rotonda 40px con fallback iniziale, titolo 2-righe clamp, tag separati da ·, badge LIVE/HOT/NEW, bookmark Lucide con stopPropagation
  - `components/markets/EventCardFooter.tsx` — formatVolume ($X.XB/$X.XM/$X.XK/$X), formatEndDate (Today/Tomorrow/in N days/MMM D YYYY), bottone [+ Slip] con icon Plus
  - `components/markets/cards/BinaryCard.tsx` — usa EventCardHeader + DonutChart + EventCardFooter; bottoni Yes/No con colori success/danger, onAddToSlip con stopPropagation
  - `components/markets/EventCard.tsx` — container Link → /event/[slug]; switcha su event.kind: binary → BinaryCard, altri 4 → PlaceholderCard "coming soon"
  - `app/page.tsx` — Server Component: fetchFeaturedEvents(12) → mapGammaEvent → griglia EventCard responsive (auto-fill minmax 300px)
- **Acceptance criteria**: `npm run validate` ✅, `npm run build` ✅, griglia live con dati reali Polymarket, card binary con DonutChart + Yes/No reali, placeholder per non-binary, click card → /event/[slug] (404 ok), bookmark stopPropagation ✅
- **Note**: `app/page.tsx` è smoke test che diventa base reale in Sprint 3.4.1 (Home layout completo con hero, sidebar, filtri, CryptoLiveRail). Sprint 3.2.3/3.2.4 (WebSocket) rinviati — binary/multi/h2h funzionano con prezzi statici API (30s revalidate).
- **PR**: N/A

### ✅ Sprint 3.2.2 — classifyEvent → 5 CardKind

- **Chiuso**: 2026-04-26
- **Note**: implementato dentro Sprint 3.2.1 (mappers.ts). `classifyEvent`, `CardKind`, `AuktoraEvent`, `AuktoraMarket` già presenti e testati (12 test mappers). Sprint 3.2.2 marcato completato per definizione.
- **PR**: N/A

### ✅ Sprint 3.2.1 — Polymarket Gamma API client

- **Chiuso**: 2026-04-26
- **Commit**: `4035f1c` — 7 file, +951 righe
- **Output**:
  - `lib/polymarket/types.ts` — GammaEvent, GammaMarket, GammTag, GammaSeries, GammaEventsParams
  - `lib/polymarket/client.ts` — `gammaGet` con timeout 8s, MAX_RETRIES=2, GammaApiError, no-retry su 4xx
  - `lib/polymarket/queries.ts` — fetchEvents, fetchEventBySlug, fetchEventById, fetchFeaturedEvents, searchEvents (revalidate 15-60s)
  - `lib/polymarket/mappers.ts` — CardKind, AuktoraMarket, AuktoraEvent, classifyEvent, mapGammaMarket, mapGammaEvent, safeParseJsonArray
  - `lib/polymarket/__tests__/client.test.ts` — 5 test
  - `lib/polymarket/__tests__/mappers.test.ts` — 12 test (5 CardKind + parsing + edge cases)
  - 38 test totali in 9 file, `npm run validate` exit 0, `npm run build` exit 0
- **Smoke test live**: `fetchFeaturedEvents(3)` → 3 eventi reali, primo titolo "2026 NBA Champion" ✅
- **Decisioni**: `safeParseJsonArray` per outcomes/outcomePrices/clobTokenIds (stringhe JSON nella API); retry logic 3 tentativi totali; type cast `ParamRecord` per compatibilità TypeScript
- **PR**: N/A

### ✅ Fix tema dark/light + rename Auktora + icone (Cowork, fuori-sprint)

- **Chiuso**: 2026-04-26
- **Eseguito da**: Cowork (modifiche dirette ai file)
- **Output**:
  - `app/globals.css` — fix tema: aggiunto `html[data-theme='dark']` con tutti i colori dark + `!important` per battere `prefers-color-scheme: light` del browser di sistema. `html[data-theme='light']` già presente. Causa root: Tailwind 4 compila `@theme` in `@layer base (:root)` — stesso livello specificità del media query di sistema → source order determinava il vincitore → light mode di sistema batteva il toggle manuale.
  - `components/layout/header/RealDemoToggle.tsx` — icona `Zap` → `Banknote` (REAL) / `Coins` (DEMO)
  - `components/layout/BottomNav.tsx` — icona `ShoppingCart` → `Ticket` (schedina)
  - Rename Predimark → Auktora in: `README.md`, `app/page.tsx`, `app/test-design-system/page.tsx`, `app/globals.css` (commenti), `components/layout/Footer.tsx`, `lib/stores/themeStore.ts` (localStorage key `auktora-theme`), `AGENTS.md`
- **PR**: N/A

### ✅ Sprint 3.1.3 — Footer minimal

- **Chiuso**: 2026-04-26
- **Commit**: `a654918`
- **Output**: `components/layout/Footer.tsx` (107 righe) — link Privacy/Terms/Help/About, disclaimer, lingua placeholder, copyright dinamico. Visibile solo desktop (`hidden md:block`). Inserito in `<main>` con `marginTop: auto`. `app/layout.tsx` aggiornato con `display: flex; flexDirection: column` su `<main>`.
- **PR**: N/A

### ✅ Sprint 3.1.2 — BottomNav mobile completo

- **Chiuso**: 2026-04-26
- **Verificato da**: Cowork (analisi Doc 4 + file reali)
- **Output**: BottomNav già completo da Sprint 3.1.1 + post-sprint fixes — 5 voci (Home, Search, Signals, Slip, More), active state, More sheet con contenuto esatto Doc 4, PWA in-flow
- **Deferred**: badge numerico su Slip (`[🛒3]` da Doc 4) richiede `slipStore` Zustand → rinviato al primo sprint MA4 trading
- **PR**: N/A

### ✅ Sprint 3.1.1-R — Header split in sub-componenti

- **Chiuso**: 2026-04-26
- **Verificato da**: Claude in VS Code (acceptance criteria auto-verificati)
- **Commit**: `b31241a` — 12 file, +841/-573
- **Output**:
  - `Header.tsx` ridotto a orchestratore da 68 righe (era 611)
  - `header/DesktopNav.tsx` — 37 righe
  - `header/DesktopSearch.tsx` — 29 righe
  - `header/MobileDrawer.tsx` — 132 righe
  - `header/ProfileDropdown.tsx` — 136 righe
  - `header/RealDemoToggle.tsx` — 38 righe
  - `header/HeaderActions.tsx` — 188 righe (aggiunto rispetto al prompt: wrapper barra destra, necessario per rispettare limite 90 righe su Header.tsx)
  - `header/styles.ts` — 39 righe (CSSProperties condivisi)
  - `header/nav-links.ts` — 7 righe (NAV_LINKS array)
  - 21 test passati, `npm run validate` exit 0, `npm run build` exit 0
- **Deviazione motivata**: prompt prevedeva 5 sub-componenti, Claude in VS Code ne ha estratti 7 + 2 file costanti. Tutti e 5 i componenti del prompt presenti; i 2 aggiuntivi (HeaderActions, styles/nav-links) migliorano separazione e rispettano il vincolo righe.
- **Zero modifiche funzionali** — comportamento identico, zero `display` inline su elementi responsive
- **PR**: N/A

### ✅ Decisioni architetturali — file split obbligatori (Cowork, fuori-sprint)

- **Chiuso**: 2026-04-26
- **Eseguito da**: Cowork (decisione architetturale + aggiornamento docs)
- **Motivazione**: `Header.tsx` già a 611 righe allo sprint 3.1.1. La roadmap prevede componenti ben più complessi (event page con 5 layout, TradeWidget con EIP-712, admin panel). Senza regole esplicite Claude in VS Code scrive file monolitici → refactor doloroso a metà progetto.
- **Output**:
  - `AGENTS.md` aggiornato con sezione "Regole architetturali" che include:
    - Limite 300 righe per componenti React, 150 per hook, 100 per route handler
    - Regola critica inline style vs Tailwind visibility classes (causa bug responsive già trovata)
    - Split obbligatori documentati per: Header, Event page, TradeWidget, Admin panel
    - Pattern generale: page route max 80 righe JSX, resto in componenti feature
  - `docs/PROMPT-SPRINT-3.1.1-R.md` — prompt pronto per Claude in VS Code per refactor Header
- **Sprint da eseguire prima di 3.1.2**: Sprint 3.1.1-R (Header split) — zero nuove funzionalità, solo spostamento codice
- **Strutture target documentate in AGENTS.md**:
  - `components/layout/header/`: DesktopNav, DesktopSearch, MobileDrawer, ProfileDropdown, RealDemoToggle
  - `app/event/[slug]/page.tsx` max 80 righe → layouts in `components/events/layouts/`
  - `components/trade/trade/`: MarketTab, LimitTab, TradeConfirmModal, SignalBanner
- **PR**: N/A

### ✅ Fix post-sprint 3.1.1 — PWA app shell + BottomNav desktop visibility + REAL/DEMO layout (Cowork)

- **Chiuso**: 2026-04-26
- **Eseguito da**: Cowork (modifiche dirette ai file)
- **Output**:
  - **`app/layout.tsx`** — ristrutturato come PWA app shell: `html+body overflow:hidden`, solo `<main>` scrolla, Header e BottomNav in flex flow (no `position: fixed`). Fix iOS Safari: `-webkit-fill-available` su html e body. `overscrollBehavior: 'contain'` su main per Chrome Android.
  - **`app/globals.css`** — aggiunto: `html { height: 100%; height: -webkit-fill-available }`, `body { overflow: hidden; height: 100%; height: -webkit-fill-available }`, `[data-theme='light']` block (manuale toggle via Zustand), `.no-animations` class
  - **`components/layout/BottomNav.tsx`** — rimosso `position: fixed`, aggiunto `flexShrink: 0` (in-flow PWA). Bottom sheet "More" implementato con contenuto esatto Doc 4 (MORE_ITEMS_AUTHENTICATED: Profile, Watchlist, Following, Sessions, Achievements, Settings, Classifica, Creator program, About, Pricing, Help, Legal; MORE_ITEMS_GUEST: sottoinsieme + CTA "Accedi/Registrati"). Fix visibilità desktop: `className="flex md:hidden"` — `display: flex` inline override rimosso.
  - **`components/layout/Header.tsx`** — fix REAL/DEMO layout shift: `width: '70px'; justifyContent: 'center'` (larghezza fissa per entrambi gli stati). Header `flexShrink: 0; position: relative` (no sticky — è fuori dal container che scrolla). Responsive breakpoints: Portfolio/Cash `lg:flex` (1024px+), Deposit/theme/gift `md:flex` (768px+), REAL/DEMO solo authenticated.
- **Causa root BottomNav trembling**: `position: fixed` in un contesto PWA dove html/body non scrollano genera jank su GPU composite layer. Fix definitivo: in-flow flex.
- **Causa root BottomNav su desktop**: `style={{ display: 'flex' }}` inline sovrascriveva `md:hidden` (specificità inline > classi). Fix: `display` rimosso dall'inline, aggiunto `flex` al className.
- **Note**: Commit da fare con tutte le modifiche di questa sessione.
- **PR**: N/A

### ✅ Sprint 3.1.1 — Root layout + Header globale + BottomNav stub — MA3 INIZIATA

- **Chiuso**: 2026-04-26
- **Verificato da**: Cowork (file letti direttamente + commit confermato)
- **Output**:
  - `providers/ReactQueryProvider.tsx` — TanStack Query client con `staleTime: 30s, gcTime: 5min, retry: 1, refetchOnWindowFocus: false`
  - `lib/stores/themeStore.ts` — Zustand persist store con `isDark`, `animationsEnabled`, toggle actions, persisted in localStorage come `predimark-theme`
  - `providers/ThemeProvider.tsx` — legge store Zustand, setta `data-theme` attribute su `document.documentElement`, sync con `useEffect`
  - `components/layout/Header.tsx` — header completo desktop+mobile: logo Auktora, portfolio/cash (lg+), deposit (md+), theme toggle (md+), gift (md+), REAL/DEMO (authenticated), avatar+dropdown (authenticated), hamburger (mobile)
  - `components/layout/BottomNav.tsx` — stub con 4 voci principali (Home, Search, Signals, Slip) + More button
  - `app/layout.tsx` — provider chain `ReactQueryProvider > PrivyProvider > ThemeProvider`, app shell div flex column
  - 21 test passati in 7 file, `npm run build` exit 0
  - Commit `770db31` pushato su `main`
- **Note**: post-sprint fixes applicati da Cowork (vedi entry sopra) — PWA restructure, REAL/DEMO, More menu contenuto Doc 4, fix desktop visibility
- **PR**: N/A

### ✅ Sprint 2.6.2 — useSession hook + /test-signup E2E page — MA2 CHIUSA

- **Chiuso**: 2026-04-26
- **Verificato da**: Cowork (file letti direttamente + output browser confermato)
- **Output**:
  - `lib/hooks/useSession.ts` — hook `useSession()` con `fetchSession()`, stati `idle/loading/ok/error`, chiama `POST /api/v1/auth/session` con JWT Privy da `getAccessToken()`
  - `app/test-signup/page.tsx` — pagina E2E con Step 1 (Privy login), Step 2 (chiama endpoint), risposta JSON, checklist MA2
  - `lib/hooks/__tests__/useSession.test.ts` — 4 test: idle, null-token, 200 ok, 401 error
  - 21 test totali passati in 7 file, `npm run build` exit 0
  - Commit `40f0517` pushato su `main`
- **Test manuale browser confermato** (risposta reale da `/test-signup`):
  ```json
  {
    "user": {
      "id": "c624e595-9e95-4b0b-a986-ca7c51c53ad9",
      "wallet_address": "0xAad9F27d3F2e57a2F2685d48A0e9d75dA4Fb0475",
      "username": null,
      "email": "felicianociccarelli1983@gmail.com",
      "country_code": null,
      "geo_block_status": "allowed",
      "language": "en",
      "onboarding_completed": false
    },
    "session": { "expires_at": "2026-05-03T16:57:32.928Z" }
  }
  ```
- **Note**:
  - `country_code: null` in dev (nessun header `cf-ipcountry` in locale) — comportamento corretto, fallback `'allowed'`
  - RLS recursion ancora segnalata da Claude in VS Code come "pendente" — **già risolta**: Migration 013 SECURITY DEFINER applicata su staging e production. `createAdminClient` bypassa RLS in ogni caso.
- **PR**: N/A

---

### ✅ Sprint 2.6.1 — POST /api/v1/auth/session — Privy JWT + geo-block + upsert user

- **Chiuso**: 2026-04-26
- **Verificato da**: Cowork (file letti direttamente)
- **Output**:
  - `@privy-io/server-auth@1.32.5` installato
  - `lib/privy/server.ts` — singleton `PrivyClient`, `verifyPrivyToken()`, `getPrivyUser()`
  - `lib/geo/resolveGeoBlock.ts` — `cf-ipcountry`/`x-vercel-ip-country` header → lookup `geo_blocks` → `allowed`/`demo_only`/`blocked`
  - `app/api/v1/auth/session/route.ts` — handler `POST` con 401/403/500 handling
  - 4 nuovi test (auth_missing, auth_invalid, geo_blocked, 200 ok)
  - 17 test totali passati in 6 file, `npm run build` exit 0, `npm run validate` exit 0
  - Commit `527faea` (database.types.ts 39 tabelle, --no-verify) + `1283bab` (sprint 2.6.1) pushati su `main`
- **Intoppi risolti da Claude in VS Code**:
  - `next dev` rimasto in background da sessione precedente teneva risorse: killato → typecheck tornato funzionante
  - `node_modules` corrotto dopo installazioni multiple (stesso pattern commander): `rm -rf node_modules package-lock.json && npm install` → risolto
- **Note**:
  - RLS recursion segnalata da Claude in VS Code come "ancora pendente" — **in realtà già risolta**: Migration 013 applicata da Cowork su staging e production nella stessa giornata (vedi entry sotto). L'endpoint usa `createAdminClient` (bypass RLS) quindi non è impattato in ogni caso.
  - Due flussi sync coesistono deliberatamente: `syncUserToSupabase` (Server Action, client-side login) + `/api/v1/auth/session` (API endpoint, JWT verification completa)
- **PR**: N/A

### ✅ Fix Vercel Production Env Vars (fuori-sprint, post MA1)

- **Chiuso**: 2026-04-26
- **Eseguito da**: Claude in VS Code via Vercel CLI
- **Output**:
  - Rimosse: `NEXT_PUBLIC_SUPABASE_URL_STAGING`, `NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING` da Production
  - Aggiunte su Production: `NEXT_PUBLIC_SUPABASE_URL` (→ vlrvixndaeqcxftovzmw), `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PRIVY_APP_SECRET`, `NEXT_PUBLIC_APP_URL` (→ auktora.com)
  - Commit `42c9d99` (empty) pushato → Vercel auto-deploy su `main`
- **Env vars Production finali** (da `vercel env ls production`):
  - `NEXT_PUBLIC_SUPABASE_URL` ✅ production
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅ production
  - `SUPABASE_SERVICE_ROLE_KEY` ✅ production
  - `PRIVY_APP_SECRET` ✅ production
  - `NEXT_PUBLIC_APP_URL` ✅ production
  - `NEXT_PUBLIC_PRIVY_APP_ID` ✅ production+preview
- **Incidente**: `commander v14.0.3` (dep transitiva di lint-staged) era corrotta in `node_modules` — probabilmente da scrittura concorrente durante `npx vercel` + `npm install` paralleli. Fix: `rm -rf node_modules/commander && npm install commander && npm uninstall commander`. `package.json` tornato pulito (zero diff vs HEAD).
- **PR**: N/A

### ✅ Sprint 1.4.3 — TypeScript types Supabase + clienti tipati

- **Chiuso**: 2026-04-26
- **Verificato da**: Cowork (file letti direttamente + commit confermato)
- **Output**:
  - `lib/supabase/database.types.ts` — tipo `Database` con `users` (24 colonne) + `achievements` + helpers `Tables/TablesInsert/TablesUpdate/Enums/Constants`
  - `lib/supabase/client.ts` — `createBrowserClient<Database>`
  - `lib/supabase/server.ts` — `createServerClient<Database>`
  - `lib/supabase/admin.ts` — `createClient<Database>`
  - `lib/actions/syncUser.ts` — payload usa `TablesInsert<'users'>` (zero `any` impliciti)
  - `package.json` — script `types:gen` aggiunto
  - 13 test passati, `npm run build` exit 0 (5 route static), `npm run validate` exit 0
  - Commit `e8d1af3` pushato su `main` (8 file, +821/-19)
- **Deviazioni dal prompt**:
  - `npx supabase gen types` richiede `supabase login` interattivo (non eseguibile da Claude in VS Code senza token). Usato fallback strutturale dal prompt che mappa `users` (24 col) + `achievements`. Corretto e atteso.
- **Note**:
  - I tipi coprono solo `users` e `achievements`. Per MA2 con tabelle `markets`, `positions`, `trades` ecc. servirà rigenerare: `npx supabase login` (una tantum, browser) → `npm run types:gen`
  - Vercel env vars (Step 7): da verificare manualmente su dashboard — Vercel MCP non supporta account personali (richiede team Pro)
- **PR**: N/A

### ✅ Sprint 1.3.2 — Privy ↔ Supabase sync — upsert users al login

- **Chiuso**: 2026-04-26
- **Verificato da**: Cowork (file letti + riga DB confermata via SQL)
- **Output**:
  - `lib/actions/syncUser.ts` — Server Action `'use server'` con `syncUserToSupabase()`, upsert su `public.users` via `createAdminClient`, conflict su `privy_did`
  - `lib/hooks/useAuth.ts` — sync automatico al login (useRef `hasSynced` per evitare doppi sync, reset al logout)
  - `app/test-auth/page.tsx` — bottone sync manuale + stato sync visibile inline
  - `lib/actions/__tests__/syncUser.test.ts` — 2 test con mock `createAdminClient`
  - 13 test passati, `npm run build` exit 0 (5 route static), `npm run validate` exit 0
  - Commit `750d46b` pushato su `main`
- **Deviazioni dal prompt**:
  - Privy v3 ha rimosso `user.email.verified` dal tipo `Email` → usato `Boolean(user.email?.address)` come equivalente (Privy verifica email via OTP prima di associarla)
  - Bottone Login: `color: 'white'` invece di `#000` (contrasto migliore su `--color-cta` blu)
  - Border: `var(--color-border-default)` invece di `var(--color-border)` (token reale)
- **Verifica DB (staging)**:
  - Riga creata in `public.users`: `id = c624e595-9e95-4b0b-a986-ca7c51c53ad9`
  - `privy_did = did:privy:cmofskhdp015h0dle1h1r9ely` ✅
  - `email = felicianociccarelli1983@gmail.com` ✅
  - `wallet_address = 0xAad9F27d3F2e57a2F2685d48A0e9d75dA4Fb0475` ✅
  - `last_login_at` popolato ✅
- **Note**:
  - `email_verified = false` nel DB: il bottone sync manuale su `/test-auth` non passa `emailVerified`, sovrascrive il `true` dell'auto-sync. Non è un bug di produzione — l'auto-sync di `useAuth` manda `emailVerified: true`. Da correggere solo se il test-page viene riusato.
  - Migration 014 applicata da Cowork prima del sprint: aggiunto `privy_did TEXT UNIQUE`, `auth_id` reso nullable, `wallet_address` reso nullable
- **PR**: N/A

### ✅ Sprint 1.4.2 — Setup Supabase client browser + server + admin

- **Chiuso**: 2026-04-26
- **Verificato da**: Cowork (file letti direttamente)
- **Output**:
  - `@supabase/supabase-js@2.104.1` + `@supabase/ssr@0.10.2` installati
  - `lib/supabase/client.ts` — browser client via `createBrowserClient`
  - `lib/supabase/server.ts` — server client con cookie handling (Next.js App Router)
  - `lib/supabase/admin.ts` — service_role client per bypass RLS
  - `lib/supabase/index.ts` — barrel export solo client browser (server/admin esclusi per Turbopack)
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
  - `lib/supabase/__tests__/client.test.ts` — 2 test env vars
  - `app/test-supabase/page.tsx` — pagina verifica connessione live
  - 11/11 test passati, `npm run build` exit 0 (5 route static), `npm run validate` exit 0
  - Commit `9ee3515` pushato su `main`
- **Deviazioni dal prompt**:
  - `lib/supabase/index.ts` non re-esporta `server.ts`/`admin.ts` (Turbopack bundla `next/headers` lato client → build fail)
  - `vitest.config.ts`: aggiunto `loadEnv(mode, cwd, '')` per popolare `process.env` nei test
- **Note**:
  - `/test-supabase` mostra connessione ok ma query `achievements` falliva per bug RLS (infinite recursion `42P17`)
  - **Bug RLS fixato da Cowork** (vedi entry sotto — migration 013)
- **PR**: N/A

### ✅ DB Fix — Migration 013: fix RLS infinite recursion admin_users (fuori-sprint, Cowork)

- **Chiuso**: 2026-04-26
- **Eseguito da**: Cowork direttamente via Supabase MCP
- **Output**:
  - Creata `public.get_admin_role(uid uuid)` — `SECURITY DEFINER` function che legge `admin_users` bypassando RLS
  - Riscritta la policy self-referenziale su `admin_users` stessa
  - Riscritte 16 policy su 15 tabelle che referenziavano `admin_users` direttamente
  - Applicata su staging (`hhuwxcijarcyivwzpqfp`) e production (`vlrvixndaeqcxftovzmw`)
  - Verifica: `SELECT id, name FROM achievements LIMIT 3` → 3 risultati su entrambi i DB
- **Causa root**: le policy su tutte le tabelle facevano `SELECT role FROM admin_users` → la policy di `admin_users` stessa interrogava di nuovo `admin_users` → ricorsione infinita (Postgres error `42P17`)
- **Fix**: `SECURITY DEFINER` bypassa RLS quando la funzione legge `admin_users`, spezzando il ciclo
- **PR**: N/A

### ✅ Sprint 1.4.1 — Configurazione Vercel — vercel.json + metadata produzione

- **Chiuso**: 2026-04-26
- **Verificato da**: Cowork (file letti direttamente)
- **Output**:
  - `vercel.json` con security headers (X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
  - `app/layout.tsx` con metadata produzione: `title.template '%s | Auktora'`, metadataBase, OpenGraph, Twitter card, `robots: noindex/nofollow`
  - `NEXT_PUBLIC_APP_URL` aggiunto a `.env.local` (localhost:3001) e `.env.example` (auktora.com)
  - `npm run build` exit 0, 4 route static prerendered
  - Commit `2098925` pushato su `main`, deploy Vercel automatico attivato
- **Note**: CSP (Content-Security-Policy) deferito a MA8 — bloccherebbe Privy/Supabase. `robots: noindex` da abilitare in MA8 pre-launch.
- **PR**: N/A

### ✅ Sprint 1.3.1 — Setup Privy — PrivyProvider + wallet auth base

- **Chiuso**: 2026-04-26
- **Verificato da**: Cowork (file letti direttamente)
- **Output**:
  - `@privy-io/react-auth@3.22.2` installato
  - `providers/PrivyProvider.tsx` con `loginMethods: ['email', 'wallet']`, theme dark, accent `#00E5FF`
  - `app/layout.tsx` wrappa con `<PrivyProvider>`
  - `lib/hooks/useAuth.ts` con interfaccia `AuthUser` e hook `useAuth`
  - `app/test-auth/page.tsx` pagina verifica manuale
  - `lib/hooks/__tests__/useAuth.test.ts` 2 test
  - 9 test totali passati, `npm run validate` exit 0
  - Commit `ff91b49` pushato su `main`
- **Note**:
  - Privy v3 API breaking change: `embeddedWallets.createOnLogin` → `embeddedWallets.ethereum.createOnLogin` — corretta da Claude in VS Code
  - `module` → `mod` in test per ESLint `@next/next/no-assign-module-variable` — corretta da Claude in VS Code
  - Fix post-verifica browser (commit `a489f41`): rimosso `logo: '/logo.png'` (404), sostituito `var(--color-brand-primary)` con `var(--color-cta)` (token inesistente), aggiunto pannello debug e bottone disabled pre-ready
  - **`--color-brand-primary` NON esiste nel design system** — usare `--color-cta` per il colore primario CTA
  - Verifica E2E browser completata: login email+OTP ✅, embedded wallet ETH creato ✅ (`0xAad9F27d3F2e57a2F2685d48A0e9d75dA4Fb0475`), DID Privy: `did:privy:cmofskhdp015h0dle1h1r9ely`
- **PR**: N/A

### ✅ Sprint 1.5.3 — Docs in cartella progetto + README

- **Chiuso**: 2026-04-26
- **Verificato da**: Cowork (file letti direttamente)
- **Output**:
  - `README.md` riscritto (era template `create-next-app`) con stack, comandi, struttura cartelle, env setup, note
  - `docs/ARCHITECTURE.md` creato con tabella stack, struttura cartelle, info DB Supabase, roadmap MA1-MA8
  - `AGENTS.md` aggiornato — mantenuto blocco `<!-- BEGIN:nextjs-agent-rules -->` (Next.js 16 breaking changes) + aggiunte regole Predimark V2 (regole generali, comandi, conventions)
  - Commit `7384a00` pushato su `main`
- **Note**: Claude in VS Code ha correttamente preservato il blocco auto-generato `BEGIN:nextjs-agent-rules` in cima ad `AGENTS.md` invece di sovrascriverlo — importante per orientare agenti AI sui breaking changes di Next.js 16
- **PR**: N/A

### ✅ Sprint 1.5.2 — Vitest + React Testing Library

- **Chiuso**: 2026-04-26
- **Verificato da**: Cowork (file letti direttamente)
- **Output**:
  - Vitest 4.x con jsdom environment, `globals: true`
  - React Testing Library + jest-dom matchers
  - `vitest.config.ts` con alias `@/*` e coverage v8
  - `vitest.setup.ts` con triple-slash reference `/// <reference types="vitest/globals" />` + `@testing-library/jest-dom`
  - `lib/__tests__/utils.test.ts`: 3 test su `formatUSDC`
  - `components/__tests__/Badge.test.tsx`: 4 test su componente Badge inline
  - Script npm: `test`, `test:watch`, `test:ui`, `test:coverage`
  - `validate` aggiornato: `typecheck && lint && test`
  - Commit `de164f0` pushato su `main`
- **Note**: Claude in VS Code ha usato `/// <reference types="vitest/globals" />` invece di aggiungere `vitest/globals` a `tsconfig.json.compilerOptions.types` — scelta corretta, evita di disabilitare l'auto-discovery dei `@types/*` che romperebbe Next.js
- **PR**: N/A

### ✅ Sprint 1.5.1 — ESLint + Prettier + Husky pre-commit

- **Chiuso**: 2026-04-26
- **Verificato da**: Cowork (file letti direttamente)
- **Output**:
  - ESLint flat config nativa (`defineConfig`) con next/core-web-vitals + typescript + prettier
  - Regole custom: `no-explicit-any: error`, `no-unused-vars: error` (con `^_` ignore pattern)
  - Prettier: `singleQuote`, no `semi`, `trailingComma: es5`, `printWidth: 100`
  - Husky 9.x pre-commit con lint-staged (ts/tsx: eslint+prettier / json,md,css: prettier)
  - Script npm: `lint`, `lint:fix`, `format`, `format:check`, `typecheck`, `validate`
  - Commit `1261883` pushato su `main`
- **Note**: FlatCompat sostituito con `defineConfig` nativo — meglio, meno deps. Pre-commit testato e funzionante (blocca `any` esplicito).
- **PR**: N/A

### ✅ Sprint 1.1.3 — Setup design tokens globals.css completi

- **Chiuso**: 2026-04-26
- **Verificato da**: Cowork (file letti direttamente)
- **Output**:
  - `app/globals.css` con tutti i design token Doc 8 (colori dark/light, tipografia, spacing, radius, shadows, z-index, transizioni, breakpoints)
  - Light mode via `@media (prefers-color-scheme: light)`
  - Inter Variable via `next/font/google`
  - Animazioni: pulse-live, shimmer, flash-up/down, hover-lift
  - Test page `/test-design-system` con palette, tipografia, border radius, badge semantici
  - Commit `88cac28` pushato su `main`
- **Note**: verifica visiva light mode demandata a Feliciano (Claude in VS Code non ha browser interattivo)
- **PR**: N/A

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

| MA  | Nome                          | Sprint completati | Sprint totali | Status                                        |
| --- | ----------------------------- | ----------------- | ------------- | --------------------------------------------- |
| MA1 | Foundation & Setup            | 12                | 12            | ✅ Completata                                 |
| MA2 | Database & Auth               | 1 (su 2 rimasti)  | 11            | 🔶 DB anticipato da Cowork, Step 2.6 in corso |
| MA3 | Core Pages                    | 1                 | 14            | 🔵 In corso — Sprint 3.1.1 completato         |
| MA4 | Trading Core                  | 0                 | 12            | ⚪ Non iniziata                               |
| MA5 | User Profile & Demo           | 0                 | 9             | ⚪ Non iniziata                               |
| MA6 | Creator Program & Leaderboard | 0                 | 11            | ⚪ Non iniziata                               |
| MA7 | Admin Panel                   | 0                 | 13            | ⚪ Non iniziata                               |
| MA8 | Polish, Testing, Launch       | 0                 | 10            | ⚪ Non iniziata                               |

**Totale sprint**: 18 / 92

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

_File mantenuto da Cowork. Feliciano e Claude in VS Code possono leggerlo ma di norma solo Cowork lo scrive._
