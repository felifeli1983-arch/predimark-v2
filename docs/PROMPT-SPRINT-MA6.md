# PROMPT — Sprint MA6 — Copy Trading & Creator Program

> **Quando eseguire**: post-MA5 (signal AI in beta), serve come acquisition multiplier per Auktora
> **Priorità**: ALTA — feature differenziante vs Polymarket nativo, primo revenue stream non-trascurabile
> **Effort**: ~3 settimane totali in 2 fasi (MA6 base + MA6.1 auto-copy)

---

## Obiettivo

Permettere agli utenti di:

1. **Registrarsi come Creator** dal proprio profilo (opt-in con verifica storico trade)
2. **Seguire Creator** scelti dalla leaderboard
3. **Copiare trade in tempo reale** via push notification + 1-click confirm (Modalità A)
4. **Ricevere fee** se sei Creator: 0.3% del volume copiato dai tuoi follower (= 30% del 1% builder fee)

Out of scope MA6 base:

- Auto-copy con session keys (rinviato a MA6.1)
- Sub premium per copy trading (modello = builder fee, non subscription)
- Multi-chain (solo Polygon CLOB V2)

**Riferimento Doc 14**: Monetization Strategy (questa sprint implementa il modello copy trading lì definito).

---

## Fee model riassuntivo (vedi Doc 14 sezione 2)

- **Builder fee fissa 1%** su tutti i copy trade (vs 0.01% trade normali) — DEFAULT, configurabile da admin
- **Split**: 30% Creator (= 0.3% volume) / 70% Auktora (= 0.7% volume) — DEFAULT, configurabile da admin
- **No subscription** — fee al transaction
- Distribuzione mensile via bot on-chain (no custodial holding)

### Admin configurabile runtime

**CRITICO**: i valori fee e split NON sono hardcoded. Devono essere letti runtime da `app_settings` (singleton key-value table).

Admin può modificare da `/admin/fees` (riferimento Doc 04 wireframe admin riga 596-627):

- `copy_trading_builder_fee_bps` (default 100 = 1%)
- `copy_trading_creator_share_bps` (default 3000 = 30%, su 10000 base)
- Per-Creator override via `creators.fee_share_override_bps` (NULL = usa default globale)

Cambio fee applicato LIVE — tutti i nuovi copy trade post-modifica usano nuovi valori. Trade già committati non sono ritrocompatibili (loggati con valore corrente al momento esecuzione).

---

## Fasi sprint

### Phase 1 — DB schema (ESTENDI tabelle esistenti) + Creator opt-in (~2 giorni)

**IMPORTANTE — Audit DB pre-sprint (2026-04-29)**: la maggior parte delle tabelle copy trading **esiste già** in production (migrations 003 + 005). Schema MA6 = ESTENSIONI mirate, NON tabelle ex-novo.

#### Tabelle già esistenti (production confermato)

| Tabella                 | Status              | Note                                                                                                                                                                                                                                                                                      |
| ----------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `creators`              | ✅ Esiste (mig 003) | Schema completo: application_status, is_verified, score, tier, followers_count, copiers_active, total_earnings, is_suspended, is_public, bio_creator, twitter_handle, discord_handle, specialization[], show_positions/history/anonymize_amounts. **MANCA solo `fee_share_override_bps`** |
| `creator_payouts`       | ✅ Esiste (mig 005) | period_start/end, total_volume_copied, total_builder_fee, **`revenue_share_pct DEFAULT 30`** 🎯, payout_amount, status, payment_method, payment_tx_hash. **PERFETTO, no modifiche**                                                                                                       |
| `follows`               | ✅ Esiste (mig 005) | follower_user_id, followed_creator_id OR followed_external_id, notify_new_position, notify_position_closed, notify_via_push, notify_via_telegram. **Usalo come "subscription" — NO bisogno di nuova `copy_subscriptions`**. MANCA solo: slippage_cap_bps, max_per_trade, bankroll_pct     |
| `copy_trading_sessions` | ✅ Esiste (mig 005) | **GIÀ PRONTO PER MA6.1 AUTO-COPY**: session_key_pubkey, session_key_id, budget_max_usdc, budget_spent_usdc, max_per_trade_usdc, max_trades_per_day, allowed_categories, duration_type, expires_at, status, revoked_at. NO modifiche per MA6 base                                          |
| `external_traders`      | ✅ Esiste (mig 003) | wallet_address, polymarket_nickname, polymarket_pnl_total, win_rate, trades_count, specialization[], rank_today/7d/30d/all_time, is_active, is_blocked, last_synced_at, last_trade_at. **Usalo per copy senza opt-in (vedi Doc 14 sez 2 External Traders)**                               |

