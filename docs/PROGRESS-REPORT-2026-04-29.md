# Auktora — Progress Report 2026-04-29

> Snapshot completo: cosa è fatto vs cosa resta da fare.
> Stato MVP: **~75% ready**, 27 commit live su origin/main, 17 migrations applicate.

---

## ✅ DONE — Cosa è implementato e live

### MA1 — Foundation (12/12 sprint)

- ✅ Next.js 16 + React 19 + Turbopack + TypeScript strict
- ✅ Tailwind 4 con `@theme` directive
- ✅ Stack: Privy v3, Supabase, Polymarket CLOB V2 SDK, viem, lucide-react, Zustand, React Query
- ✅ Repo GitHub + CI lint-staged hooks (eslint --fix + prettier)
- ✅ Vercel auto-deploy attivo

### MA2 — Database & Auth

- ✅ Supabase staging + production (39 tables totali, 17 migrations applicate)
- ✅ RLS policies attive su tutte le tabelle
- ✅ Audit log partitioned monthly + event triggers
- ✅ Privy auth flow + JWT verification server-side
- ✅ User upsert self-healing via privy_did
- ✅ AES-256-GCM encryption per Polymarket L2 API creds at-rest

### MA3 — Core Pages

- ✅ Home page (`/`) — HeroZone + MarketsSection + Sidebar
- ✅ Markets live da Polymarket Gamma API (40 featured, cache 30s)
- ✅ Event detail (`/event/[slug]`) — 5 layout dinamici (Binary, Multi-outcome, H2H Sport, Crypto Round, Multi-strike)
- ✅ Watchlist (`/watchlist`)
- ✅ Header con DesktopNav + DesktopSearch + MobileDrawer + ProfileDropdown + RealDemoToggle
- ✅ BottomNav mobile, Footer
- ✅ Design tokens Doc 13 (244 inline values → CSS vars)

### MA4 — Trading Core

#### MA4.1-4.3 (DEMO lifecycle)

- ✅ TradeWidget DEMO con tabs Mercato/Limite + quick amounts
- ✅ DEMO mode toggle in header (RealDemoToggle)
- ✅ Watchlist sync con Zustand + localStorage

#### MA4.4 — Polymarket CLOB V2 integration

- ✅ Phase A: SDK V2 read-only client + health endpoint
- ✅ Phase B: onboarding L2 API + pUSD balance + crypto AES-256-GCM
- ✅ Phase C-1+2+3: REAL trading lifecycle (sign client → CLOB post → DB)
- ✅ Phase C-4: Sell REAL + Wrap USDC.e→pUSD + clob_token_ids migration + geo-block 33 paesi

#### MA4.5 — Positions & History

- ✅ `/me/positions` con summary card (totalValue + totalPnl)
- ✅ `/me/history` storico trade
- ✅ Sell flow DEMO + REAL (REAL via CLOB V2 sign + post)

#### MA4.6 — Funding flow

- ✅ Deposit via Privy `useFundWallet` (MoonPay onramp con Apple Pay/Card)
- ✅ Withdraw 2-step (unwrap pUSD → USDC.e on-chain + link MoonPay sell-to-bank)
- ✅ FundActionsRow shared component
- ✅ Privy dashboard configurato (Polygon + USDC + MoonPay enabled)

#### MA4.7 ESTESO — Onboarding & Compliance (4 fasi)

- ✅ **Fase 1**: Geoblock middleware (`middleware.ts`) intercept `/me/*`, `/api/v1/trades/*`, `/api/v1/polymarket/*`. BLOCKED → redirect `/geo-blocked`, CLOSE_ONLY → solo sell, US/AE/IT testati live
- ✅ **Fase 2**: Polymarket account import — OnboardCard external wallet support + PolymarketImportBanner welcome one-time
- ✅ **Fase 3**: Signup flow dedicato — `/signup` + `/signup/welcome` (4-step tutorial) + `/signup/choose-mode` (REAL/DEMO) + `/login`
- ✅ **Fase 4**: Real/Demo banner globale (`DemoModeBanner.tsx`) + RealDemoToggle in header

### MA5 — Discovery & Admin

#### MA5.1 — Leaderboard + Creators UI

- ✅ `/leaderboard` 2 tab (Verified Creators + Top Polymarket Traders) + period filter
- ✅ `/creator/[creatorId]` profile pubblico con stats
- ✅ `/trader/[traderId]` External Trader profile con 4 ranks
- ✅ `/creator/apply` form Creator program con state machine (none/pending/approved/rejected)
- ✅ FollowButton reusable con optimistic update
- ✅ 7 API endpoint: leaderboard, creators/apply, creators/[id], traders/[id], follows GET/POST

