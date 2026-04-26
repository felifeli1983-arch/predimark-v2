# Predimark V2 — Sitemap

> **Documento 3 di 10** — Product Layer
> Autore: Feliciano + Claude (architetto)
> Data: 25 aprile 2026
> Status: bozza v2 — sincronizzata con Doc 1 v3 e decisioni di Doc 4-9
>
> **Changelog v2 (rispetto a v1)**:
> - **Eliminata `/market/[id]`** (deep view): l'espansione orderbook è inline accordion in pagina evento (Doc 4 Pagina 2)
> - **Demo mode separato architetturalmente**: aggiunte routes `/me/demo/*` parallele a `/me/*`
> - **Distinzione esplicita** `/creator/[username]` (Verified Creators) vs `/trader/[address]` (External Polymarket)
> - **Admin completamente espanso**: 36 sub-pages elencate (era abbozzato in v1)
> - **Routes `/api/v1/*`** aggiunte (precedentemente non documentate)
> - Aggiunta sezione "Demo separation" (~10 routes nuove)

---

## Cos'è questo documento

Questo documento elenca **tutte le pagine** di Predimark V2, organizzate ad albero, con pattern URL e regole di accesso. È la base per:

- Configurare il routing di Next.js App Router
- Definire la navigazione (header, footer, breadcrumb)
- Identificare middleware di auth e geo-blocking
- Pianificare lo sviluppo pagina per pagina

**Scelte architetturali finali (v2)**:
- **Pagina 3 eliminata**: niente `/market/[id]` standalone, espansione inline accordion in pagina evento
- **Demo mode separato architetturalmente** in `/me/demo/*` parallelo a `/me/*` (decisione Doc 1 v3 + Doc 4)
- **Creator Program** con due URL distinti: `/creator/[username]` (Verified Predimark) vs `/trader/[address]` (External Polymarket esterno con disclaimer)
- **Leaderboard ibrida adattiva**: 1 classifica unificata al lancio, 2 tab a maturità (toggle admin runtime)
- **Admin completo in V1** (lancio ottobre 2026): 36 sub-pages

---

## Struttura ad albero

