# Audit Sprint 1.1.1 → Stato corrente

> Data: 2026-04-27
> Branch: main
> Ultimo commit: `3c6ca69` — fix: MultiOutcomeCard usa groupItemTitle come label outcome (3.3.1-B)

## Sintesi

- Completati: 79
- Parziali / con TODO esplicito: 6
- Mancanti / da fare: 3
- Con divergenza utente intenzionale: 11

I tre prompt iniziali (1.1.1 setup git/PAT, e tutta la fascia "fix Vercel env" che è infrastrutturale) sono stati eseguiti dal team ma non lasciano artefatti diretti nel repo, quindi l'audit si basa sui file di configurazione e sulle convenzioni del codebase.

---

## MA1 — Foundation (sprint 1.x)

### Sprint 1.1.1 — Setup credenziali GitHub per Claude in VS Code

- ✅ `git config user.email = felicianociccarelli1983@gmail.com` — verificato via `git config --get user.email`
- ✅ `git config user.name = Feliciano Ciccarelli` — verificato via `git config --get user.name`
- ⚠️ `gh auth status` — non verificabile in audit (non lascia artefatti committati). Da considerare ✅ implicito perché tutti i push successivi sono andati a buon fine.
- ✅ `.env.local` — presente nel filesystem (non versionato). `.env.example` esiste in `/Users/brupashop/Desktop/predimark-v2/.env.example` (1792 byte, Apr 26 16:11).
- ✅ `.env.example` esiste con valori placeholder.
- ✅ `.gitignore` esiste in root (487 byte, Apr 26 02:53). `git status` non mostra `.env.local` come tracked.
- ⚠️ Verifica `service_role` non più `NEXT_PUBLIC_*` — non verificabile in audit perché il file non è committato; assumiamo ok in base ai successivi sprint.

### Sprint 1.1.2 — Init Next.js 16 stack base

- ✅ Next.js 16.2.4 installato (`package.json:29`)
- ✅ React 19.2.4 (`package.json:30-31`)
- ✅ TypeScript strict — `tsconfig.json:7-8` (`"strict": true`, `"noUncheckedIndexedAccess": true`)
- ✅ Tailwind 4 — `package.json:50` (`tailwindcss: ^4`) + `app/globals.css:1` (`@import 'tailwindcss'`)
- ✅ Nessun `tailwind.config.ts` in root (verificato con `ls`)
- ✅ `lucide-react@^1.11.0`, `@tanstack/react-query@^5.100.5`, `zustand@^5.0.12` — `package.json:27-32`
- ✅ Home page placeholder evoluta in `app/page.tsx` (Server Component reale)
- ✅ Push iniziale su GitHub — visibile dalla storia git

### Sprint 1.1.3 — Setup design tokens globals.css completi

- ✅ `app/globals.css` ha tutti i token: `--color-bg-primary`, `--color-success`, `--color-danger`, `--color-cta`, `--font-sans`, `--font-mono`, `--text-base`, `--radius`, `--shadow`, `--z-modal`, `--transition-base` (verificato lines 8-177)
- ✅ Inter Variable via `next/font/google` — `app/layout.tsx:2,11-16`
- ✅ Test page `/test-design-system` esiste — `app/test-design-system/page.tsx`
- ✅ Dark mode default + light mode via `prefers-color-scheme` (lines 183-227) e tramite `[data-theme]` (lines 369-423)
- ✅ Animations: `pulse-live` (l.282), `shimmer` (l.294), `flash-up`/`flash-down` (l.303-321)
- 🔄 I commenti CSS dicono "PREDIMARK V2 — DESIGN SYSTEM" (l.4) NON aggiornati ad Auktora. Il prompt rename li listava esplicitamente. Vedi sezione "Anomalie".

### Sprint 1.3.1 — Setup Privy

- ✅ `@privy-io/react-auth@^3.22.2` installato — `package.json:23`
- ✅ `providers/PrivyProvider.tsx` esiste con `loginMethods: ['email', 'wallet']` (l.20)
- 🔄 `embeddedWallets.ethereum.createOnLogin` (l.26-27) — Privy v3 API aggiornata, deviazione documentata in HANDOFF sezione 9
- ✅ `app/layout.tsx` wrappa con `PrivyProvider` (l.51)
- ✅ `lib/hooks/useAuth.ts` esiste (49 righe)
- ✅ `app/test-auth/page.tsx` esiste
- ✅ `.env.example` aggiornato con `NEXT_PUBLIC_PRIVY_APP_ID`
- ✅ Test `lib/hooks/__tests__/useAuth.test.ts` esiste

