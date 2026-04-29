# PROMPT — Sprint MA5.1 — Leaderboard + Creators UI

> **Quando eseguire**: post-MA4.7 ESTESO (onboarding + geoblock + signup chiusi)
> **Priorità**: ALTA — prerequisito MA6 copy trading + acquisition driver per utenti che cercano top trader
> **Effort**: ~2-3 giorni (16-20h totali)

---

## Obiettivo

Implementare:

1. **Leaderboard pubblica** `/leaderboard` con 2 tab: "Verified Creators" + "Top Polymarket Traders"
2. **Creator profile pubblico** `/creator/[username]` con stats + posizioni (se opt-in show)
3. **Creator apply** `/creator/apply` form per opt-in al programma
4. **Follow button** ovunque visibile sui profili Creator + External Trader
5. **API endpoints** per leaderboard + creators + follows

Out of scope:

- Copy trading execution (rinviato a MA6)
- Creator dashboard interno (rinviato a MA6 base)
- Signal AI overlay (rinviato a MA5)

**Riferimento**: Doc 14 sezione 2 (External Traders strategy), Doc 04-4 wireframe creator, Doc 04-5 wireframe leaderboard.

---

## Audit pre-sprint (2026-04-29)

**DB pronto al 90%**:

- ✅ `creators` (mig 003): application_status, is_verified, score, tier, followers_count, copiers_active, total_earnings, is_suspended, bio_creator, twitter_handle, discord_handle, specialization[]
- ✅ `external_traders` (mig 003): wallet_address, polymarket_nickname, polymarket_pnl_total, win_rate, trades_count, rank_today/7d/30d/all_time, is_active
- ✅ `follows` (mig 005): follower*user_id, followed_creator_id OR followed_external_id, notify*\*
- ✅ `creator_payouts` (mig 005): pronto per MA6 revenue distribution

**Da aggiungere**:

- ❌ `leaderboard_cache` (snapshot pre-computed per performance) — opzionale, fase ottimizzazione

**API mancanti**: tutti gli endpoint `/api/v1/creators/*`, `/api/v1/leaderboard/*`, `/api/v1/traders/*`

---

## Fasi sprint

### Fase A — Backend API (~6h)

#### A1 — Cron job sync external_traders (~1.5h)

- [ ] `app/api/v1/cron/sync-external-traders/route.ts` (Vercel cron daily 02:00 UTC):
  - Fetch top 100 traders Polymarket via Data API: `GET /trades?limit=10000` + aggregate by wallet
  - Per ogni wallet: calcola pnl_total, volume_total, win_rate, trades_count
  - Update `external_traders` table con UPSERT su `wallet_address`
  - Set rank_today / rank_7d / rank_30d / rank_all_time
  - Marca `is_active = true` se attivo last 30d
- [ ] Vercel `vercel.json` cron config

#### A2 — Endpoint leaderboard (~2h)

- [ ] `app/api/v1/leaderboard/route.ts`:
  - Query params: `tab` (creators|external|both), `period` (today|7d|30d|all), `limit` (default 50), `offset`
  - Tab "creators": SELECT da `creators` WHERE is_verified=true ORDER BY total_earnings DESC
  - Tab "external": SELECT da `external_traders` WHERE is*active=true ORDER BY rank*{period}
  - Tab "both": UNION mixed (50/50 split)
  - Response: `{ items: [...], meta: { total, hasMore } }`
- [ ] Cache: 5min revalidate (leaderboard non cambia secondo per secondo)

#### A3 — Endpoint creators CRUD (~1.5h)

- [ ] `app/api/v1/creators/[username]/route.ts` (GET): profile pubblico
- [ ] `app/api/v1/creators/[username]/positions/route.ts` (GET): se Creator ha is_public=true e show_positions=true
- [ ] `app/api/v1/creators/[username]/trades/route.ts` (GET): se show_history=true
- [ ] `app/api/v1/creators/apply/route.ts` (POST): nuova application
  - Body: display_name, bio, twitter, discord, specialization
  - Verifica auto: query Polymarket Data API `getUserActivity(walletAddress)` → richiedi minimo **30 trade** reali
  - Se OK: INSERT `creators` con `application_status='pending'`
  - Email admin per review
- [ ] `app/api/v1/creators/[username]/follow/route.ts` (POST/DELETE): toggle follow

#### A4 — Endpoint follow + traders (~1h)

- [ ] `app/api/v1/follows/route.ts` (GET): lista follow del user corrente
- [ ] `app/api/v1/traders/[address]/route.ts` (GET): external trader profile
- [ ] `app/api/v1/traders/[address]/follow/route.ts` (POST/DELETE): toggle follow

### Fase B — Frontend pages (~6h)

#### B1 — Leaderboard page (~2h)

- [ ] `app/leaderboard/page.tsx`:
  - Hero "Top trader & Creator su Auktora"
  - Tab switcher 2-tab "Verified Creators" + "Top Polymarket Traders"
  - Period filter "Oggi" / "7 giorni" / "30 giorni" / "All-time"
  - Table desktop / Card layout mobile
  - Colonne: rank, avatar, name, win_rate, trades_count, volume, ROI, [Follow button]