```
PREDIMARK V2 — SITEMAP COMPLETA
================================

🌐 PAGINE PUBBLICHE (no auth richiesta, geo-block neutrale)

├── /                                    Home con rail di mercati (5 CardKind)
├── /event/[slug]                        Pagina evento (5 layout dinamici per CardKind, espansione inline orderbook)
├── /trader/[address]                    Profilo Top Trader Polymarket esterno (disclaimer permanente)
├── /creator/[username]                  Profilo Verified Creator Predimark (slug human-readable)
├── /leaderboard                         Classifica ibrida adattiva (1-tab default, 2-tab a maturità)
├── /signals                             Lista segnali live (preview senza login)
├── /signals/performance                 Performance pubblica algoritmi Predimark (calibration globale)
├── /news                                Top movers + breaking news
├── /search                              Ricerca testuale globale
├── /about                               Cos'è Predimark, come funziona, team
├── /pricing                             Tier Free vs Telegram Premium
├── /legal/terms                         Termini di servizio
├── /legal/privacy                       Privacy policy GDPR
├── /legal/disclaimer                    Risk disclosure completo
└── /legal/responsible-trading           Trading responsabile + disclaimer copy trading

# NOTA v2: /market/[id] eliminata (era in v1).
# L'espansione del singolo market è ora inline accordion in /event/[slug].


🔐 AUTH FLOW (signup/login)

├── /signup                              Signup multi-method
│   ├─ Email + password
│   ├─ Google OAuth
│   ├─ Apple OAuth
│   └─ Connect Wallet (esterno)
├── /signup/welcome                      Tutorial post-signup (4 step skip-able)
├── /signup/choose-mode                  Scelta: "Inizia in Demo" o "Deposita reale"
├── /login                               Login utente esistente
├── /login/reset-password                Reset password via email
├── /login/connect-wallet                Connect wallet flow (per crypto-native)
└── /logout                              Logout (route action, no UI)


👤 PROFILO PERSONALE — REAL MODE (auth required)

├── /me                                  Dashboard overview con hero finanziario
│                                          - Equity curve chart (1D/1W/1M/3M/1Y/ALL)
│                                          - Saldo USDC + delta P&L oggi
│                                          - Posizioni aperte preview top 3
│                                          - Quick actions (Deposit, Withdraw, View positions)
├── /me/positions                        Posizioni aperte con P&L live
├── /me/history                          Storico trade chiusi (con export CSV)
├── /me/transactions                     Depositi e prelievi
├── /me/watchlist                        Mercati seguiti (con notify settings)
├── /me/following                        Creator che seguo
├── /me/sessions                         Session keys copy trading attive [V1.1]
│                                          - Lista session per creator/external
│                                          - Stato (attiva/scaduta/revocata)
│                                          - Bottone "Revoca" istantaneo
├── /me/notifications                    Storico notifiche ricevute
├── /me/stats                            Statistiche personali dettagliate
│                                          - P&L totale + equity curve
│                                          - Win rate per categoria
│                                          - ROI %, Sharpe, drawdown max
│                                          - **CALIBRATION CURVE** (Brier score + ECE)
│                                          - Best/worst trades
├── /me/achievements                     Badge sbloccati [V1.2]
├── /me/referrals                        Programma referral
│                                          - Link referral personale
│                                          - Lista referrati + loro volume
│                                          - Payout pending e storico
├── /me/deposit                          Deposit USDC (MoonPay onramp)
├── /me/withdraw                         Withdraw USDC [V1.1, richiede KYC]
├── /me/kyc                              KYC submission flow [V1.1]
│   ├── /me/kyc/start                   Wizard 3 step (ID, selfie, address)
│   └── /me/kyc/status                  Status submission corrente
└── /me/settings                         Impostazioni
    ├── /me/settings/profile            Profilo (nome pubblico, avatar, bio)
    ├── /me/settings/security           Password, 2FA, esporta chiave Privy, elimina account
    ├── /me/settings/notifications      Configurazione canali notifiche
    ├── /me/settings/preferences        Interessi, default filters, theme
    ├── /me/settings/telegram           Connessione bot Telegram
    ├── /me/settings/premium            Subscription Telegram Premium ($5/mo)
    ├── /me/settings/language           Lingua interfaccia (EN/ES/PT/IT/FR)
    ├── /me/settings/billing            Stripe billing (per V1.1+)
    └── /me/settings/data               Export dati GDPR (ZIP JSON+CSV)


🎮 PROFILO PERSONALE — DEMO MODE (auth required, sub-pages parallele)

├── /me/demo                            Dashboard demo overview
│                                         - Saldo demo $10k paper money
│                                         - Equity curve demo
│                                         - Banner persistente "DEMO MODE"
│                                         - Bottone "Reset balance" con conferma
├── /me/demo/positions                  Posizioni demo aperte
├── /me/demo/history                    Storico trade demo
├── /me/demo/watchlist                  Watchlist demo
├── /me/demo/stats                      Stats demo (con calibration curve demo)
├── /me/demo/sessions                   Session demo (V1.1)
└── /me/demo/achievements               Badge demo (V1.2)

# NOTA v2: tutte le sub-pages /me/demo/* hanno DB filter is_demo=true.
# Switch in header redirect tra /me/* e /me/demo/*.


🎮 DEMO MODE (auth required, switch globale)

⚠️ **Decisione architetturale**: niente route separate /demo/*.
Le stesse pagine /me/* funzionano sia in modalità Real che Demo,
con switch globale nell'header che cambia il dataset.

Switch nell'header: [REAL] ↔ [DEMO]
- In Demo: banner persistente in cima ad ogni schermata
- In Demo: saldo, posizioni, history, leaderboard sono filtrati su dati demo
- In Demo: notifiche Telegram disabilitate (rimangono solo email/push)
- Demo accessibile anche da paesi geo-bloccati


🤖 CREATOR PROGRAM (sezione dedicata, alta visibilità)

├── /creator                             Landing page programma creator
│                                          - Cos'è il programma
│                                          - Requisiti (30 trade, 30gg, ROI+)
│                                          - Revenue share (30% builder fee)
│                                          - Lista top creator attivi (showcase)
│                                          - CTA "Diventa Creator"
├── /creator/[username]                  Profilo pubblico Verified Creator (slug)
│                                          - Statistiche complete
│                                          - Badge Verified
│                                          - Trade history pubblica
│                                          - Bottone "Segui questo creator"
├── /creator/apply                       Applicazione per diventare Creator (auth)
│                                          - Form con username, bio, mercati preferiti
│                                          - Verifica requisiti automatica
│                                          - Submit → review umano in admin
└── /creator/dashboard                   Dashboard creator (auth, solo se opt-in)
    ├── /creator/dashboard/followers     Lista follower con loro volume copy
    ├── /creator/dashboard/earnings      Builder fee guadagnata + payout history
    ├── /creator/dashboard/stats         Statistiche performance pubbliche
    └── /creator/dashboard/settings      Settings profilo creator


🛠 ADMIN PANEL (3 ruoli: super_admin / admin / moderator, MFA obbligatoria super_admin)

# Allineato a Doc 4 Pagina 6 — 36 sub-pages organizzate in 12 gruppi tematici

├── /admin                               Dashboard admin overview (KPI cards, alerts, charts)
│
├── /admin/users                         GRUPPO 1: USERS (5 sub-pages)
│   ├── /admin/users                    Lista utenti con search/filter/bulk actions
│   ├── /admin/users/[id]               Profilo utente dettagliato (5 tabs: Overview/Trades/KYC/Notifications/Audit)
│   ├── /admin/users/banned             Lista utenti banned
│   ├── /admin/users/kyc                KYC review queue [V1.1]
│   └── /admin/users/refunds            Refund requests queue
│
├── /admin/markets                       GRUPPO 2: MARKETS (4 sub-pages)
│   ├── /admin/markets                  Lista mercati attivi con filter
│   ├── /admin/markets/featured         Curate featured (drag-drop Hero/Hot Now/Top Picks)
│   ├── /admin/markets/hidden           Mercati nascosti dalla home
│   └── /admin/markets/import           Import manuale da Polymarket via slug/event ID
│
├── /admin/fees                          GRUPPO 3: FEES (3 sub-pages)
│   ├── /admin/fees                     Configurazione runtime (builder/service/creator share/telegram)
│   ├── /admin/fees/history             Storico cambi fee (audit log fee specifico)
│   └── /admin/fees/revenue             Revenue dashboard real-time con breakdown
│
├── /admin/creators                      GRUPPO 4: CREATOR PROGRAM (5 sub-pages)
│   ├── /admin/creators                 Lista Verified Creators
│   ├── /admin/creators/applications    Queue applications da review (approve/reject/request more info)
│   ├── /admin/creators/[id]            Dettaglio creator + edit
│   ├── /admin/creators/payouts         Payout settimanali queue
│   └── /admin/creators/suspended       Creator sospesi
│
├── /admin/referrals                     GRUPPO 5: REFERRAL (2 sub-pages)
│   ├── /admin/referrals                Lista referrals attivi + metriche
│   └── /admin/referrals/payouts        Payout queue referrer (mensile)
│
├── /admin/signals                       GRUPPO 6: SIGNALS / ALGOS (3 sub-pages)
│   ├── /admin/signals                  Gestione segnali Predimark pubblicati
│   ├── /admin/signals/performance      Performance tracker (calibration, hit rate)
│   └── /admin/signals/algos            Configurazione algoritmi backtest + parametri runtime
│
├── /admin/notifications                 GRUPPO 7: NOTIFICATIONS (3 sub-pages)
│   ├── /admin/notifications/broadcast  Invio annunci (push/email/telegram con audience filter)
│   ├── /admin/notifications/templates  Library template messaggi
│   └── /admin/notifications/history    Storico invii broadcast e per-user
│
├── /admin/analytics                     GRUPPO 8: ANALYTICS (4 sub-pages)
│   ├── /admin/analytics                KPI dashboard principale (DAU/MAU, retention, funnel)
│   ├── /admin/analytics/users          Funnel utenti dettagliato + segmentation
│   ├── /admin/analytics/markets        Top markets per volume/engagement/holders
│   └── /admin/analytics/revenue        Revenue breakdown e proiezioni
│
├── /admin/compliance                    GRUPPO 9: COMPLIANCE (2 sub-pages)
│   ├── /admin/compliance/geo-block     Lista paesi bloccati gestibile da admin
│   └── /admin/compliance/aml           AML / fraud alerts queue (AI-generated alerts)
│
├── /admin/audit-log                     GRUPPO 10: AUDIT & LOGS (3 sub-pages)
│   ├── /admin/audit-log                Audit log azioni admin (search by actor/action/period)
│   ├── /admin/system-logs              System errors e API failures
│   └── /admin/api-usage                Rate limiting status e top API consumers
│
└── /admin/settings                      GRUPPO 11+12: SETTINGS (8 sub-pages)
    ├── /admin/settings                 Settings overview (hub)
    ├── /admin/settings/feature-flags   Feature flags runtime con gradual rollout %
    ├── /admin/settings/ab-tests        A/B tests configuration (V1.2 active)
    ├── /admin/settings/leaderboard-mode Toggle 1-tab vs 2-tab leaderboard
    ├── /admin/settings/integrations    Polymarket / MoonPay / Telegram / Privy keys
    ├── /admin/settings/team            Gestione admin team [super_admin only]
    ├── /admin/settings/payouts         Configurazione metodi payout creator
    └── /admin/settings/branding        Logo, colori, tagline (futuro rebrand)

# NOTA v2: 36 sub-pages totali allineate con Doc 4 Pagina 6.
# Versione v1 ne aveva ~25 abbozzate, ora complete.


🔌 API ROUTES (backend, non visibili come pagine)

# Allineato a Doc 7 — REST resourceful con versioning /api/v1/*

├── /api/v1/auth/*                       Sessione Privy → Supabase
│   ├── /api/v1/auth/session             POST verifica JWT + crea/aggiorna user
│   └── /api/v1/auth/logout              POST logout
│
├── /api/v1/users/*                      User profile management
│   ├── /api/v1/users/me                 GET profilo utente loggato
│   ├── /api/v1/users/me/balances        GET saldo USDC + demo
│   ├── /api/v1/users/me/positions       GET posizioni aperte (con filter is_demo)
│   ├── /api/v1/users/me/trades          GET storico trade chiusi
│   ├── /api/v1/users/me/stats           GET statistiche aggregate
│   ├── /api/v1/users/me/equity-curve    GET storia portfolio per chart
│   ├── /api/v1/users/me/calibration     GET calibration curve (Brier + ECE)
│   ├── /api/v1/users/me/preferences     GET/PATCH preferenze utente
│   └── /api/v1/users/me/onboarding-complete POST marca onboarding done
│
├── /api/v1/markets/*                    Mercati Polymarket cached
│   ├── /api/v1/markets                  GET lista mercati con filter
│   ├── /api/v1/markets/[slug]           GET dettaglio singolo mercato
│   ├── /api/v1/markets/[slug]/orderbook GET orderbook live
│   ├── /api/v1/markets/[slug]/price-history GET storia prezzi
│   ├── /api/v1/markets/[slug]/holders   GET top holders
│   ├── /api/v1/markets/[slug]/comments  GET/POST commenti (Predimark + Polymarket)
│   └── /api/v1/markets/search           GET cerca mercati
│
├── /api/v1/trades/*                     Trading core (Edge Function)
│   ├── /api/v1/trades/submit            POST submit trade (REAL o DEMO via flag)
│   ├── /api/v1/trades/sell              POST sell shares
│   └── /api/v1/trades/[id]              GET dettaglio singolo trade
│
├── /api/v1/creators/*                   Verified Creators
│   ├── /api/v1/creators                 GET lista Verified Creators
│   ├── /api/v1/creators/[username]      GET profilo pubblico
│   ├── /api/v1/creators/[username]/positions GET posizioni con delay 30 min
│   ├── /api/v1/creators/[username]/trades GET storico
│   ├── /api/v1/creators/[username]/stats GET stats pubbliche
│   ├── /api/v1/creators/apply           POST application form
│   └── /api/v1/creators/[username]/follow POST/DELETE follow
│
├── /api/v1/traders/*                    External Traders Polymarket
│   ├── /api/v1/traders/[address]        GET profilo external (con disclaimer)
│   ├── /api/v1/traders/[address]/positions GET posizioni real-time on-chain
│   ├── /api/v1/traders/[address]/trades GET trade storici
│   └── /api/v1/traders/[address]/follow POST follow external
│
├── /api/v1/leaderboard/*                Classifica ibrida
│   ├── /api/v1/leaderboard              GET unified (Verified + External mescolati)
│   ├── /api/v1/leaderboard/me           GET posizione utente loggato
│   └── /api/v1/leaderboard/stats        GET statistiche live
│
├── /api/v1/copy/*                       Copy trading
│   ├── /api/v1/copy/sessions            GET/POST sessions [V1.1 per auto, V1 per manual]
│   └── /api/v1/copy/sessions/[id]       DELETE revoca session
│
├── /api/v1/signals/*                    Segnali algoritmici Predimark
│   ├── /api/v1/signals                  GET segnali attivi
│   ├── /api/v1/signals/[id]             GET dettaglio segnale + metadata
│   └── /api/v1/signals/performance      GET performance pubblica algoritmi
│
├── /api/v1/notifications/*              Notifiche utente
│   ├── /api/v1/notifications            GET lista notifiche
│   ├── /api/v1/notifications/[id]/read  POST marca come letta
│   └── /api/v1/notifications/read-all   POST marca tutte
│
├── /api/v1/watchlist/*                  Watchlist mercati
│   ├── /api/v1/watchlist                GET/POST watchlist
│   └── /api/v1/watchlist/[market_id]    DELETE remove
│
├── /api/v1/deposit/moonpay-session      POST crea sessione MoonPay
├── /api/v1/withdraw                     POST avvia withdraw [V1.1, KYC required]
│
├── /api/v1/kyc/*                        KYC submission [V1.1]
│   ├── /api/v1/kyc/submit               POST documenti
│   └── /api/v1/kyc/status               GET status corrente
│
├── /api/v1/referrals/me                 GET info referral programma
│
├── /api/v1/telegram/*                   Telegram bot
│   ├── /api/v1/telegram/connect         POST connetti chat_id
│   └── /api/v1/telegram/upgrade-premium POST $5/mese subscription
│
├── /api/v1/admin/*                      Endpoint admin (role-protected)
│   ├── /api/v1/admin/users/*            CRUD users (ban, unban, refund)
│   ├── /api/v1/admin/markets/*          Featured, hide, import
│   ├── /api/v1/admin/fees                GET/POST fee configuration runtime
│   ├── /api/v1/admin/creators/*         Approve, reject, suspend
│   ├── /api/v1/admin/notifications/broadcast POST annuncio massivo
│   ├── /api/v1/admin/analytics/*        GET KPI dashboard
│   ├── /api/v1/admin/audit-log          GET audit log filtrato
│   ├── /api/v1/admin/feature-flags      GET/PATCH feature flags
│   └── /api/v1/admin/settings/leaderboard-mode POST toggle 1-tab vs 2-tab
│
├── /api/webhooks/*                      Webhook esterni
│   ├── /api/webhooks/moonpay            Webhook deposito MoonPay (verify signature HMAC)
│   ├── /api/webhooks/telegram           Webhook bot Telegram updates
│   └── /api/webhooks/stripe             Webhook Stripe (V1.1 per Telegram premium)
│
└── /api/internal/*                      Endpoint interni (cron, jobs)
    ├── /api/internal/import-leaderboard Trigger import nightly Polymarket
    ├── /api/internal/calculate-stats    Trigger calculate user stats
    ├── /api/internal/calculate-payouts  Trigger creator payouts settimanali
    └── /api/internal/signal-generator   Trigger generazione segnali

# NOTA v2: tutte le routes prefissate con /api/v1/ per versioning.
# Breaking changes futuri → /api/v2/. Endpoint dettagliati in Doc 7.


📱 PWA SPECIAL

├── /offline                             Pagina mostrata se device è offline
├── /install                             Guida installazione PWA su mobile/desktop
├── manifest.json                        PWA manifest
└── service-worker.js                    Service worker per offline + push


❌ PAGINE ERRORE

├── /404                                 Pagina non trovata (Next.js standard)
├── /500                                 Errore server (Next.js standard)
├── /geo-blocked                         Geo-block esplicito con CTA Demo Mode
└── /maintenance                         Manutenzione programmata
```