#### Migration MA6 (solo tabelle nuove + ALTER mirate)

```sql
-- 015_app_settings: configurazione runtime modificabile da admin (singleton key-value)
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

INSERT INTO app_settings (key, value, description) VALUES
  ('copy_trading_builder_fee_bps', '100', 'Builder fee copy trades in basis points (100 = 1%)'),
  ('copy_trading_creator_share_bps', '3000', 'Creator revenue share su builder fee in basis points (3000 = 30%)'),
  ('copy_trading_external_share_bps', '0', 'External Traders revenue share (sempre 0% — 100% Auktora)'),
  ('copy_trading_min_payout_usd', '1', 'Soglia minima payout mensile in USD'),
  ('builder_fee_default_bps', '1', 'Builder fee trade normali in basis points (1 = 0.01%)');

-- 016_creators_fee_override: campo per override per-Creator (admin only)
ALTER TABLE creators ADD COLUMN fee_share_override_bps INTEGER;
COMMENT ON COLUMN creators.fee_share_override_bps IS 'NULL = usa default da app_settings.copy_trading_creator_share_bps; otherwise override per-Creator (super-admin only)';

-- 017_follows_copy_config: estendi follows per supportare copy trading config
ALTER TABLE follows ADD COLUMN slippage_cap_bps INTEGER DEFAULT 200;  -- 2% default
ALTER TABLE follows ADD COLUMN max_per_trade_usdc NUMERIC(20, 2);     -- NULL = no cap
ALTER TABLE follows ADD COLUMN bankroll_pct INTEGER DEFAULT 10 CHECK (bankroll_pct BETWEEN 1 AND 100);
ALTER TABLE follows ADD COLUMN copy_active BOOLEAN DEFAULT FALSE;     -- false = follow only (notifiche), true = copy attivo
COMMENT ON COLUMN follows.copy_active IS 'true = trade del trader sorgente generano copy trade per il follower; false = solo notifiche';

-- 018_copy_trades: log delle trade copiate (per analytics + revenue distribution)
CREATE TABLE copy_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id),
  creator_id UUID REFERENCES creators(user_id),       -- mutually exclusive con external_trader_id
  external_trader_id UUID REFERENCES external_traders(id),  -- mutually exclusive con creator_id
  source_trade_polymarket_order_id TEXT,              -- ordine originale del trader sorgente
  copy_trade_polymarket_order_id TEXT,                -- ordine eseguito su Polymarket per il follower
  market_id TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('YES', 'NO')),
  amount_usd NUMERIC(20, 2) NOT NULL,
  fee_total_bps INTEGER NOT NULL,                     -- snapshot config al momento esecuzione (es. 100 = 1%)
  fee_creator_bps INTEGER NOT NULL,                   -- 0 se external_trader, otherwise creator share
  fee_auktora_bps INTEGER NOT NULL,                   -- complementare (1000 - fee_creator_bps)
  fee_total_usd NUMERIC(20, 4) NOT NULL,
  fee_creator_usd NUMERIC(20, 4) NOT NULL,            -- $0 se External Trader
  fee_auktora_usd NUMERIC(20, 4) NOT NULL,            -- 100% fee se External Trader
  executed_price NUMERIC(10, 6),
  source_executed_price NUMERIC(10, 6),               -- prezzo del trader sorgente
  slippage_bps INTEGER,                               -- (executed - source_price) / source_price
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled', 'failed', 'aborted_slippage', 'aborted_high_impact')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((creator_id IS NOT NULL) != (external_trader_id IS NOT NULL))  -- exactly one of the two
);

CREATE INDEX idx_copy_trades_follower ON copy_trades(follower_id, created_at DESC);
CREATE INDEX idx_copy_trades_creator ON copy_trades(creator_id, created_at DESC) WHERE creator_id IS NOT NULL;
CREATE INDEX idx_copy_trades_external ON copy_trades(external_trader_id, created_at DESC) WHERE external_trader_id IS NOT NULL;
CREATE INDEX idx_copy_trades_status ON copy_trades(status);

-- RLS policies (allinea pattern esistente)
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_trades ENABLE ROW LEVEL SECURITY;

-- app_settings: read public, write admin only
CREATE POLICY "app_settings_read_all" ON app_settings FOR SELECT USING (true);
CREATE POLICY "app_settings_write_admin" ON app_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- copy_trades: follower vede i propri, creator vede i propri ricevuti
CREATE POLICY "copy_trades_follower_read" ON copy_trades FOR SELECT USING (follower_id = auth.uid());
CREATE POLICY "copy_trades_creator_read" ON copy_trades FOR SELECT USING (
  creator_id IN (SELECT user_id FROM creators WHERE user_id = auth.uid())
);
```