#### MA5.2 base — Admin Panel foundation

- ✅ `lib/admin/auth.ts` — `requireAdmin(roles[])` server-side guard, hierarchy super_admin > admin > moderator > viewer
- ✅ `/api/v1/admin/me` — UI gating endpoint
- ✅ `/app/admin/layout.tsx` — client guard + redirect / se non admin
- ✅ `AdminSidebar` (8 group nav) + `AdminTopBar` (bordeaux distinctive)
- ✅ `/admin` Dashboard con 6 KPI card (utenti totali, active 7d, trade totali, volume + 24h, KYC pending, refund pending)
- ✅ `/admin/users` lista + search + status filter
- ✅ Feliciano inserito come `super_admin` in DB production

#### MA5.2 advanced — Admin sub-pages

- ✅ Migration 015: `app_settings` table + `creators.fee_share_override_bps`
- ✅ `/admin/fees` runtime config (Y1/Y2 builder fee + Creator share + min payout) con reason note obbligatoria
- ✅ `/admin/creators/applications` queue review approve/reject
- ✅ `/admin/audit-log` lista 200 eventi + expand JSON diff before/after
- ✅ `/admin/compliance/geo-block` lista 31 BLOCKED + 4 CLOSE_ONLY + 4 RESTRICTED_REGIONS

#### MA5.3 — User settings + Me hub

- ✅ `/me` hub dashboard con 8 link cards
- ✅ `/me/settings` (profilo: display_name, bio, lingua + preferenze: notify_push/email/telegram/profile_visible)
- ✅ `/me/notifications` lista + mark-all-read
- ✅ API: GET/PUT users/me, GET/PUT preferences, GET/PUT notifications

#### MA5 Signal AI — MVP

- ✅ `/signals` page con BETA · GRATIS badge + performance summary
- ✅ API: GET /signals (list active filtered) + GET /signals/performance (track record)
- ✅ SignalsView con SignalCard + EmptyState
- ✅ Nav link aggiunto

### MA6 base — Copy trading UI

- ✅ Migration 016: `copy_trades` table + extension `follows` (copy_active, slippage_cap_bps, bankroll_pct, max_per_trade_usdc)
- ✅ `/me/following` page con toggle copy_active + edit bankroll % + slippage cap + delete follow
- ✅ API: PUT/DELETE /api/v1/follows/[followId]
- ✅ Empty state con CTA leaderboard

### MA7 base — Telegram bot scaffolding

- ✅ Migration 017: `telegram_subscriptions` table
- ✅ `lib/telegram/bot.ts` (sendMessage, generateLinkCode, isBotEnabled)
- ✅ POST /api/v1/telegram/connect — genera link_code + bot_url deep-link
- ✅ GET /api/v1/telegram/connect — status link
- ✅ POST /api/v1/telegram/webhook — riceve update Telegram con secret verification
- ✅ 4 commands: /start [CODE], /link CODE, /status, /help

### Audit & Test

- ✅ `npm run validate`: 85/85 test passing
- ✅ `npm run build` production OK
- ✅ Smoke test E2E live: 13 routes 200/307 + 6 API public/auth + geoblock simulation US/AE/IT
- ✅ Audit completo 19 docs vs codice (subagent Explore)

### Documentation

- ✅ Doc 14 — Monetization Strategy (builder fee Y1/Y2 + Creator program 30/70 + External Traders + Auktora Pro)
- ✅ PROMPT-SPRINT-MA4.7.md, MA5.1, MA5.2, MA6
- ✅ HANDOFF-LOG aggiornato
- ✅ 9 memorie persistite in `~/.claude/projects/.../memory/`
- ✅ Doc 04 wireframe admin esteso con per-Creator override
- ✅ Doc 09 ROADMAP aggiornato con MA4.7 inserito

---

## ❌ TODO — Cosa resta da fare

### Sprint da completare

| Sprint                                                                    | Effort         | Priorità   | Note                                                                                   |
| ------------------------------------------------------------------------- | -------------- | ---------- | -------------------------------------------------------------------------------------- |
| **MA6.1** — Auto-copy session keys + relayer                              | ~1-2 settimane | MEDIA      | Schema `copy_trading_sessions` esiste; serve session keys + bot relayer + atomic batch |
| **MA7 advanced** — Notification dispatcher + Telegram premium             | ~3-5 giorni    | MEDIA      | Cron job push notifications + Stripe €5/mese flow                                      |
| **MA8 finale** — Polish + remaining admin + Auktora Pro sub               | ~2-3 settimane | MEDIA-ALTA | Vedi sotto                                                                             |
| **Phase D** (post-utenti) — WS price stream + limit orders + chart prezzi | ~1-2 settimane | BASSA      | Rinviato, dipende da feedback utenti reali                                             |