---

## Riassunto numerico (v2)

| Categoria | Numero pagine |
|---|---|
| Pubbliche | 15 (rimossa /market/[id], aggiunta /signals/performance) |
| Auth flow | 6 |
| Profilo personale REAL | 22 |
| Profilo personale DEMO (parallelo) | 7 |
| Wallet & Trading | inglobato in /me/deposit, /me/withdraw, /me/kyc |
| Creator Program (Verified + External distinti) | 4 routes principali |
| Admin Panel | **36 sub-pages** in 12 gruppi (allineato Doc 4 Pagina 6) |
| API Routes (`/api/v1/*` versioned) | ~80 endpoint dettagliati in Doc 7 |
| PWA + Errori | 6 |
| **Totale routes UI distinte** | **~110 route** |

---

## Convenzioni URL (v2)

### Slug human-readable per contenuti pubblici
- `/event/2026-fifa-world-cup-winner` (no ID, slug pulito)
- `/creator/theo4` (username scelto dal Verified Creator)

### Address per External Traders
- `/trader/0x9d84ce0306...` (wallet address Ethereum, no slug — sono trader esterni non verificati)

### ID per contenuti tecnici
- `/admin/users/[uuid]` (UUID Supabase)
- `/admin/markets/[id]` (UUID Supabase)