#### Creator opt-in flow

- [ ] `app/me/profile/become-creator/page.tsx`:
  - Form: display_name (required), bio, twitter, telegram
  - Verifica auto: query Polymarket Data API `getUserActivity(walletAddress)` → richiedi minimo **30 trade** reali on-chain
  - Click "Diventa Creator" → INSERT `creators` con `status='pending'`
  - Modal conferma: "Riceverai 0.3% del volume copiato dai tuoi follower. Fee distribuita on-chain ogni 1° del mese."
- [ ] Auto-verify: cron job giornaliero → check status `pending` → se 30+ trade verificati → `status='verified'`, manda welcome email

**Acceptance**: utente con 30+ trade reali può registrarsi come Creator, vede pannello stats, è discoverable in leaderboard.

### Phase 2 — Creator profile + leaderboard (~3 giorni)

- [ ] `app/creator/[userId]/page.tsx`:
  - Hero: avatar, display_name, bio, twitter/telegram links
  - Stats: total followers, AUM totale (sum bankroll dei follower), volume 30d, revenue 30d, win rate, avg ROI
  - Tab "Trade recenti" (ultimi 50 trade Creator on Polymarket)
  - Tab "Performance" (chart ROI over time, win rate breakdown)
  - CTA principale: "Segui per copy trading" (apre modal subscription setup)
- [ ] `app/leaderboard/page.tsx`:
  - Tab "Per volume", "Per ROI", "Per follower count"
  - Tabella: rank, avatar, name, stats, bottone "Segui"
  - Filtri: "Ultimi 30gg" / "Ultimi 7gg" / "All-time"
  - Mobile: card layout invece tabella

**Acceptance**: utente può navigare la leaderboard, cliccare un Creator, vedere stats dettagliate, decidere se seguire.

### Phase 3 — Subscription setup + bankroll config (~2 giorni)

- [ ] `components/copy/SubscribeModal.tsx`:
  - Slider "% del mio bankroll per ogni trade" (default 10%, range 1-100%)
  - Slider "Slippage cap" (default 2%, range 1-10%)
  - Input "Max USD per singolo trade" (optional, default no cap)
  - Preview: "Se Creator mette 10% del suo bankroll su un trade, tu metterai 10% del tuo (= $X)"
  - Conferma → INSERT `copy_subscriptions`