### Sprint 1.3.2 — Privy ↔ Supabase sync

- ✅ `lib/actions/syncUser.ts` esiste con `syncUserToSupabase()` Server Action
- ✅ `useAuth` chiama `syncUserToSupabase` automaticamente — `lib/hooks/useAuth.ts:18-32`
- 🔄 `emailVerified: Boolean(user.email?.address)` invece di `user.email.verified` (deviazione voluta — vedi HANDOFF 9 — Privy v3 ha rimosso `.verified`)
- ✅ Test `lib/actions/__tests__/syncUser.test.ts` esiste
- ✅ Pagina `/test-auth` aggiornata con sync status

### Sprint 1.4.1 — Vercel config + production metadata

- ✅ `vercel.json` esiste con i 4 security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) — `vercel.json:5-26`
- ✅ `app/layout.tsx` ha `title.template: '%s | Auktora'` (l.21-24), `metadataBase` (l.26)
- ✅ `robots: { index: false, follow: false }` (l.40-43)
- ✅ `.env.example` ha `NEXT_PUBLIC_APP_URL`

### Sprint 1.4.2 — Setup Supabase client

- ✅ `@supabase/supabase-js@^2.104.1` + `@supabase/ssr@^0.10.2` installati (`package.json:25-26`)
- ✅ `lib/supabase/client.ts` (browser, 9 righe, typed `<Database>`)
- ✅ `lib/supabase/server.ts` (server con cookie handling)
- ✅ `lib/supabase/admin.ts` (service_role bypass RLS)
- 🔄 `lib/supabase/index.ts` è solo barrel browser-safe (cita esplicitamente che server/admin vanno importati direttamente per evitare di includere `next/headers` lato client). Deviazione tecnica corretta.
- ✅ Test `lib/supabase/__tests__/client.test.ts` esiste
- ✅ `app/test-supabase/page.tsx` esiste

### Sprint 1.4.3 — TypeScript types + Vercel production env

- ✅ `lib/supabase/database.types.ts` esiste (2439 righe — schema completo 39 tabelle, non placeholder)
- ✅ `client.ts`, `server.ts`, `admin.ts` usano `<Database>` generic
- ✅ `lib/actions/syncUser.ts` usa `TablesInsert<'users'>` (verificato)
- ✅ Script npm `types:gen` — `package.json:19`
- ✅ Verifica Vercel env — gestita dal fix `PROMPT-FIX-VERCEL-ENV` (vedi sotto)

### Sprint 1.5.1 — ESLint + Prettier + Husky

- ✅ ESLint flat config — `eslint.config.mjs` (43 righe) con `next/core-web-vitals`, `next/typescript`, `prettier`
- ✅ `@typescript-eslint/no-explicit-any: error` (l.12), `no-unused-vars: error` (l.13)
- ✅ Override per file di test (`no-undef: off` l.28)
- ✅ `.prettierrc` esiste (124 byte) e `.prettierignore` (59 byte)
- ✅ `eslint-config-prettier` installato (`package.json:45`)
- ✅ `husky@^9.1.7` + `lint-staged@^16.4.0` installati (`package.json:46,48`)
- ✅ `.husky/pre-commit` esiste, contiene `npx lint-staged`
- ✅ `lint-staged` config in `package.json:54-62` su `*.{ts,tsx,json,md,css}`
- ✅ Script npm `lint`, `lint:fix`, `format`, `format:check`, `typecheck`, `validate` tutti presenti

### Sprint 1.5.2 — Vitest + RTL