### Query params per filtri/stato
- `/leaderboard?period=30d&category=crypto&sort=roi&trader_type=verified`
- `/?cat=sport&tag=premier-league`
- Filtri salvabili → URL condivisibile con un click

### Demo mode: NO query param, ma route separate
**v2 cambio importante**: il demo NON è più gestito via switch globale in `/me/*`, ma ha route separate `/me/demo/*` parallele a `/me/*`.

- `/me/positions` → posizioni REAL
- `/me/demo/positions` → posizioni DEMO (DB filter `is_demo=true`)

Lo switch in header redirect tra le due route. Più chiaro a livello architetturale.

### API versioning
- `/api/v1/*` per tutte le API attuali
- Breaking changes futuri → `/api/v2/*`

---

## Middleware e regole di accesso

### Middleware 1 — Auth check
Applicato a:
- `/me/*` → redirect a `/login` se non autenticato
- `/creator/dashboard/*` → redirect se non autenticato (E non opt-in creator)
- `/admin/*` → redirect E check ruolo admin
- `/deposit`, `/withdraw`, `/trade/*` → redirect se non autenticato

### Middleware 2 — Geo-block
Applicato a:
- `/deposit`, `/withdraw`, `/trade/*` → redirect a `/geo-blocked` se IP da paese vietato
- Altre pagine → header con banner "Trading not available in your region"

