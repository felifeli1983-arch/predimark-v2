# Predimark V2 — Tech Stack & Architettura

> **Documento 5 di 10** — Engineering Layer
> Autore: Feliciano + Claude (architetto)
> Data: 25 aprile 2026
> Status: bozza v1 — Tech stack & Architettura completo
> Predecessori: Doc 1 (Vision v3), Doc 2 (User Stories), Doc 3 (Sitemap), Doc 4 (Wireframes 7 pagine)
> Audience: Cowork (esecuzione codice) + sviluppatori futuri team

---

## Cos'è questo documento

Questo documento è il **bridge tra UX e implementazione**. Definisce ESATTAMENTE con quali tecnologie, librerie, e pattern architetturali Cowork costruirà Predimark V2 da zero.

Non è un manuale di codice (quello lo gestisce Cowork in autonomia), ma un riferimento di **scelte tecnologiche giustificate** che garantisce coerenza e qualità.

Tutte le decisioni qui sono **confermate da Feliciano** o sono **default di V1** che funzionano e vogliamo riusare.

---

## 1. STACK FRONTEND

### Framework principale

| Tecnologia     | Versione   | Motivazione                                                                                             |
| -------------- | ---------- | ------------------------------------------------------------------------------------------------------- |
| **Next.js**    | 16.x       | App Router + Server Components + Turbopack. Stesso stack di V1, mature e ottimizzato per Vercel deploy. |
| **React**      | 19.x       | Latest stable. Concurrent features, server components, useOptimistic per UX fluida nei trade.           |
| **TypeScript** | 5.x strict | `"strict": true` in tsconfig. No `any` permessi. Tipo-safety end-to-end.                                |
| **Turbopack**  | built-in   | Bundler ufficiale Next 16. ~10x faster di Webpack per dev mode.                                         |

### Styling

| Tecnologia        | Versione | Motivazione                                                                                                    |
| ----------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| **Tailwind CSS**  | 4.x      | Latest con `@theme` directive in `globals.css` (no `tailwind.config.ts` file). Più semplice, meno boilerplate. |
| **shadcn/ui**     | latest   | Componenti React copy-paste (no dipendenza npm). Personalizzabili, accessibili, dark mode nativo.              |
| **lucide-react**  | latest   | Icone SVG. **Zero emoji** in UI per regola Predimark.                                                          |
| **Framer Motion** | 11.x     | Animazioni fluide (modal, drawer, tabs, equity curve). Performance-friendly.                                   |

**Regole strict di styling**:

- Tema dark e light supportati nativamente via Tailwind dark:
- Palette dichiarata in `globals.css` con `@theme`:
  ```css
  @theme {
    --color-bg-primary: #0a0e1a; /* dark bg */
    --color-bg-secondary: #141a2a; /* dark card */
    --color-success: #10b981; /* verde Yes/Up/Buy */
    --color-danger: #ef4444; /* rosso No/Down/Sell */
    --color-cta: #3b82f6; /* blu CTA */
    --color-live: #dc2626; /* live indicator pulsante */
    --color-hot: #f97316; /* hot indicator */
    /* ... */
  }
  ```
- **Mai inline styles** se non per valori dinamici (es. width di progress bar)
- **Mai colori hardcoded** in JSX, sempre via Tailwind classes che riferiscono CSS vars

### State management

| Tecnologia                                | Uso                  | Note                                                     |
| ----------------------------------------- | -------------------- | -------------------------------------------------------- |
| **Zustand** + **persist middleware**      | State client globale | Persiste in localStorage. Leggero (1.5kb gzipped).       |
| **React Query** (`@tanstack/react-query`) | Server state + cache | Per fetch, mutations, polling, optimistic updates.       |
| **React Context**                         | State UI ephemeral   | Per dropdown, modal, toast — niente persistenza.         |
| **URL query params**                      | Filtri pagina        | Per leaderboard, search, filters condivisibili via link. |

**Stores Zustand previsti** (aggiornati per V2):

1. `useAppMode` — REAL vs DEMO toggle, lingua, tema dark/light
2. `usePrediction` — draft trade in corso (importo, side, prezzo limit)
3. `useBetSlip` — bet slip multi-mercato (V2 feature)
4. `useUserPrefs` — preferenze interessi, watchlist locale, settings UI
5. `useNotifications` — notifiche in-app non lette