- [ ] `app/me/copy-subscriptions/page.tsx`:
  - Lista active subscriptions con stats (volume copiato, fee pagate, ROI)
  - Toggle "Attiva/Pausa" per ogni Creator
  - Bottone "Modifica" → riapre modal setup

**Acceptance**: utente può seguire un Creator, configurare bankroll % + slippage, vedere subscriptions attive, metterle in pausa.

### Phase 4 — Copy execution Modalità A (manual confirm) (~5 giorni)

#### Backend: trade detection + push

- [ ] `lib/polymarket/trade-watcher.ts`:
  - WebSocket subscription a Polymarket User Activity API per ogni Creator verified
  - Quando Creator esegue un trade → INSERT in `creator_trades` (nuova tabella o esistente)
  - Trigger event: notifica tutti i follower attivi
- [ ] `app/api/v1/copy/notify/route.ts`:
  - Per ogni follower attivo del Creator:
    - Calcola amount = follower.bankroll × bankroll_pct
    - Verifica orderbook depth → se ordine Creator > 30% depth → flag `high_impact: true`
    - Crea record `copy_trades` con `status='pending'`
    - Push notification (web push API + email fallback) con CTA "Copia ora"

#### Frontend: confirm UI

- [ ] `components/copy/PendingCopyToast.tsx` (toast top-right, persistente):
  - Mostrato quando arriva push: "TraderX ha comprato YES su [market] @ $0.32"
  - Preview: "Copia con $100 (10% del tuo bankroll). Fee 1% = $1.00"
  - Bottoni "Copia ora" / "Salta"
  - Auto-dismiss dopo 5 minuti se ignorato
- [ ] `app/api/v1/copy/execute/route.ts`:
  - User click "Copia ora" → backend crea ordine Polymarket V2 con `builderFeeBps: 100` (1%)
  - Esegue ordine, trackbacks slippage vs creator_price
  - Se slippage > slippage_cap → abort, marca `status='aborted_slippage'`
  - Se OK → marca `status='confirmed'`, calcola fee split, INSERT log

**Acceptance**: Creator esegue trade → entro 5 sec follower riceve toast → 1-click conferma → trade copiato su Polymarket con builder fee 1%.

### Phase 5 — Revenue distribution + payout (~2 giorni)

- [ ] `app/api/v1/cron/creator-payouts/route.ts` (cron Vercel, 1° del mese 00:00 UTC):
  - SELECT da `copy_trades` aggregato per Creator (mese precedente, status='confirmed')
  - Calcola total_fee_creator per ogni Creator
  - Per ogni Creator con balance > $1 (minimum payout): on-chain transfer pUSD da Auktora wallet → Creator wallet
  - INSERT `creator_payouts` con `payout_tx_hash`
  - Email notification al Creator: "Hai ricevuto $X dal copy trading"
- [ ] `app/me/profile/creator-earnings/page.tsx`:
  - Tabella storico payout (period, volume, fee, tx hash → polygonscan link)
  - Pending balance (fee accumulate del mese corrente, pagate al 1°)

**Acceptance**: il 1° di ogni mese, Creator riceve pUSD on-chain corrispondenti al 30% del volume copiato. Auktora trattiene 70%.

### Phase 6 — Edge cases + safety (~2 giorni)

- [ ] **High-impact detection**: in `trade-watcher.ts`, quando Creator esegue ordine > 30% depth orderbook → marca `high_impact: true`, push include warning "⚠️ Slippage atteso 5%+"
- [ ] **Hard slippage rule**: in `copy/execute`, se slippage atteso > 10% → abort automatico anche se cap utente più alto, marca `status='aborted_high_impact'`
- [ ] **Anti-front-running**: aggiungere delay random 100-500ms tra notifica follower e esecuzione (riduce sandwich attack risk)
- [ ] **Creator suspension**: se Creator viola TOS (es. wash trading) → admin imposta `status='suspended'` → tutte subscriptions vanno in pausa, fee accumulate paid out, no nuovi follow
- [ ] **Audit log**: ogni state change (creator status, subscription toggle, payout) in `audit_log` table esistente