Lista paesi geo-bloccati gestita in admin (configurabile runtime), default Polymarket geoblock list.

### Middleware 3 — Demo gate
Applicato a:
- `/deposit`, `/withdraw` → disabilitato in modalità Demo (toast "Switch to Real mode to deposit")
- Tutto il resto: funziona uguale, switch globale gestisce il dataset

### Middleware 4 — Rate limit
Applicato a:
- `/api/*` → rate limit per IP/utente (vari livelli per tipo endpoint)
- Login/signup → rate limit aggressivo per evitare brute force

---

## Navigazione globale

### Header desktop
```
[Logo Predimark] [Markets ▼] [Signals] [Leaderboard] [News] [Creator]
                                                              [Search] [REAL/DEMO switch] [🔔] [Profile ▼]
```

### Header mobile
```
[☰ Menu] [Logo] [REAL/DEMO] [🔔] [Profile]
```

Menu hamburger contiene tutte le voci di navigazione + lingua + logout.

### Footer (sempre visibile, multi-colonna desktop, accordion mobile)
```
PRODUCT          COMPANY          LEGAL                CONNECT
- Markets        - About          - Terms              - Twitter
- Signals        - Pricing        - Privacy            - Discord
- Copy Trading   - Creator Program - Disclaimer         - Telegram Bot
- Demo Mode      - Builder Program - Responsible        - GitHub
- Telegram Bot                                          - Contact

[Predimark] © 2026 — Built on Polymarket. Not custodial. EN | ES | PT | IT | FR
```