### MA8 — Specifiche pending

#### Cron jobs

- ❌ Signal AI engine (algoritmi: orderbook imbalance, final period momentum, news catalyst)
- ❌ Sync external_traders daily (top 100 wallet Polymarket via Data API)
- ❌ Notification dispatcher (push trade events ai follower via Telegram + push)
- ❌ Creator payouts mensile (1° del mese, distribuzione 30% builder fee on-chain)
- ❌ Calibration tracking (signals resolved → was_correct → realized_edge_pct)

#### Admin sub-pages mancanti (27 di 36)

**Markets (4)**:

- ❌ `/admin/markets` lista
- ❌ `/admin/markets/featured` curate drag-drop (4 sezioni)
- ❌ `/admin/markets/hidden`
- ❌ `/admin/markets/import` Polymarket slug

**Users (3)**:

- ❌ `/admin/users/banned`
- ❌ `/admin/users/kyc` review queue
- ❌ `/admin/users/refunds` queue
- ❌ `/admin/users/[id]` detail con tabs (Overview/Trades/KYC/Notifications/Audit)

**Fees (2)**:

- ❌ `/admin/fees/history` log cambi
- ❌ `/admin/fees/revenue` real-time dashboard

**Creators (3)**:

- ❌ `/admin/creators` lista verified
- ❌ `/admin/creators/[id]` detail con edit fee_share_override_bps
- ❌ `/admin/creators/payouts` queue payout
- ❌ `/admin/creators/suspended`

**Referrals (2)**: `/admin/referrals` + `/admin/referrals/payouts`

**Signals (3)**: `/admin/signals` + `/admin/signals/performance` + `/admin/signals/algos`

**Notifications (3)**: `/admin/notifications/broadcast` + `templates` + `history`

**Analytics (4)**: `/admin/analytics` + `users` (funnel) + `markets` + `revenue`

**Compliance (1)**: `/admin/compliance/aml` (AI fraud alerts queue)

**System (2)**: `/admin/system-logs` + `/admin/api-usage`

**Settings (8)**: `feature-flags` + `ab-tests` + `leaderboard-mode` + `integrations` + `team` + `payouts` + `branding`

#### User sub-pages mancanti (15 di 22)

- ❌ `/me/kyc/upload`, `/me/kyc/review`, `/me/kyc/status` (3-step wizard)
- ❌ `/me/deposit`, `/me/withdraw` (dedicated pages, oggi tutto in `/me/wallet`)
- ❌ `/me/sessions` (active session keys, dipende MA6.1)
- ❌ `/me/stats` (user stats dashboard)
- ❌ `/me/achievements`
- ❌ `/me/referrals` (link sharing + stats)
- ❌ `/me/demo/*` (parallel demo views: positions/history/wallet)
- ❌ `/me/settings/security` (sessions, MFA, change password)
- ❌ `/me/settings/billing` (subscription Auktora Pro post-MA8)
- ❌ `/me/settings/data` (export, delete account)
- ❌ `/me/settings/integrations` (Telegram premium, ecc)

#### Public pages mancanti

- ❌ `/news` (news feed integration)
- ❌ `/search` (global search markets + creators)
- ❌ `/about`, `/pricing`
- ❌ `/legal/terms`, `/legal/privacy`, `/legal/cookie`
- ❌ `/login/reset-password` flow
- ❌ `/maintenance`, `/offline`, `/install` (PWA)
- ❌ `/404`, `/500` custom pages

#### API endpoints mancanti (~45 di 80)

**Markets (6)**: list, [slug], orderbook, price-history, holders, comments, search

**Users sub-routes (5)**: balances, stats, equity-curve, calibration, onboarding-complete

**Creators (3)**: [id]/positions, [id]/trades, [id]/stats

**Traders (3)**: [id]/positions, [id]/trades, [id]/follow detail

**Leaderboard (2)**: /me, /stats

**Copy (2)**: sessions, sessions/[id] (MA6.1)

**Signals (1)**: [id] detail

**Deposit/Withdraw (2)**: deposit/moonpay-session, withdraw

**KYC (2)**: submit, status

**Referrals (1)**: /me