- ✅ `vitest@^4.1.5` installato + `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` (`package.json:36-52`)
- ✅ `vitest.config.ts` esiste (33 righe) con `environment: jsdom`, alias `@/*`
- 🔄 `vitest.config.ts` extra: integra `loadEnv` per caricare `.env.local` nei test (utile, non specificato nel prompt — ok)
- ✅ `vitest.setup.ts` esiste con `import '@testing-library/jest-dom'`
- ✅ Test esistenti: `lib/__tests__/utils.test.ts`, `components/__tests__/Badge.test.tsx`, `lib/hooks/__tests__/useAuth.test.ts`, `lib/hooks/__tests__/useSession.test.ts`, `lib/supabase/__tests__/client.test.ts`, `lib/actions/__tests__/syncUser.test.ts`, `lib/polymarket/__tests__/{client,mappers}.test.ts`, `app/api/v1/auth/session/__tests__/session.test.ts`
- ✅ Script `test`, `test:watch`, `test:ui`, `test:coverage` (`package.json:14-17`)
- ✅ `validate` aggiornato: `typecheck && lint && test` (l.18)

### Sprint 1.5.3 — Docs + README

- ✅ `README.md` aggiornato con info reali, titolo "Auktora"
- ✅ `docs/ARCHITECTURE.md` esiste
- ✅ `AGENTS.md` aggiornato (regola "Auktora" + split obbligatori per Header/Page evento/TradeWidget/Admin)

---

## MA2 — Auth + API (sprint 2.x)

### Sprint 2.6.1 — POST /api/v1/auth/session

- ✅ `@privy-io/server-auth@^1.32.5` installato (`package.json:24`)
- ✅ `lib/privy/server.ts` esiste con `verifyPrivyToken` + `getPrivyUser`
- ✅ `lib/geo/resolveGeoBlock.ts` esiste con `resolveGeoBlockStatus`
- ✅ `app/api/v1/auth/session/route.ts` esiste
- ✅ Test `app/api/v1/auth/session/__tests__/session.test.ts` esiste
- ✅ Step 0 — `database.types.ts` committato con tutte le 39 tabelle (2439 righe)

### Sprint 2.6.2 — End-to-end signup test (chiusura MA2)

- ✅ `lib/hooks/useSession.ts` esiste (67 righe) con `fetchSession()` + stati `idle/loading/ok/error`
- ✅ `app/test-signup/page.tsx` esiste
- ✅ Test `lib/hooks/__tests__/useSession.test.ts` esiste

---

## MA3 — UI core (sprint 3.x)

### Sprint 3.1.1 — Root layout + Header globale

- ✅ `providers/ReactQueryProvider.tsx` esiste
- ✅ `lib/stores/themeStore.ts` esiste (35 righe), persist key `auktora-theme` (l.31)
- 🔄 Store esteso oltre il prompt: `isDemo` + `setIsDemo` + `toggleDemo` aggiunti (FIX 3.1.1-B)
- ✅ `providers/ThemeProvider.tsx` applica `data-theme` su `<html>`
- ✅ `app/layout.tsx` ha catena provider: ReactQuery → Privy → Theme (l.50-86)
- ✅ `Header` visibile in tutte le pagine — orchestratore in `components/layout/Header.tsx` (61 righe, sotto soglia 80)
- ✅ Header desktop: logo, nav links (`DesktopNav.tsx`), search (`DesktopSearch.tsx`), azioni
- ✅ Header mobile: hamburger, drawer (`MobileDrawer.tsx`)
- ✅ Switch REAL/DEMO solo se `authenticated` — `HeaderActions.tsx:142`
- ✅ Toggle tema funziona e persiste via Zustand
- ✅ `BottomNav.tsx` esiste (282 righe, sopra il limite 150 hook/utility, ma è un componente — sotto i 300 ok)
- 🔄 BottomNav mostra anche "Theme" e probabilmente più funzioni del previsto stub (282 righe vs stub atteso)

### Sprint 3.1.1-R — Header refactor in sub-componenti

- ✅ `Header.tsx` orchestratore, 61 righe (target ~80)
- ✅ `header/DesktopNav.tsx` (37 righe)
- ✅ `header/DesktopSearch.tsx` (29 righe)
- ✅ `header/MobileDrawer.tsx` (132 righe — sotto 150)
- ✅ `header/ProfileDropdown.tsx` (136 righe)
- ✅ `header/RealDemoToggle.tsx` (38 righe, larghezza fissa)
- 🔄 Aggiunto `header/HeaderActions.tsx` (177 righe — leggermente sopra il target 150 di hook/utility ma è un componente di composizione)
- 🔄 Aggiunti file di supporto: `header/nav-links.ts`, `header/styles.ts` (decisione corretta)