- [ ] `components/leaderboard/LeaderboardTable.tsx`
- [ ] `components/leaderboard/LeaderboardCard.tsx` (mobile)
- [ ] Click row → `/creator/[username]` o `/trader/[address]`

#### B2 — Creator profile page (~2h)

- [ ] `app/creator/[username]/page.tsx`:
  - Hero: avatar, display_name, bio, twitter/discord links
  - Stats: total followers, AUM, volume 30d, win rate, avg ROI
  - Tab "Posizioni aperte" (se show_positions=true)
  - Tab "Storico trade" (se show_history=true)
  - Tab "Performance" chart ROI over time
  - CTA "Segui" / "Smetti di seguire" (post-MA6 diventa "Copia con $X")
- [ ] `app/trader/[address]/page.tsx` (External Trader, profilo simile ma read-only)
- [ ] `components/creator/CreatorHero.tsx`
- [ ] `components/creator/CreatorStats.tsx`
- [ ] `components/creator/PerformanceChart.tsx`

#### B3 — Creator apply form (~1h)

- [ ] `app/creator/apply/page.tsx`:
  - Form: display_name (required), bio, twitter_handle, discord_handle, specialization (multi-select tags)
  - Helper: "Per qualificarti devi avere minimo 30 trade reali su Polymarket"
  - Submit → API `/api/v1/creators/apply` → toast "Application inviata, ti email entro 48h"

#### B4 — Follow button reusable (~30min)

- [ ] `components/creator/FollowButton.tsx`:
  - Props: targetType ('creator' | 'external'), targetId, isFollowing
  - 2 stati: "+ Segui" / "✓ Segui (clicca per smettere)"
  - Click → POST/DELETE follow API + optimistic update
  - Mostra in: leaderboard rows, creator profile hero, trader profile hero

#### B5 — "Become Creator" link in profilo (~30min)

- [ ] `app/me/profile/page.tsx` — sezione "Auktora Creator":
  - Se non è Creator: bottone "Diventa Creator" → `/creator/apply`
  - Se Creator pending: badge "In review"
  - Se Creator verified: link a "Vedi il tuo profilo pubblico"

### Fase C — Cron + audit (~2h)

- [ ] Smoke test:
  - Cron sync popola `external_traders` con top 100 wallet
  - Leaderboard mostra creator + external in 2 tab separati
  - Click row → naviga a profile correttamente
  - Follow button toggla DB record `follows` correttamente
  - Creator apply form → entry `creators` con status=pending
- [ ] Test 3 breakpoint (mobile/tablet/desktop)
- [ ] `npm run validate` verde
- [ ] Update HANDOFF-LOG con MA5.1 chiuso
- [ ] Commit unico

---

## File da creare

**Routes** (8):

- `app/leaderboard/page.tsx`
- `app/creator/[username]/page.tsx`
- `app/creator/apply/page.tsx`
- `app/trader/[address]/page.tsx`
- `app/api/v1/cron/sync-external-traders/route.ts`
- `app/api/v1/leaderboard/route.ts`
- `app/api/v1/creators/[username]/route.ts` (+ subroutes positions, trades, follow)
- `app/api/v1/traders/[address]/route.ts` (+ follow)

**Components** (~7):

- `components/leaderboard/LeaderboardTable.tsx`
- `components/leaderboard/LeaderboardCard.tsx`
- `components/creator/CreatorHero.tsx`
- `components/creator/CreatorStats.tsx`
- `components/creator/PerformanceChart.tsx`
- `components/creator/FollowButton.tsx`
- `components/creator/CreatorApplyForm.tsx`

---

## Acceptance globale MA5.1

- [ ] `/leaderboard` mostra 2 tab funzionanti (creators + external) con filtro periodo
- [ ] `/creator/[username]` mostra profile completo con stats reali
- [ ] `/trader/[address]` mostra profile External Trader
- [ ] Follow button funzionante in leaderboard + profili
- [ ] Cron sync external_traders attivo (test su staging)
- [ ] Bottone "Diventa Creator" in `/me/profile` funzionante
- [ ] Application form crea entry `creators` pending
- [ ] Tutti i 3 breakpoint OK
- [ ] HANDOFF-LOG aggiornato

---

## Note implementazione

- **Performance leaderboard**: con 1000+ creator/external, query può diventare lenta. Considerare materialized view se rallenta
- **Polymarket Data API rate limit**: il cron daily fetch top 100 — restare sotto 1 req/sec per essere sicuri
- **Privacy creator**: rispettare `is_public`, `show_positions`, `show_history` — se false, mostrare solo stats aggregate, no trade individuali
- **External Traders moderation**: campo `is_blocked` permette admin di nascondere wallet specifici (truffe, bot evidenti) — wireup in MA5.2 admin panel