**Telegram (1)**: upgrade-premium

**Admin advanced (10+)**: refunds, kyc, signals, notifications/broadcast, analytics drilldown, audit-log advanced filters, ecc.

#### Features advanced

- ❌ **Signal AI engine algorithms** — implementare 3 algos:
  - Orderbook imbalance detection (delta bid/ask volume)
  - Final period momentum (last 2-5 minutes price movement)
  - News catalyst (correlation prezzi vs news external)
- ❌ **Copy trading execution** (MA6.1):
  - Privy session keys (signature pre-authorization)
  - Bot relayer atomic batch
  - Cost basis tracking on-chain
  - Modalità A (manual confirm) + Modalità B (auto-copy)
- ❌ **Telegram bot advanced**:
  - Inline keyboard "Copy this trade" buttons
  - Notification dispatcher con templates
  - /unlink command
  - Premium €5/mese flow (Stripe Connect)
- ❌ **Discord bot** (MA8 — Doc 11)
- ❌ **Auktora Pro subscription €9.99/mese** (gated by Signal AI track record validato >55% win rate, 6+ mesi)
- ❌ **i18n** — 5 lingue (EN/ES/PT/IT/FR), `messages/` folder con .json translations, integrazione next-intl o equivalente
- ❌ **PWA setup** — manifest.json, service worker, install prompt

#### Cleanup tecnico

- ❌ Database types regeneration post-migrations 015-017 (rimuovi `as any` casts in `app/api/v1/admin/fees`, `app/api/v1/telegram/*`, `app/api/v1/users/me`, `app/api/v1/follows/[followId]`)
- ❌ Smoke test E2E reale (deposit $5 con carta test → wrap pUSD → trade REAL → sell → withdraw end-to-end)
- ❌ Performance audit Lighthouse + Core Web Vitals
- ❌ Mobile UX 3-breakpoint check sistematico (post-MA5.x cumulativo)
- ❌ E2E test suite (Playwright deferred a MA8 per project rules)

#### Decisioni strategiche aperte

- ❌ **KYC Builder Profile su polymarket.com/settings** — manuale 1-time setup utente. Bloccante per Y2 30bps fees (~mese 12 da launch)
- ❌ **B2B tier** per fund/desk istituzionali (post-MA8, opzionale)
- ❌ **Token Auktora $AUK** (post-mass scale, alta regulatory risk, low priority)
- ❌ **Affiliate program** (alternativa a Creator Program, valutare se acquisition organica non basta)
- ❌ **Smoke test E2E reale** — mai eseguito completo, da fare prima del marketing launch pubblico

#### Documentation pending

- ❌ Doc 02 USER-STORIES esteso con External Traders + Polymarket import + Telegram bot
- ❌ Doc 06 DATABASE-SCHEMA aggiornato con tabelle 015-017
- ❌ Doc 07 API-DESIGN aggiornato con tutti gli endpoint shipped (35 ora)
- ❌ Doc 11 COMMUNITY-AND-BOT-STRATEGY allineato con MA7 base
- ❌ MA6.1 sprint plan dettagliato

---

## 📊 Stats

| Metrica                                   | Valore                                                           |
| ----------------------------------------- | ---------------------------------------------------------------- |
| **MVP-ready**                             | ~75%                                                             |
| **Sprint chiusi**                         | MA1-MA3 + MA4.1-4.7 + MA5.1-5.3 + MA6 base + MA7 base = **~30+** |
| **Sprint pending**                        | MA6.1 + MA7 advanced + MA8 = ~3 macro                            |
| **Routes implementate**                   | ~50/110 (45%)                                                    |
| **API endpoint**                          | ~35/80 (44%)                                                     |
| **Admin sub-pages**                       | 9/36 (25%)                                                       |
| **/me sub-pages**                         | 7/22 (32%)                                                       |
| **DB tables**                             | 39 production, 17 migrations applicate                           |
| **Test passing**                          | 85/85 ✅                                                         |
| **Commit pushati**                        | 27+ live su origin/main                                          |
| **Sprint effort total stimato remaining** | ~5-7 settimane fino a launch pubblico                            |

---

## 🟢 Live URLs

- **App**: https://auktora.com (Vercel auto-deploy)
- **Repo**: https://github.com/felifeli1983-arch/predimark-v2
- **Supabase prod**: vlrvixndaeqcxftovzmw
- **Supabase staging**: hhuwxcijarcyivwzpqfp

---

_Generato 2026-04-29 fine sessione record (8h continuativa, 6 sprint chiusi, ~75% MVP)._