### Web3 / Wallet

| Tecnologia                         | Uso                                                              |
| ---------------------------------- | ---------------------------------------------------------------- |
| **Privy** (`@privy-io/react-auth`) | Auth primary + embedded wallet creation                          |
| **wagmi** 2.x                      | React hooks per Ethereum (account, signMessage, sendTransaction) |
| **viem**                           | Low-level Ethereum library (replacement per ethers.js)           |
| **WalletConnect** v2               | Per external wallet (MetaMask Mobile, Rainbow, Trust)            |
| **@tanstack/react-query**          | Cache delle query Web3 (balances, allowances)                    |

**Configurazione chain**: Polygon 137 (mainnet) + Polygon Amoy 80002 (testnet per staging).

### Polymarket integration

> **CLOB V2** (rilasciato 2026-04-28). Auktora salta V1 entirely (siamo
> ancora DEMO-only al cutover) e integra direttamente V2. Niente
> `@polymarket/clob-client` legacy, niente HMAC builder headers, niente
> USDC.e — solo V2 SDK + pUSD + `builderCode` per attribution.

| Tecnologia                             | Uso                                                                                                                                                                                                                                     |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **@polymarket/clob-client-v2**         | SDK V2 per CLOB API (book, midpoint, prices-history, POST /order). Constructor con options object, `chain` (era `chainId`). Order struct V2: `timestamp` ms, `metadata`, `builder` bytes32 — niente più `nonce`, `feeRateBps`, `taker`. |
| **Custom client** in `lib/polymarket/` | Wrapper su Gamma API REST + Data API REST + WebSocket RTDS                                                                                                                                                                              |
| **pUSD** (Polymarket USD)              | Collateral token V2 (ERC-20 Polygon backed by USDC). Wrap USDC.e via Collateral Onramp `wrap()` per API users. Frontend polymarket.com gestisce wrap auto.                                                                              |
| **builderCode** (bytes32)              | Single field per ordine per builder attribution. Da [Builder Profile](https://polymarket.com/settings?tab=builder). Niente più `@polymarket/builder-signing-sdk` o HMAC headers.                                                        |
| **EIP-712 Exchange domain**            | `version: "2"`, V2 contracts: standard `0xE111180000d2663C0091e4f400237545B87B996B`, neg risk `0xe2222d279d744050d28e00520010520000310F59`. ClobAuthDomain (L1 API auth) resta `version: "1"`.                                          |

Endpoint utilizzati (V2):

- **Gamma API** REST: events, markets, comments, tags, series, search
- **CLOB** REST + WebSocket: book/midpoint/prices-history + topic book/price_change/last_trade_price
- **Data API** REST: leaderboard, trades, holders, positions
- **RTDS WebSocket**: topic activity / crypto_prices / crypto_prices_chainlink / comments

### Charting

| Tecnologia                                        | Uso                                                                               |
| ------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Custom SVG components** in `components/charts/` | Equity curve, line chart prob, candle chart crypto. Già scritti in V1, riusabili. |
| **Recharts**                                      | Per chart "standard" (bar, pie nel dashboard admin)                               |

**No TradingView**: troppo pesante, troppe feature non necessarie, costo licenza per uso commerciale. I nostri SVG custom bastano.

### Internazionalizzazione

| Tecnologia                                     | Uso                                                                        |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| **next-intl**                                  | i18n per Next.js App Router. Translation files in `messages/[locale].json` |
| **Browser language detection**                 | Riconosce automaticamente, fallback a EN                                   |
| **5 lingue al lancio**: EN / ES / PT / IT / FR | Switch manuale nel footer + settings                                       |

### PWA (Progressive Web App)

| Tecnologia        | Uso                                                   |
| ----------------- | ----------------------------------------------------- |
| **next-pwa**      | Service worker, offline support basic, install prompt |
| **Web Push API**  | Notifiche push native browser/mobile                  |
| **manifest.json** | Icone, theme color, shortcuts                         |

**Niente app nativa V1** — PWA copre 90% dei casi d'uso mobile. Native app valutata per V2 se PWA limita.

---

## 2. STACK BACKEND

### Backend principale: **Supabase**

| Servizio                     | Uso                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| **Postgres 15+**             | Database relazionale principale. Tabelle utenti, mercati, trades, positions, audit log, ecc. |
| **TimescaleDB extension**    | Time-series per analytics (volume per ora, equity curve storage, signal performance)         |
| **Supabase Auth**            | Auth via Privy JWT (verifica server-side)                                                    |
| **Supabase Realtime**        | WebSocket per notifiche real-time interne (es. updates posizioni utente, comments live)      |
| **Supabase Storage**         | Avatar upload, KYC documents (encrypted at rest)                                             |
| **Edge Functions** (Deno)    | Logica server-side critica (vedi sezione dedicata)                                           |
| **Row Level Security (RLS)** | Policy granulari per privacy dati utente                                                     |

**Plan stimato**: Supabase Free al lancio (50k MAU + 500MB DB + 1GB storage), upgrade a Pro ($25/mese) quando si supera. Successivamente Team plan se serve più scale.

### Edge Functions (Supabase) — logica server critica

Edge Functions (Deno runtime) per logica che richiede:

- Esecuzione server-side (no client)
- Bassa latenza (deploy globale edge)
- Accesso a secret env vars

**Edge Functions previste**:

| Function                        | Scopo                                                                      |
| ------------------------------- | -------------------------------------------------------------------------- |
| `submit-trade`                  | Validazione + signing trade Polymarket lato server (per copy trading auto) |
| `process-deposit-webhook`       | Ricezione webhook MoonPay e accredito USDC                                 |
| `calculate-creator-payout`      | Calcolo settimanale payout Verified Creators                               |
| `process-referral-payout`       | Calcolo mensile payout referrer                                            |
| `import-polymarket-leaderboard` | Job nightly per importare top trader Polymarket via Data API               |
| `calculate-user-stats`          | Job ogni 5 min per stats utente (P&L, ROI, calibration)                    |
| `signal-generator`              | Job ogni minuto per generare segnali algoritmici                           |
| `kyc-fraud-check`               | Chiama AI service per pre-screening documenti KYC                          |

### Next.js API Routes — BFF (Backend For Frontend)

Le API routes Next.js servono come **layer BFF** tra frontend e Supabase/external APIs:

```
/api/
├── auth/
│   ├── session       (verify Privy JWT, set Supabase session)
│   └── logout
├── markets/
│   ├── search        (search mercati via Gamma API)
│   ├── featured      (mercati featured curati admin)
│   └── [id]          (dettaglio mercato)
├── trades/
│   ├── submit        (submit trade via CLOB)
│   └── history       (history utente loggato)
├── creators/
│   ├── apply         (form application Verified)
│   ├── [username]    (profilo pubblico)
│   └── follow        (follow/unfollow)
├── leaderboard/
│   ├── unified       (Verified + External mescolati)
│   └── me            (posizione utente loggato)
├── copy/
│   ├── session       (crea/revoca session keys)
│   └── trade         (replica trade del trader copiato)
├── notifications/
│   ├── send          (server-only, da Edge Function)
│   └── preferences   (user preferences notifiche)
└── admin/
    └── *             (tutte le API admin protected role-based)
```

**Pattern**: API routes usano Supabase client (con utente JWT) per query DB + chiamano edge functions per logica critica + chiamano external APIs (Polymarket, MoonPay) come proxy.

### Cache strategy chirurgica

3 cache layer combinati:

| Layer                             | Tecnologia                       | Uso                                                                              |
| --------------------------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| **Vercel ISR + Next fetch cache** | Built-in                         | Pagine statiche (landing, FAQ, mercati con cache 60s)                            |
| **Redis (Upstash)**               | $0 free tier 10k commands/giorno | Cache Polymarket API hot (leaderboard, top markets), session data, rate limiting |
| **Vercel KV (Edge Config)**       | Built-in                         | Feature flags runtime, A/B test config, leaderboard mode (1-tab vs 2-tab)        |

**Esempio strategy**:

- Mercato singolo: ISR 30 secondi (Vercel)
- Leaderboard top 50: Redis cache 60 secondi
- Feature flags: Edge Config (sub-100ms read globale)
- User session: Redis con TTL 1 ora

---

## 3. INTEGRAZIONI ESTERNE

### Polymarket (data layer principale)

| Componente         | Uso                                   | Cache                   |
| ------------------ | ------------------------------------- | ----------------------- |
| **Gamma API** REST | Mercati, eventi, comments             | 30-60s                  |
| **CLOB** REST      | Book, prices-history                  | 5-10s book, 60s history |
| **CLOB** WebSocket | Real-time prices/trades               | No cache, direct WS     |
| **Data API** REST  | Leaderboard, holders, trades on-chain | 60-300s                 |
| **RTDS WebSocket** | Activity, crypto_prices, comments     | No cache, direct WS     |
| **Builder code**   | `0xc520...92475`                      | Hardcoded in env var    |

**Rate limit**: Polymarket non documenta limiti hard, ma ho osservato in V1 throttling oltre ~10 req/sec per IP. Cache aggressiva risolve.

### Privy (auth + wallet)

| Componente           | Uso                                         |
| -------------------- | ------------------------------------------- |
| **Privy SDK React**  | Login UI, embedded wallet creation          |
| **Privy Server SDK** | Verifica JWT, query user data, session keys |
| **Embedded wallets** | Auto-creati per utenti Email/OAuth          |
| **Session Keys**     | Per copy trading auto (budget + scadenza)   |
| **MFA**              | Per super-admin                             |

**Piano Privy**: Starter (gratis fino a 1000 MAU). Upgrade a Growth ($99/mese) quando superiamo.

### MoonPay (onramp fiat)

| Componente                               | Uso                                       |
| ---------------------------------------- | ----------------------------------------- |
| **MoonPay Widget**                       | Embedded UI per buy USDC con carta        |
| **MoonPay Webhook**                      | Conferma deposito → accredito user wallet |
| **Currency**: USDC su Polygon            | Pre-configurato nel widget                |
| **Min/Max**: $25 - $1000 per transazione | Configurabile in admin                    |

**Fee MoonPay**: ~3.5% (paga utente). Predimark non prende cut su deposit.

**Geo-block MoonPay**: alcune nazioni non supportate da MoonPay. Lista gestita in `/admin/compliance/geo-block`.

### Telegram bot

| Componente                    | Uso                                           |
| ----------------------------- | --------------------------------------------- |
| **Telegram Bot API**          | Send messages, receive commands               |
| **node-telegram-bot-api**     | SDK Node.js                                   |
| **Hosted on Railway**         | $5/mese, sempre online                        |
| **Webhook mode** (no polling) | Webhook URL su Vercel `/api/telegram/webhook` |

**Tier free**: 5 minuti delay sui segnali.
**Tier paid** ($5/mese): real-time. Pagamento via Stripe.

### Stripe Connect (futuro, V1.5)

Per payout creator e referrer (al di fuori di crypto):

| Componente                 | Uso                                         |
| -------------------------- | ------------------------------------------- |
| **Stripe Connect Express** | Onboarding creator come "connected account" |
| **Stripe Payouts**         | Bonifico bancario settimanale o mensile     |
| **Stripe Tax**             | Calcolo automatico tasse per giurisdizione  |

**Note V1**: payout creator inizialmente in **USDC su Polygon** direttamente al wallet del creator (no fee Stripe). Stripe Connect aggiunto V1.5 quando volume payout > $10k/mese.

### AI services (per KYC fraud check + segnali)

| Servizio                       | Uso                                                                   |
| ------------------------------ | --------------------------------------------------------------------- |
| **Claude API** (Anthropic)     | KYC document review automation, classificazione mercati per categoria |
| **OpenAI GPT-4** (fallback)    | Backup se Claude API down                                             |
| **Custom algos in TypeScript** | Segnali Predimark (RSI, MACD, calibration, final period momentum)     |

---

## 4. ARCHITETTURA DEI DATI

### Real-time data flow

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER CLIENT                        │
│                                                          │
│  React Components                                        │
│  ├── Use hooks (useLiveMidpoints, useCryptoLivePrice)   │
│  └── Subscribe to WebSocket singletons                   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ WebSocket connections
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
│ Polymarket   │ │ Polymarket   │ │ Supabase         │
│ CLOB WS      │ │ RTDS WS      │ │ Realtime         │
│              │ │              │ │                  │
│ topic: book  │ │ topic:       │ │ table updates,   │
│ price_change │ │ activity,    │ │ user notifs      │
│ last_trade   │ │ crypto_prices│ │                  │
└──────────────┘ └──────────────┘ └──────────────────┘
        │                 │                 │
        └─────────────────┴─────────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │ Singleton WS │  (1 connection per source)
                  │ Manager      │   shared via Context
                  └──────────────┘
```

**Pattern**:

- 1 WebSocket connection per data source (no duplicate)
- Singleton manager esposto via React Context
- Componenti subscribe via hook (es. `useLiveMidpoint(marketId)`)
- Auto-reconnect con backoff exponential
- Throttle 100ms per componente per evitare flickering

### State management flow

```
┌──────────────────────────────────────────────┐
│               BROWSER STATE                   │
├──────────────────────────────────────────────┤
│ Zustand Stores (persisted localStorage)       │
│ ├── useAppMode (REAL/DEMO, lang, theme)       │
│ ├── usePrediction (draft trade)               │
│ ├── useBetSlip (V2 feature)                   │
│ ├── useUserPrefs (interests, watchlist)       │
│ └── useNotifications                          │
├──────────────────────────────────────────────┤
│ React Query (server state + cache)            │
│ ├── User profile, balance                     │
│ ├── Markets (cache 30s)                       │
│ ├── Leaderboard (cache 60s)                   │
│ └── Positions (refetch on focus)              │
├──────────────────────────────────────────────┤
│ React Context (ephemeral UI)                  │
│ ├── Modal/dialog state                        │
│ ├── Toast notifications                       │
│ └── WebSocket singleton instances             │
├──────────────────────────────────────────────┤
│ URL query params (sharable filters)           │
│ ├── /leaderboard?period=30d&sort=profit       │
│ └── /event/[slug]?outcome=30-aprile           │
└──────────────────────────────────────────────┘
```

### Database schema overview

**Verrà definito in dettaglio nel Doc 6 — Database Schema**, ma a livello di principio:

- Tabelle separate per **REAL** vs **DEMO** (suffisso `_demo` o flag `is_demo` boolean)
- TimescaleDB **hypertables** per dati time-series (trade history, price history, equity curve)
- **Audit log** append-only con indici su (actor, action_type, timestamp)
- **RLS policies** strict per privacy (utente vede solo i suoi dati eccetto dati pubblici)

---

## 5. SICUREZZA & AUTH

### Auth flow

```
1. User clicks "Sign up" → Privy widget
2. Privy authenticates (email/OAuth/wallet)
3. Privy returns JWT + creates embedded wallet
4. Frontend stores JWT in httpOnly cookie
5. Frontend calls /api/auth/session
6. /api/auth/session verifies JWT with Privy server SDK
7. Session creates Supabase user (or updates if exists)
8. RLS policies activate based on Supabase user_id
9. All subsequent requests use cookie + Supabase RLS
```

### Row Level Security (RLS) policies

Esempi di policy critiche:

```sql
-- Utente vede solo le sue posizioni
CREATE POLICY positions_select_own ON positions
FOR SELECT USING (auth.uid() = user_id);

-- Audit log read-only per non-admin
CREATE POLICY audit_log_admin_only ON audit_log
FOR SELECT USING (auth.role() IN ('admin', 'super_admin'));

-- Public profile creator visibile a tutti
CREATE POLICY creator_public_select ON creators
FOR SELECT USING (is_verified = true AND is_public = true);
```

### Secrets management

| Tipo                                              | Storage                     | Note                         |
| ------------------------------------------------- | --------------------------- | ---------------------------- |
| **API keys** (Privy, MoonPay, Polymarket builder) | Vercel env vars (encrypted) | Mai in client code           |
| **JWT secrets**                                   | Vercel env vars             | Rotated quarterly            |
| **Database connection string**                    | Vercel env vars             | Service role key SOLO server |
| **Telegram bot token**                            | Railway env vars            | Bot hosted there             |
| **Stripe keys** (V1.5)                            | Vercel env vars             | Test/live separati           |

**Mai**:

- Hardcoded secrets in repo
- Service role keys in client bundle
- Logging di JWT in clear

### MFA & sessione

- **MFA obbligatoria** per super-admin (TOTP via Authy/Google Authenticator)
- **JWT short-lived** (1 ora) + refresh token (30 giorni)
- **Session timeout** 30 minuti inattività per admin
- **Logout esplicito** invalida refresh token server-side

### Audit log

Tutto ciò che fa un admin viene loggato:

- chi (admin user_id)
- cosa (action type es. "BAN_USER", "UPDATE_FEE")
- quando (timestamp)
- target (entity affected)
- before/after value (per cambi dati)
- reason note (opzionale ma raccomandato)

Audit log è **append-only**, no DELETE permesso, indici per ricerca rapida.

### Geo-blocking

- **Cloudflare Workers** (free tier) per geo-detection IP
- **MaxMind** GeoIP2 lite (free) per database IP→country
- Geo-block applicato a livello edge (prima di hit Vercel)
- Override admin per casi specifici (es. business travelers, VPN allowlist)

---

## 6. PERFORMANCE

### Rendering strategy

| Tipo pagina             | Strategy           | TTFB target  |
| ----------------------- | ------------------ | ------------ |
| **Landing /**           | SSG (static)       | <200ms       |
| **Home / (loggato)**    | SSR + streaming    | <500ms       |
| **Pagina evento**       | SSR + ISR 30s      | <600ms       |
| **Profilo /me**         | CSR (client-side)  | (after auth) |
| **Profilo creator**     | SSG + ISR 5min     | <300ms       |
| **Leaderboard**         | SSR + Redis cache  | <500ms       |
| **Admin /admin/\***     | SSR (sempre fresh) | <800ms       |
| **Signup / onboarding** | SSG + minimal JS   | <200ms       |

### Bundle size budget

| Bundle                      | Target gzipped |
| --------------------------- | -------------- |
| Initial JS (client)         | < 200kb        |
| Per-route JS                | < 50kb         |
| Critical CSS inlined        | < 10kb         |
| Total page weight (initial) | < 500kb        |

**Tecniche**:

- **Code splitting** per route (Next.js automatic)
- **Dynamic imports** per componenti pesanti (es. CalibrationCurveChart)
- **Lazy load** immagini (`next/image`)
- **Font subsetting** (solo glifi usati)
- **Tree shaking** aggressivo

### Real-time throttling

- Max **1 update visibile** per componente ogni 100ms (no flickering)
- WebSocket reconnect con **exponential backoff** (1s, 2s, 4s, 8s, max 30s)
- Heartbeat ogni 25s per detect disconnect

### Image optimization

- **next/image** con AVIF + WebP fallback
- Avatar utenti: stored su Supabase Storage, served via CDN
- Mercati Polymarket: usiamo loro foto via URL diretto (loro CDN)
- **Lazy loading** automatic con Intersection Observer

---

## 7. MONITORING & OBSERVABILITY

### Approach: free tier intelligente

Approfittiamo dei **free tier generosi** dei servizi pro per avere observability di qualità a $0:

| Servizio                    | Free tier                  | Quando paghiamo                                |
| --------------------------- | -------------------------- | ---------------------------------------------- |
| **Vercel Analytics**        | Built-in, 100k events/mese | Mai per V1                                     |
| **Vercel Speed Insights**   | Built-in                   | Mai per V1                                     |
| **Sentry** (error tracking) | 5k errors/mese gratis      | Quando errori > 5k/mese (probabilmente mai V1) |
| **PostHog Cloud**           | 1M events/mese gratis      | Quando MAU > 10k (mesi futuri)                 |
| **Supabase logs**           | 7 giorni retention         | Mai per V1                                     |
| **Cloudflare Analytics**    | Built-in                   | Mai per V1                                     |

**Stima**: $0/mese per monitoring nei primi 6-12 mesi di vita prodotto. Quando supereremo i free tier, passaggio a paid sarà giustificato dal volume utenti.

### Cosa tracciamo

**Performance & Errors** (Sentry):

- JS errors browser
- API errors backend
- Slow transactions (>3s)
- User context (anonymized)

**Product Analytics** (PostHog):

- Funnel signup → first trade → retention
- Feature usage (quale CardKind più usato, quale tab leaderboard)
- Session replay (per debug UX issues)
- A/B test results

**Infrastructure** (Vercel):

- Web Vitals (LCP, FID, CLS)
- API response times
- Function execution duration
- Edge cache hit rate

### Alerts critici

Configurati in Sentry/Vercel:

- **Error rate > 1%** in 5 min → Slack notification
- **API latency p95 > 2s** → Slack notification
- **MoonPay webhook failure** → Email immediata
- **Polymarket API down** → Slack notification
- **Database query > 1s** → Logged automaticamente

---

## 8. COSTI INFRASTRUTTURALI STIMATI

### Costi mensili previsti (V1 lancio, 0-1k utenti)

| Servizio                       | Free tier       | Mese 1-3     | Mese 6 (target 1k MAU)            |
| ------------------------------ | --------------- | ------------ | --------------------------------- |
| **Vercel**                     | Hobby gratis    | $0           | $20 (Pro per dominio + analytics) |
| **Supabase**                   | 50k MAU + 500MB | $0           | $25 (Pro per più storage)         |
| **Privy**                      | 1000 MAU        | $0           | $99 (Growth se >1k MAU)           |
| **Upstash Redis**              | 10k cmd/giorno  | $0           | $0-10                             |
| **Cloudflare**                 | Free tier       | $0           | $0                                |
| **Sentry**                     | 5k errors/mese  | $0           | $0                                |
| **PostHog Cloud**              | 1M events/mese  | $0           | $0                                |
| **MoonPay**                    | Pay per use     | $0           | $0 (utente paga fee)              |
| **Railway** (Telegram bot)     | -               | $5           | $5                                |
| **Polygon RPC** (Alchemy free) | -               | $0           | $0                                |
| **Domain + email**             | -               | $15          | $15                               |
| **MaxMind GeoIP2 Lite**        | Free            | $0           | $0                                |
| **Anthropic Claude API**       | Pay per use     | $20          | $50 (KYC + signal gen)            |
| **TOTALE**                     |                 | **$40/mese** | **$224/mese**                     |

### Crescita costi (proiezione)

| Tempo           | MAU    | Costi mensili stimati |
| --------------- | ------ | --------------------- |
| Lancio (mese 1) | 100    | $40                   |
| Mese 3          | 500    | $80                   |
| Mese 6          | 1.000  | $224                  |
| Mese 12         | 5.000  | $500-700              |
| Mese 18         | 10.000 | $1.000-1.500          |

**Break-even infrastrutturale** previsto a ~500 utenti attivi/settimana (vedi Doc 1 Modello economico).

---

## 9. MIGRATION PATH V1 → V2

V1 (Predimark attuale) ha già componenti utili. Cosa riusare, cosa riscrivere:

### Riuso da V1 (✅ porta in V2)

- **Stack base**: Next 16 + React 19 + TS strict + Tailwind 4 — già allineato
- **Custom client Polymarket** (`lib/polymarket/`): queries.ts, client.ts, classify.ts, ws.ts, mappers.ts
- **WebSocket singleton manager** (ws.ts, ws-clob.ts)
- **CardKind classification** (classifyEvent → 5 CardKind)
- **SVG Chart components** (CandleChart custom, line chart, equity curve)
- **Trading scaffold V2** in `lib/polymarket/trading/` (config, eip712, sign, auth, submit)

### Riscrittura completa (🔄 redo from scratch)

- **Routes**: nuova App Router structure secondo Doc 3 Sitemap
- **Componenti UI**: secondo Doc 4 Wireframes (5 CardKind, sub-pages /me, creator profile, leaderboard, admin, signup)
- **State management**: nuovi store Zustand (V1 aveva 3 stores, V2 ne avrà 5)
- **API routes**: nuove API BFF secondo Doc 7 API Design
- **Auth**: cambio da V1 (solo wallet) a Privy embedded primary
- **Backend**: aggiunta Supabase (V1 era client-only)
- **Demo mode**: completamente nuovo (non esisteva in V1)
- **Copy trading**: completamente nuovo
- **Admin pannello**: completamente nuovo

### Eliminato (❌ non porta)

- **Lineup mode** (PrizePicks-style): eliminato in V2, prediction-only
- **PrediCoin currency**: eliminato (no gamification dual currency)
- **Layout italiano-first**: V2 è EN-first

---

## 10. DEVOPS — CI/CD & ENVIRONMENTS

### 3 environments

| Env             | URL                   | Branch           | Purpose                          |
| --------------- | --------------------- | ---------------- | -------------------------------- |
| **Development** | localhost:3000        | feature branches | Sviluppo locale Cowork           |
| **Staging**     | staging.predimark.com | `staging`        | Test integrazione prima del prod |
| **Production**  | predimark.com         | `main`           | Live users                       |

### CI/CD pipeline

**GitHub Actions** + **Vercel auto-deploy**:

```
Pull Request opened
  ↓
1. Type check (tsc --noEmit)
2. Lint (eslint + prettier)
3. Tests (vitest unit + integration)
4. Build (next build)
5. Vercel preview deployment
  ↓
Code review by Feliciano
  ↓
Merge to staging
  ↓
6. Deploy to staging.predimark.com (Vercel)
7. Run smoke tests E2E (Playwright)
  ↓
Manual approval Feliciano
  ↓
Merge to main
  ↓
8. Deploy to predimark.com (Vercel)
9. Run smoke tests production
10. Sentry release marker
```

### Database migrations

- **Supabase migrations** via Supabase CLI
- File `.sql` versionati in repo `supabase/migrations/`
- Migrations applicate automaticamente in CI/CD su staging
- Production migrations richiedono approval manuale Feliciano

### Backup & disaster recovery

- **Supabase automatic backup**: daily, retained 7 giorni (Pro plan)
- **Manual snapshot** prima di major migration
- **Point-in-time recovery** Supabase (Pro plan)
- **Export schema** weekly su S3 (futuro)

---

## 11. STRUTTURA DEL REPO

Pattern proposto (compatibile con V1):

```
predimark-v2/
├── .github/
│   └── workflows/         CI/CD GitHub Actions
├── app/                   Next.js App Router
│   ├── (public)/          Routes pubbliche (Home, evento, leaderboard, creator)
│   ├── (auth)/            Routes auth (signup, login)
│   ├── (user)/            Routes utente loggato (/me/*)
│   ├── (creator)/         Routes creator (/creator/*)
│   ├── (admin)/           Routes admin (/admin/*)
│   └── api/               API BFF
├── components/            React components
│   ├── ui/                shadcn/ui base
│   ├── markets/           Componenti mercati (EventCard, CardKind variants)
│   ├── trade/             Trade widget e dialog
│   ├── charts/            SVG charts custom
│   └── admin/             Componenti admin-only
├── lib/                   Library code
│   ├── polymarket/        Client Polymarket (riusato da V1)
│   ├── supabase/          Supabase clients e helpers
│   ├── privy/             Privy SDK wrappers
│   ├── stores/            Zustand stores
│   ├── hooks/             React custom hooks
│   └── utils/             Utility functions
├── messages/              i18n translation files
│   ├── en.json
│   ├── es.json
│   ├── pt.json
│   ├── it.json
│   └── fr.json
├── public/                Static assets
├── supabase/
│   ├── migrations/        SQL migrations
│   └── functions/         Edge Functions Deno
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                  Documentazione interna (gli 10 docs)
├── scripts/               Utility scripts
├── .env.example           Template env vars
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts     (vuoto, usiamo @theme in globals.css)
└── README.md
```

---

## 12. STAGING-FIRST DEVELOPMENT

Pattern raccomandato per Cowork:

1. **Cowork sviluppa in dev locale** (feature branch)
2. **Push triggers PR** → Vercel preview link auto-generato
3. **Feliciano review preview link** + suggerisce modifiche
4. **Merge to staging** → deploy su staging.predimark.com
5. **Test integrazione su staging** (geo block test, Privy real, MoonPay sandbox)
6. **Approval Feliciano** → merge to main → production

**Mai deploy diretti a production**. Sempre staging come gate.

---

## 13. RIFERIMENTI

- **Documento 1** v3 — Vision & Product (decisioni prodotto)
- **Documento 2** — User Stories (features da implementare)
- **Documento 3** — Sitemap (~95 routes)
- **Documento 4** — Wireframes 7 pagine
- **Documento 6** — Database schema (prossimo, dettaglio tabelle)
- **Documento 7** — API design (prossimo, contracts)
- **Documento 8** — Design System (prossimo, design tokens)

---

## 14. DECISIONI APERTE (da affrontare in altri docs)

- **Database schema dettagliato**: in Doc 6
- **API contracts e endpoints completi**: in Doc 7
- **Design tokens e component spec**: in Doc 8
- **Roadmap implementazione settimana per settimana**: in Doc 9
- **Migration plan da V1 esistente**: in Doc 9

---

_Fine Documento 5 — Tech Stack & Architettura_
_Continua con Documento 6 (Database schema) nella sessione successiva_