---

## File da creare/modificare

### Nuovi

- Migration: `supabase/migrations/YYYYMMDD_creators_copy_trading.sql`
- `app/me/profile/become-creator/page.tsx`
- `app/creator/[userId]/page.tsx`
- `app/leaderboard/page.tsx`
- `app/me/copy-subscriptions/page.tsx`
- `app/me/profile/creator-earnings/page.tsx`
- `app/api/v1/copy/notify/route.ts`
- `app/api/v1/copy/execute/route.ts`
- `app/api/v1/cron/creator-payouts/route.ts`
- `lib/polymarket/trade-watcher.ts`
- `components/copy/SubscribeModal.tsx`
- `components/copy/PendingCopyToast.tsx`

### Modificati

- `lib/polymarket/order-create.ts` — supportare `builderFeeBps` parameter
- `lib/polymarket/order-post.ts` — propagare builderFeeBps al CLOB
- `app/me/profile/page.tsx` — aggiungere "Diventa Creator" bottone se non lo è già

---

## Constants extra

Env nuovi:

- `AUKTORA_TREASURY_WALLET_ADDRESS` — wallet che paga fee mensili ai Creator
- `AUKTORA_TREASURY_PRIVATE_KEY` — chiave per cron job payout (cifrata, only in Vercel env)
- `COPY_TRADING_BUILDER_FEE_BPS=100` — 1%
- `COPY_TRADING_CREATOR_SHARE_BPS=30` — 30% del 1% = 0.3% del volume
- `COPY_TRADING_MIN_PAYOUT_USD=1` — soglia minima per payout mensile

---

## Audit post-sprint

- Smoke test E2E:
  1. User A registra come Creator (verifica auto-attiva)
  2. User B segue Creator A, configura bankroll 10%
  3. User A esegue trade $1000 su market X
  4. User B riceve toast entro 5 sec
  5. User B clicca "Copia ora" → ordine $100 (10% bankroll) eseguito su Polymarket con builder fee 1%
  6. `copy_trades` ha record con fee_total $1, fee_creator $0.30, fee_auktora $0.70
  7. 1° del mese: cron paga User A $0.30 in pUSD (tx visibile su polygonscan)
- Test edge cases:
  - Trade ad alto impatto (>30% depth) → warning mostrato, slippage cap rispettato
  - Slippage > 10% → trade auto-abortito
  - Creator senza follower → no notification spam
  - Follower con balance insufficiente → trade abort + notifica
- Trasparenza UI verificata: modal mostra split fee esplicito, link a Doc 14
- DB integrity: foreign keys, RLS policies su tutte le tabelle nuove
- Validate verde, build pulito
- Update HANDOFF-LOG con MA6 chiuso
- Memoria: aggiornare `project_copy_trading_monetization.md` con file effettivi creati

---

## MA6.1 (post-MA6) — Auto-copy con session keys + relayer

Out of scope MA6 base, ma roadmap chiara:

### Goal

Eliminare il manual confirm — bot Auktora esegue copy trade automaticamente, atomic batch simultaneo all'ordine Creator → fair price per tutti follower.

### Approccio tecnico

- **Privy session keys**: utente pre-autorizza Auktora bot a firmare ordini fino a $X/giorno per N giorni (re-conferma periodica)
- **Relayer atomic batch**: bot Auktora aggrega tutti i copy orders nello stesso block del trade Creator → submit unico bundle a Polygon
- **Slippage 0%** (fair execution garantita)

### Effort stimato

~2 settimane addizionali (design session key permission system + relayer infra + audit security)

### Quando attivare

Solo dopo MA6 base ha 6+ mesi in produzione e abbiamo metriche concrete su:

- Quanti utenti vorrebbero auto-copy (survey)
- Tasso di "miss" da slippage in Modalità A (se >30%, auto-copy diventa critico)
- Gestione legal/regulatory di custodial-like operations