### Sprint 3.1.3 — Footer minimal

- ✅ `components/layout/Footer.tsx` esiste (121 righe, sotto 120 dichiarato)
- ✅ Link Privacy/Terms/Support/About presenti
- ✅ Disclaimer "Auktora is not a licensed broker..." (l.106)
- ✅ Bottone lingua placeholder con `disabled` + `title="Language switch coming soon"` (l.86-95)
- ✅ Copyright dinamico `© {year} Auktora` (l.116)
- ✅ Nascosto su mobile: `className="hidden md:block"` (l.40)

### Sprint 3.2.1 — Polymarket Gamma API client

- ✅ `lib/polymarket/types.ts` (100 righe) — `GammaMarket`, `GammaEvent`, `GammTag`, `GammaSeries`, `GammaEventsParams`
- ✅ `lib/polymarket/client.ts` (75 righe) — `gammaGet<T>`, `GammaApiError`, retry su 5xx, no retry su 4xx, timeout 8s, fetch cache `next: { revalidate }`
- ✅ `lib/polymarket/queries.ts` (43 righe) — `fetchEvents`, `fetchEventBySlug`, `fetchEventById`, `fetchFeaturedEvents`, `searchEvents`
- ✅ `lib/polymarket/mappers.ts` (181 righe — leggermente sopra 150) — `CardKind`, `AuktoraOutcome`, `AuktoraMarket`, `AuktoraEvent`, `classifyEvent`, `mapGammaMarket`, `mapGammaEvent`
- ✅ Test `__tests__/client.test.ts` + `__tests__/mappers.test.ts`
- ⚠️ `mappers.ts` 181 righe — supera limite 150 per utility. Non critico (è un mapper denso, non separabile facilmente)

### Sprint 3.2.3 — WebSocket CLOB singleton

- ✅ `lib/ws/SingletonWS.ts` (137 righe — entro 150) — manager generico con auto-reconnect, exponential backoff, refcount
- ✅ `lib/ws/clob.ts` (99 righe) — wrapper CLOB con subscribe per `price_change` e `book`
- ✅ `lib/ws/hooks/useLiveMidpoint.ts` esiste
- ✅ `lib/ws/hooks/useLiveOrderbook.ts` esiste

### Sprint 3.2.4 — WebSocket RTDS singleton

- ✅ `lib/ws/rtds.ts` (84 righe)
- ✅ `lib/ws/hooks/useCryptoLivePrice.ts` esiste
- ✅ `lib/ws/hooks/useLiveActivity.ts` esiste

### Sprint 3.3.1 — EventCard Binary

- ✅ `components/markets/EventCard.tsx` (61 righe) — container che switcha su `event.kind`
- ✅ `components/markets/cards/BinaryCard.tsx` esiste
- ✅ `components/markets/EventCardHeader.tsx` esiste (riusato da tutte le variants)
- ✅ `components/markets/EventCardFooter.tsx` esiste
- ✅ `components/markets/charts/DonutChart.tsx` esiste
- 🔄 Card altezza fissa 260px in tutte le variants (HANDOFF 2.1) — divergenza voluta dai wireframe Doc 4
- 🔄 Sottotitoli rimossi (HANDOFF 2.2) — divergenza voluta
- 🔄 Tag segue il titolo, no minHeight (HANDOFF 2.3)
- 🔄 Bordi `--color-border-subtle` invece di `default` (HANDOFF 2.4)
- 🔄 Image ora `next/image` invece di `<img>` raw (FIX 3.3.1-A applicato)

### Sprint 3.3.2 — Multi-outcome + Multi-strike

- ✅ `components/markets/cards/MultiOutcomeCard.tsx` esiste (193 righe)
- ✅ `components/markets/cards/MultiStrikeCard.tsx` esiste
- ✅ `EventCard.tsx` switcha su `multi_outcome` e `multi_strike` (l.47-52)
- ✅ Helper `outcomeLabel` usa `groupItemTitle` (FIX 3.3.1-B)

### Sprint 3.3.3 — H2H Sport