### Bet Slip Drawer (multi-predizione)
- Bottone fluttuante quando contiene mercati ("Bet Slip · 3" badge)
- Slide-in da destra (desktop) / bottom (mobile)
- Lista mercati selezionati con importo per ognuno
- Totale stake + payout + fee
- Bottone "Piazza tutte le predizioni" → batch sign Privy
- Persiste tra navigazioni (Zustand persist)

### Switch Real/Demo (sempre visibile)
- Toggle prominente nell'header
- Default: Real (per utenti loggati che hanno depositato)
- Default: Demo (per utenti loggati senza depositi)
- Click cambia stato globale → tutte le pagine /me/* si aggiornano
- Persiste tra sessioni

---

## Differenze rispetto a Predimark V1

### Pagine NUOVE in V2
- `/signals` (lista segnali dedicata)
- `/signals/performance` (calibration globale algoritmi — differenziatore)
- `/trader/[address]` (profilo Top Trader Polymarket esterno con disclaimer)
- `/creator/[username]` (profilo Verified Creator distinto)
- `/creator/apply` (application form)
- `/me/following`, `/me/sessions`, `/me/referrals` (copy trading + referral)
- `/me/demo/*` (10 sub-pages demo separate architetturalmente)
- `/me/kyc/*` (KYC submission flow [V1.1])
- `/me/settings/telegram`, `/me/settings/premium` (Telegram bot + premium)
- `/me/deposit` (onramp MoonPay)
- `/me/withdraw` (offramp [V1.1])
- `/admin/*` completo (36 sub-pages organizzate in 12 gruppi)
- `/geo-blocked`, `/legal/responsible-trading`, `/about`, `/pricing`

### Pagine ELIMINATE da V1
- `/me/lineups` e `/me/lineups/[id]` (lineup mode rimossa, V2 prediction-only)
- `/prizes` e `/shop` (PrediCoin economy rimossa)
- **`/market/[id]` (deep view eliminata in v2)** — l'espansione del singolo market è ora inline accordion in `/event/[slug]`

### Pagine MIGLIORATE da V1
- `/` Home (5 CardKind, hero card grandi Dribbble-style, sidebar adattiva)
- `/event/[slug]` (5 layout dedicati: binary, multi_outcome, multi_strike, h2h_sport, crypto_up_down) + espansione orderbook inline
- `/leaderboard` (architettura ibrida adattiva 1-tab → 2-tab + Sharpe sort speciale)
- `/news` (top movers Gamma per oneDayPriceChange)
- `/me` (hero finanziario Robinhood-style + calibration curve + demo separation)

### Nuove distinzioni architetturali in v2

| Aspetto | V1 | V2 |
|---|---|---|
| Profilo trader | Tutto in `/trader/[address]` indistinto | `/creator/[username]` (Verified) vs `/trader/[address]` (External) con disclaimer |
| Demo mode | Switch globale, no route separate | Sub-pages `/me/demo/*` parallele con DB filter |
| Leaderboard | 2 tab fisse (All / Verified) | Ibrida adattiva 1-tab → 2-tab (admin runtime) |
| Pagina mercato singolo | `/market/[id]` standalone | Inline accordion in `/event/[slug]` |
| API endpoints | `/api/polymarket/*` proxy | `/api/v1/*` resourceful versioning |

---

## Riferimenti

- **Documento 1 v3** — Vision & Product (la visione di alto livello)
- **Documento 2 v2** — User Stories (le 51 azioni dell'utente)
- **Documento 4** — Wireframes (come appaiono le 7 pagine principali)
- **Documento 5** — Tech stack & Architettura
- **Documento 6** — Database Schema (tabelle che le routes usano)
- **Documento 7** — API Design (~80 endpoint dettagliati)
- **Documento 9 v2** — Roadmap & Sprint Plan (in che ordine costruire le pagine)

---

*Fine Documento 3 v2 — Sitemap*

*Fine Documento 3 — Sitemap*