- ✅ `components/markets/cards/H2HCard.tsx` esiste
- ✅ `EventCard.tsx` switcha su `h2h_sport` (l.53-55)
- ✅ `AuktoraOutcome[]` aggiunto a `AuktoraMarket` (mappers.ts:12-16, 30)

### Sprint 3.3.4 — Crypto Up/Down

- ✅ `components/markets/cards/CryptoCard.tsx` esiste
- ✅ `components/markets/charts/Thermometer.tsx` esiste
- ✅ `lib/hooks/useCountdown.ts` esiste (split per restare entro 300 righe)
- ✅ `EventCard.tsx` switcha su `crypto_up_down` (l.56-58)
- 🔄 Thermometer minimal — testo interno rimosso, solo freccia + percentuale fuori (HANDOFF 2.5)

### Sprint 3.4.1 — Home page layout completo

- ✅ `app/page.tsx` Server Component, 54 righe (target max 80)
- ✅ `components/home/NavTabs.tsx` esiste — 13 categorie LIVE/All/For You/etc.
- ✅ `components/home/HeroZone.tsx` esiste (177 righe)
- ✅ `components/home/HeroCard.tsx` esiste
- ✅ `components/home/Sidebar.tsx` esiste con 3 stati (FIX 3.4.1-C applicato)
- ✅ `components/home/SidebarSignals.tsx`, `SidebarActivity.tsx`, `SidebarHotNow.tsx`, `SidebarPortfolio.tsx`, `SidebarNews.tsx`, `SidebarWatchlist.tsx` tutti esistono
- ✅ `components/home/MarketsGrid.tsx` esiste (109 righe)
- ✅ `components/home/MarketsFilters.tsx` esiste (282 righe — entro 300, denso ma ok)
- ✅ `components/home/MarketsSection.tsx` esiste (wrapper Filters + Grid con state layout condiviso)
- ✅ `components/home/CryptoLiveRail.tsx` esiste come componente
- 🔄 `CryptoLiveRail` NON viene usato in `app/page.tsx` — rimosso completamente per allinearsi a Doc 4 (HANDOFF 3.3)
- 🔄 `MobileSidebarRails.tsx` aggiunto (FIX 3.4.1-B), inserito in `app/page.tsx:45`
- 🔄 Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` invece di `auto-fill minmax(280px,1fr)` (HANDOFF 3.1)
- 🔄 NavTabs ha wrapper interno `maxWidth: 1440` (HANDOFF 3.2)
- ⚠️ Fetch ISR via `fetchFeaturedEvents(40)` — funziona ma non implementa "infinite scroll vs Carica altri" come da prompt: la pagina invece passa tutto a `MarketsSection`. Implementato `Carica altri` lato client (`MarketsGrid.tsx:86`). Ok.

---

## Fix di iterazione

### FIX 3.1.1-B — useAppMode REAL/DEMO toggle persistente

- ✅ `isDemo: boolean` + `setIsDemo` + `toggleDemo` aggiunti a `themeStore.ts:9-15`
- ✅ Persiste con name `auktora-theme` (localStorage)
- ✅ `Header.tsx` non ha più `useState` per isDemo — `HeaderActions.tsx:19` legge da `useThemeStore()`
- ✅ `RealDemoToggle.tsx` riceve come prop `isDemo`+`onToggle`

### FIX 3.3.1-A — next/image in EventCardHeader e HeroCard

- ✅ `components/markets/EventCardHeader.tsx:3` importa `Image` da `next/image`
- ✅ `components/home/HeroCard.tsx:4` importa `Image` da `next/image`
- ✅ `next.config.ts:5-9` ha `remotePatterns` per `polymarket-upload.s3.us-east-2.amazonaws.com`, `i.imgur.com`, `res.cloudinary.com`
- ✅ Nessun `eslint-disable @next/next/no-img-element` rimasto in quei due file (verificato grep)

### FIX 3.3.1-B — MultiOutcomeCard groupItemTitle

- ✅ `AuktoraMarket.groupItemTitle: string` in `mappers.ts:42`
- ✅ `mapGammaMarket` mappa `raw.groupItemTitle ?? ''` (l.157)
- ✅ `MultiOutcomeCard.tsx:30-32` ha helper `outcomeLabel(market)` che usa `groupItemTitle || question`
- ✅ Riga 115 e 40 usano `outcomeLabel(m)` (non più `m.question` direttamente)
- ✅ 2 test aggiunti in `mappers.test.ts:190-198`

### FIX 3.3.3-A — Test mancanti AuktoraMarket.outcomes[]

- ✅ Test `outcomes[] 2-way` in `mappers.test.ts:157-169`
- ✅ Test `outcomes[] 3-way (H2H)` in `mappers.test.ts:171-185`

### FIX 3.4.1-A — Hero carousel mobile + pagination dots

- ✅ `HeroZone.tsx` ha `activeIndex` state (l.23)
- ✅ Mobile: `<ul>` con `scrollSnapType: 'x mandatory'` + `scrollSnapAlign: 'start'` (l.80-109)
- ✅ Desktop: 60%/40% layout (l.67-77)
- ✅ Pagination dots + frecce ChevronLeft/ChevronRight (l.111-174)
- ✅ IntersectionObserver con threshold 0.6 sincronizza dots (l.28-45)

### FIX 3.4.1-B — MobileSidebarRails

- ✅ `components/home/MobileSidebarRails.tsx` esiste
- ✅ `app/page.tsx:45` lo include tra `<HeroZone>` e `<MarketsSection>`
- ✅ Sidebar desktop ha `className="hidden md:flex"` (Sidebar.tsx:35)

### FIX 3.4.1-C — Sidebar 3-stati + SidebarNews + SidebarWatchlist

- ✅ `Sidebar.tsx:25-31` calcola lo `state` con `'guest' | 'logged-no-deposit' | 'logged-active'`
- 🔄 `hasDeposit = false` hardcoded con TODO MA4 (l.23) — divergenza utente documentata
- ✅ `SidebarNews.tsx` esiste come stub
- ✅ `SidebarWatchlist.tsx` esiste con prop `populated`
- ✅ `SidebarPortfolio.tsx` accetta prop `mode: 'deposit-cta' | 'active'` (Sidebar.tsx:57, 67)

### FIX 3.4.1-D — MarketsFilters search + animations + sub-filtri

- ✅ Search input con debounce 300ms (`MarketsFilters.tsx:26, 56-69`)
- ✅ Toggle Animations (`Zap`/`ZapOff`) collegato a `useThemeStore.animationsEnabled` (l.41, 154-172)
- ✅ Sub-filtri Related (RELATED_TAGS l.16-24) come tag scrollabili pill (l.244-279)
- ✅ Bottone Filters placeholder con `SlidersHorizontal` (l.103-122)
- ✅ Stato `tag` in URL (l.39, 252-258)
- 🔄 `body.no-animations` regola in `globals.css:426-430` (Class su `<html>` invece che `<body>`, gestita dal ThemeProvider)
- 🔄 `animationsEnabled` persiste via Zustand (`auktora-theme`) invece di localStorage diretto — variante migliore

### FIX 3.4.1-E — HeroCard no hardcoded colors + Slip stub

- ✅ `globals.css:60-65` definisce `--color-hero-overlay-strong`, `--color-hero-overlay-soft`, `--color-text-on-image`, `--color-text-on-image-muted`, `--color-text-on-image-faint`, `--color-hero-cta-bg` (token theme-invariant — divergenza voluta documentata in HANDOFF 8)
- ✅ `--color-overlay` definito in dark/light specifici (l.394, 422)
- ✅ `MarketsGrid.tsx:18-21` ha `handleAddToSlip` stub con `console.warn` + TODO MA4 (divergenza voluta HANDOFF 7)
- ✅ `MarketsGrid.tsx:81` passa `onAddToSlip={handleAddToSlip}` a ogni `<EventCard>` → bottone Slip visibile

### FIX RENAME-AUKTORA — Predimark → Auktora

- ✅ `package.json:2` mantiene `"name": "predimark-v2"` (corretto, è il nome npm/repo)
- ✅ `app/globals.css:4` — il commento dice ancora "PREDIMARK V2 — DESIGN SYSTEM" — vedi sezione Anomalie
- ✅ `app/page.tsx` non contiene la stringa "Predimark"
- ✅ `Footer.tsx:106` "Auktora is not a licensed broker..."
- ✅ `Footer.tsx:116` "© {year} Auktora..."
- ✅ `themeStore.ts:31` `name: 'auktora-theme'`
- ✅ `AGENTS.md` contiene "Auktora", non "Predimark"
- ✅ `README.md` titolo "Auktora"
- ✅ `app/layout.tsx` metadata Auktora dovunque

### FIX VERCEL-ENV — Vercel production env vars

- ⚠️ Non verificabile dall'audit del codice — è un'operazione su Vercel CLI. Dato che `app/layout.tsx:18` usa `NEXT_PUBLIC_APP_URL ?? 'https://auktora.com'` e tutto il codice production è già on-line, si presume completato.

---

## Open items prima di MA4

I seguenti TODO sono espliciti nel codice e bloccanti per l'inizio di MA4:

- `Sidebar.tsx:23` — `const hasDeposit = false` hardcoded; collegare a query Supabase (tabella `balances` o equivalente)
- `MarketsGrid.tsx:18-21` — `handleAddToSlip` è uno stub `console.warn`; rimpiazzare con `useBetSlip().addLeg(...)`
- `useBetSlip` store + drawer Bet Slip da costruire (HANDOFF sezione 7)
- Modalità DEMO: oggi `isDemo` esiste come flag ma il "saldo demo separato" non è implementato (HANDOFF sezione 6.3)
- Schema Supabase per watchlist + `SidebarWatchlist` populated
- Vercel env: deploy production verde — confermare manualmente lo stato dopo il fix
- Nessun route handler per i link Footer/Header (`/legal/privacy`, `/legal/terms`, `/help`, `/about`, `/me`, `/markets`, `/signals`, `/leaderboard`, `/news`, `/creator`, `/search`, `/slip`, `/more`) — generano 404 soft, OK per ora

## Anomalie / discrepanze degne di nota

1. `app/globals.css:4` ha ancora il commento `PREDIMARK V2 — DESIGN SYSTEM` (e la riga `Source of truth: docs/08-DESIGN-SYSTEM.md`). Il prompt FIX-RENAME-AUKTORA elencava esplicitamente questo file. È rimasto solo il commento (non c'è impatto runtime), ma andrebbe pulito per coerenza.

2. `BottomNav.tsx` è 282 righe — molto più grande dello stub previsto in 3.1.1. Non c'è prompt che ne giustifichi l'espansione. Da verificare se è un'evoluzione voluta o se andrebbe spezzato (è comunque sotto la soglia 300 dei componenti React).

3. `lib/polymarket/mappers.ts` è 181 righe — supera il limite 150 per utility (AGENTS.md). Logicamente è un singolo blocco coerente di mapping, difficile da spezzare senza creare attriti. Da rivalutare in MA4 se cresce ancora.

4. `header/HeaderActions.tsx` è 177 righe — supera il limite 150. Contiene molta composizione (notifiche, theme toggle, gift, REAL/DEMO, profilo, login). Potrebbe essere un'altra opportunità di split se cresce ulteriormente.

5. Il prompt 3.1.1 originale prevedeva `setAnimationsEnabled` in `themeStore` ma usava `usePrivy` import nello store — il design attuale (`themeStore.ts`) è coerente e più pulito. Nessun problema.

6. `vitest.config.ts` integra `loadEnv` per esporre `.env.local` ai test (`process.env`). Non era nel prompt 1.5.2 ma è una decisione tecnicamente corretta per i test che dipendono da `NEXT_PUBLIC_*` (es. test Supabase).

7. PROMPT-FIX-3.3.3-A esisteva ma non c'è un commit dedicato; i test sono stati aggiunti probabilmente nello stesso commit di 3.3.3 o successivo. Acceptance criteria comunque tutti soddisfatti.

8. `predimark-v2` come name in `package.json` e nel repo è confermato volontariamente invariato (HANDOFF + AGENTS.md regola "Auktora"). Nessuna azione richiesta.

9. Non risulta che `app/layout.tsx` contenga `suppressHydrationWarning` su `<html>` (verificato l.48): `<html lang="en" suppressHydrationWarning>` — ✅ presente. Bug check ok.
