# Predimark V2 — Database Schema

> **Documento 6 di 10** — Engineering Layer
> Autore: Feliciano + Claude (architetto)
> Data: 25 aprile 2026
> Status: bozza v1 — Schema completo Postgres + TimescaleDB
> Predecessori: Doc 1-5
> Audience: Cowork (per migrations Supabase) + DBA futuri

---

## Cos'è questo documento

Questo documento definisce lo **schema completo del database** Predimark V2 in Supabase (Postgres + TimescaleDB).

Per ogni tabella fornisce:

- **CREATE TABLE** SQL pronto per migration
- **Indici** per performance
- **RLS policies** per security
- **Note di design** e relazioni
- **Esempi di query** comuni

Cowork può usare questo doc per generare migrations Supabase con minime modifiche.

---

## DECISIONI ARCHITETTURALI

| Decisione                 | Scelta                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------- |
| REAL vs DEMO data         | **Una tabella con flag `is_demo BOOL`** (helper functions per filtri)              |
| Trader esterni Polymarket | **Tabella separata `external_traders`**                                            |
| Time-series storage       | **Equity curve + price history mercati** in TimescaleDB hypertables                |
| Audit log                 | **Tabella unica + partitioning by month**                                          |
| ID strategy               | **UUID v4** per tutti i primary key (no autoincrement)                             |
| Timestamps                | **TIMESTAMPTZ** sempre (UTC + timezone)                                            |
| Soft delete               | **`deleted_at TIMESTAMPTZ NULL`** per record con storia (users, creators, markets) |
| JSON storage              | **JSONB** per dati semi-strutturati (preferences, feature flag config)             |
| Encryption                | **pgcrypto** per dati sensibili (KYC documents metadata)                           |

---

## SCHEMA OVERVIEW — Mappa relazionale

```
┌──────────────────┐
│ auth.users       │ (gestita da Supabase Auth + Privy)
│ id (uuid)        │
│ email            │
└────────┬─────────┘
         │ 1:1
         ▼
┌──────────────────┐    ┌──────────────────────┐
│ users            │    │ external_traders     │
│ id (uuid)        │    │ id (uuid)            │
│ auth_id (fk)     │    │ wallet_address       │
│ wallet_address   │    │ polymarket_nickname  │
│ username         │    │ first_seen_at        │
│ ...              │    └──────────────────────┘
└────────┬─────────┘
         │
         ├──── 1:N ──── creators (Verified Creator profile)
         ├──── 1:N ──── positions (con is_demo flag)
         ├──── 1:N ──── trades (con is_demo flag)
         ├──── 1:N ──── balances (USDC + demo paper)
         ├──── 1:N ──── notifications
         ├──── 1:N ──── kyc_submissions
         ├──── 1:N ──── copy_trading_sessions
         ├──── 1:N ──── follows (segue creators o external traders)
         ├──── 1:N ──── referrals (è referrer di altri)
         ├──── 1:N ──── achievements_unlocked
         ├──── 1:N ──── user_preferences
         └──── 1:1 ──── admin_users (se ha ruolo admin)

┌──────────────────┐
│ markets          │ (cache mercati Polymarket)
│ id              │
│ event_id         │
│ slug             │
│ category         │
│ ...              │
└────────┬─────────┘
         │
         ├──── 1:N ──── positions
         ├──── 1:N ──── trades
         ├──── 1:N ──── signals (Predimark)
         ├──── 1:N ──── market_comments_internal
         └──── 1:N ──── price_history (TimescaleDB hypertable)

┌──────────────────┐    ┌──────────────────────┐
│ creators         │    │ creator_payouts      │
│ id (uuid)        │    │ id (uuid)            │
│ user_id (fk)     │    │ creator_id (fk)      │
│ score            │    │ amount_usdc          │
│ tier             │    │ period_start/end     │
│ ...              │    └──────────────────────┘
└────────┬─────────┘
         │
         ├──── 1:N ──── follows (chi lo segue)
         ├──── 1:N ──── copy_trading_sessions (chi lo copia)
         └──── 1:N ──── creator_payouts

┌──────────────────┐
│ audit_log        │ (partitioned by month)
│ id (uuid)        │
│ actor_id         │
│ action_type      │
│ target_type/id   │
│ before/after     │
│ created_at       │
└──────────────────┘

┌──────────────────┐    ┌──────────────────────┐
│ feature_flags    │    │ ab_tests             │
│ key              │    │ name, variants       │
│ enabled          │    │ traffic_allocation   │
│ rollout_pct      │    │ ...                  │
└──────────────────┘    └──────────────────────┘

TimescaleDB hypertables:
- equity_curve (per utente, ogni ora)
- price_history (per market, ogni minuto)
```

---

## 1. CORE TABLES — Utenti, mercati, trade

### Tabella `users`

Profilo utente Predimark. Linkato a `auth.users` di Supabase (gestito da Privy JWT).

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT UNIQUE NOT NULL,        -- Polygon address (0x...)

  -- Profile
  username TEXT UNIQUE,                        -- @username scelto dall'utente, opzionale
  display_name TEXT,                           -- Nome reale opzionale
  avatar_url TEXT,                             -- URL avatar (Supabase Storage)
  bio TEXT,                                    -- Bio max 140 char

  -- Contact
  email TEXT,                                  -- Email da Privy (può essere null per wallet-only)
  email_verified BOOLEAN DEFAULT false,
  phone TEXT,                                  -- Optional, per Telegram bot
  phone_verified BOOLEAN DEFAULT false,

  -- Geo
  country_code CHAR(2),                        -- IT, US, ES (ISO 3166)
  geo_block_status TEXT DEFAULT 'allowed',     -- 'allowed' | 'demo_only' | 'blocked'

  -- Preferences
  language CHAR(2) DEFAULT 'en',               -- en, es, pt, it, fr
  theme TEXT DEFAULT 'dark',                   -- 'dark' | 'light'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,                      -- Soft delete

  -- Status
  is_suspended BOOLEAN DEFAULT false,
  suspended_at TIMESTAMPTZ,
  suspended_reason TEXT,

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,

  CONSTRAINT username_format CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,20}$'),
  CONSTRAINT email_format CHECK (email IS NULL OR email ~ '^[^@]+@[^@]+\.[^@]+$')
);

CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_username ON users(username) WHERE username IS NOT NULL;
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_country ON users(country_code);
CREATE INDEX idx_users_active ON users(deleted_at) WHERE deleted_at IS NULL;
```

**RLS policies**:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Utente vede solo il suo profilo completo
CREATE POLICY users_select_own ON users FOR SELECT
USING (auth.uid() = auth_id);

-- Profili pubblici (Verified Creator) visibili a tutti
CREATE POLICY users_select_public ON users FOR SELECT
USING (
  id IN (SELECT user_id FROM creators WHERE is_verified = true AND is_public = true)
);

-- Solo l'utente può aggiornare il proprio profilo
CREATE POLICY users_update_own ON users FOR UPDATE
USING (auth.uid() = auth_id);

-- Admin può vedere tutti
CREATE POLICY users_admin_select ON users FOR SELECT
USING (
  (SELECT role FROM admin_users WHERE user_id = auth.uid()) IN ('admin', 'super_admin', 'moderator')
);
```

---

### Tabella `external_traders`

Top trader Polymarket esterni (non hanno account Predimark, ma sono in leaderboard).

```sql
CREATE TABLE external_traders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,         -- Polygon address

  -- Polymarket info (importati via Data API)
  polymarket_nickname TEXT,                    -- "WhaleAI" se settato dal trader
  polymarket_pnl_total NUMERIC(20, 2),         -- P&L cumulato totale (USDC)
  polymarket_volume_total NUMERIC(20, 2),      -- Volume tradato cumulato

  -- Cached metrics (refresh nightly job)
  win_rate NUMERIC(5, 2),                      -- Percentuale 0-100
  trades_count INTEGER DEFAULT 0,
  specialization TEXT[],                       -- ['crypto', 'sport'] derivato da volumi

  -- Discoverability
  rank_today INTEGER,                          -- Posizione classifica oggi
  rank_7d INTEGER,
  rank_30d INTEGER,
  rank_all_time INTEGER,

  -- Status
  is_active BOOLEAN DEFAULT true,              -- false se inactive da >30g
  is_blocked BOOLEAN DEFAULT false,            -- Admin può bloccare (es. trader scammer)

  -- Timestamps
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),     -- Quando l'abbiamo importato la prima volta
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),    -- Ultima sync con Polymarket Data API
  last_trade_at TIMESTAMPTZ,                   -- Ultimo trade visto on-chain

  CONSTRAINT wallet_format CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$')
);

CREATE INDEX idx_external_wallet ON external_traders(wallet_address);
CREATE INDEX idx_external_pnl ON external_traders(polymarket_pnl_total DESC);
CREATE INDEX idx_external_volume ON external_traders(polymarket_volume_total DESC);
CREATE INDEX idx_external_active ON external_traders(is_active) WHERE is_active = true;
CREATE INDEX idx_external_rank_today ON external_traders(rank_today) WHERE rank_today IS NOT NULL;
```

**RLS policies**:

```sql
ALTER TABLE external_traders ENABLE ROW LEVEL SECURITY;

-- Tutti possono vedere external traders (è pubblico)
CREATE POLICY external_select_all ON external_traders FOR SELECT
USING (NOT is_blocked);

-- Solo admin può modificare (es. block)
CREATE POLICY external_admin_update ON external_traders FOR ALL
USING (
  (SELECT role FROM admin_users WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
);
```

---

### Tabella `markets`

Cache locale dei mercati Polymarket (per query veloci, evitiamo di sempre hit Polymarket API).

```sql
CREATE TABLE markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Polymarket identifiers
  polymarket_market_id TEXT UNIQUE NOT NULL,   -- ID Polymarket
  polymarket_event_id TEXT NOT NULL,           -- ID evento padre
  slug TEXT UNIQUE NOT NULL,                   -- "trump-2028"

  -- Content
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,

  -- Classification
  card_kind TEXT NOT NULL,                     -- 'binary' | 'multi_outcome' | 'multi_strike' | 'h2h_sport' | 'crypto_up_down'
  category TEXT NOT NULL,                      -- 'crypto' | 'sport' | 'politics' | 'culture' | 'news' | 'geopolitics' | 'economy' | 'tech'
  tags TEXT[],                                 -- ['election', 'usa', '2028']

  -- Trading data (refreshed every 30s via cache)
  current_yes_price NUMERIC(5, 4),             -- 0.0001 - 0.9999
  current_no_price NUMERIC(5, 4),
  volume_24h NUMERIC(20, 2),
  volume_total NUMERIC(20, 2),
  liquidity NUMERIC(20, 2),

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,           -- Curated by admin
  is_hot BOOLEAN DEFAULT false,                -- Hot Now tag
  is_hidden BOOLEAN DEFAULT false,             -- Admin può nascondere

  -- Resolution
  resolution_source TEXT,                      -- "Chainlink BTC/USD", "ESPN", etc.
  resolves_at TIMESTAMPTZ,                     -- Quando il mercato chiude
  resolved_at TIMESTAMPTZ,                     -- Quando si è risolto effettivamente
  resolved_outcome TEXT,                       -- 'yes' | 'no' | outcome_id per multi

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ DEFAULT NOW()     -- Ultimo refresh cache da Polymarket
);

CREATE INDEX idx_markets_polymarket_id ON markets(polymarket_market_id);
CREATE INDEX idx_markets_event_id ON markets(polymarket_event_id);
CREATE INDEX idx_markets_slug ON markets(slug);
CREATE INDEX idx_markets_category ON markets(category);
CREATE INDEX idx_markets_card_kind ON markets(card_kind);
CREATE INDEX idx_markets_active ON markets(is_active, resolves_at) WHERE is_active = true;
CREATE INDEX idx_markets_featured ON markets(is_featured) WHERE is_featured = true;
CREATE INDEX idx_markets_hot ON markets(is_hot) WHERE is_hot = true;
CREATE INDEX idx_markets_volume ON markets(volume_24h DESC);
CREATE INDEX idx_markets_tags ON markets USING GIN (tags);
```

**RLS policies**:

```sql
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;

-- Mercati sono pubblici (eccetto hidden)
CREATE POLICY markets_select_public ON markets FOR SELECT
USING (NOT is_hidden);

-- Solo admin gestisce mercati
CREATE POLICY markets_admin_all ON markets FOR ALL
USING (
  (SELECT role FROM admin_users WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
);
```

---

### Tabella `positions` (con flag `is_demo`)

Posizioni aperte dell'utente. Una posizione = N share di un side specifico in un market.

```sql
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id),

  -- Position data
  side TEXT NOT NULL,                          -- 'yes' | 'no' | 'up' | 'down' | outcome_id per multi
  shares NUMERIC(20, 6) NOT NULL,              -- Numero share possedute
  avg_price NUMERIC(5, 4) NOT NULL,            -- Prezzo medio acquisto (0.0001-0.9999)
  total_cost NUMERIC(20, 2) NOT NULL,          -- USDC totale speso

  -- Real-time computed (aggiornati via trigger o background job)
  current_price NUMERIC(5, 4),                 -- Prezzo corrente del side
  current_value NUMERIC(20, 2),                -- shares × current_price
  unrealized_pnl NUMERIC(20, 2),               -- current_value - total_cost
  unrealized_pnl_pct NUMERIC(10, 4),           -- (current_value - total_cost) / total_cost × 100

  -- Status
  is_open BOOLEAN DEFAULT true,
  is_demo BOOLEAN NOT NULL DEFAULT false,      -- ⚠ Flag CRITICO: real vs demo

  -- Timestamps
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,

  CONSTRAINT shares_positive CHECK (shares > 0),
  CONSTRAINT price_range CHECK (avg_price > 0 AND avg_price < 1)
);

CREATE INDEX idx_positions_user ON positions(user_id);
CREATE INDEX idx_positions_user_open ON positions(user_id, is_open) WHERE is_open = true;
CREATE INDEX idx_positions_market ON positions(market_id);
CREATE INDEX idx_positions_demo ON positions(user_id, is_demo) WHERE is_open = true;
CREATE INDEX idx_positions_opened ON positions(opened_at);

-- Per query "posizioni aperte di un creator con delay 30 min"
CREATE INDEX idx_positions_delayed_view ON positions(user_id, opened_at)
  WHERE is_open = true AND is_demo = false;
```

**RLS policies**:

```sql
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

-- Utente vede solo le sue posizioni
CREATE POLICY positions_select_own ON positions FOR SELECT
USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- Posizioni Verified Creator visibili pubblicamente con delay 30 min
CREATE POLICY positions_creator_delayed_select ON positions FOR SELECT
USING (
  user_id IN (SELECT user_id FROM creators WHERE is_verified = true AND is_public = true)
  AND opened_at < NOW() - INTERVAL '30 minutes'
  AND is_demo = false
  AND is_open = true
);

-- Admin vede tutto
CREATE POLICY positions_admin_select ON positions FOR SELECT
USING (
  (SELECT role FROM admin_users WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
);

-- Solo l'utente o sistema può modificare le sue posizioni
CREATE POLICY positions_update_own ON positions FOR UPDATE
USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);
```

---

### Tabella `trades` (con flag `is_demo`)

Storia trade chiusi (sell o resolution). Ogni trade è un evento immutabile.

```sql
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id),
  position_id UUID REFERENCES positions(id),    -- Riferimento posizione di partenza

  -- Trade data
  trade_type TEXT NOT NULL,                     -- 'buy' | 'sell' | 'resolution'
  side TEXT NOT NULL,                           -- 'yes' | 'no' | etc.
  shares NUMERIC(20, 6) NOT NULL,
  price NUMERIC(5, 4) NOT NULL,                 -- Prezzo del singolo share
  total_amount NUMERIC(20, 2) NOT NULL,         -- shares × price (USDC)

  -- Fees
  builder_fee NUMERIC(20, 4),                   -- Builder fee Polymarket pagata
  service_fee NUMERIC(20, 4),                   -- Service fee 1% se copy External

  -- Result (solo per sell o resolution)
  pnl NUMERIC(20, 2),                           -- Profit/Loss realizzato
  pnl_pct NUMERIC(10, 4),                       -- ROI %
  is_win BOOLEAN,                               -- true se pnl > 0

  -- Source
  source TEXT NOT NULL DEFAULT 'manual',        -- 'manual' | 'copy_creator' | 'copy_external' | 'signal'
  copied_from_creator_id UUID REFERENCES creators(id),
  copied_from_external_id UUID REFERENCES external_traders(id),

  -- Polymarket reference
  polymarket_tx_hash TEXT,                      -- TX hash on-chain
  polymarket_order_id TEXT,                     -- Order ID CLOB

  -- Status
  is_demo BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  executed_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT shares_positive CHECK (shares > 0),
  CONSTRAINT price_range CHECK (price >= 0 AND price <= 1)
);

CREATE INDEX idx_trades_user ON trades(user_id);
CREATE INDEX idx_trades_market ON trades(market_id);
CREATE INDEX idx_trades_user_executed ON trades(user_id, executed_at DESC);
CREATE INDEX idx_trades_user_demo ON trades(user_id, is_demo);
CREATE INDEX idx_trades_source ON trades(source);
CREATE INDEX idx_trades_copy_creator ON trades(copied_from_creator_id) WHERE copied_from_creator_id IS NOT NULL;
CREATE INDEX idx_trades_copy_external ON trades(copied_from_external_id) WHERE copied_from_external_id IS NOT NULL;
CREATE INDEX idx_trades_executed ON trades(executed_at DESC);
```

**RLS policies**: simile a `positions` (utente vede i suoi, creator visibile pubblicamente, admin vede tutto).

---

### Tabella `balances`

Saldo USDC reale e demo per ogni utente.

```sql
CREATE TABLE balances (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Real balance (USDC on-chain Polygon)
  usdc_balance NUMERIC(20, 6) DEFAULT 0,        -- Cached, source of truth è on-chain
  usdc_locked NUMERIC(20, 6) DEFAULT 0,         -- USDC in ordini limit aperti
  usdc_last_synced_at TIMESTAMPTZ,

  -- Demo balance (paper money)
  demo_balance NUMERIC(20, 2) DEFAULT 10000,    -- Default $10k al signup
  demo_locked NUMERIC(20, 2) DEFAULT 0,
  demo_last_reset_at TIMESTAMPTZ,

  -- Aggregated stats (cached, refresh ogni 5 min)
  real_total_pnl NUMERIC(20, 2) DEFAULT 0,
  real_volume_total NUMERIC(20, 2) DEFAULT 0,
  demo_total_pnl NUMERIC(20, 2) DEFAULT 0,
  demo_volume_total NUMERIC(20, 2) DEFAULT 0,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_balances_user ON balances(user_id);
```

**RLS policies**: utente vede solo il proprio balance, admin vede tutti.

---

## 2. CREATOR PROGRAM TABLES

### Tabella `creators`

Verified Creators del programma Predimark.

```sql
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Application
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  application_status TEXT DEFAULT 'pending',    -- 'pending' | 'approved' | 'rejected' | 'requested_more_info'
  rejection_reason TEXT,

  -- Verified status
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  is_public BOOLEAN DEFAULT true,               -- Profilo visibile pubblicamente

  -- Profile pubblico
  bio_creator TEXT,                             -- Bio specifica per profilo creator
  website_url TEXT,
  twitter_handle TEXT,
  discord_handle TEXT,
  specialization TEXT[],                        -- ['crypto', 'sport']

  -- Privacy settings
  show_positions BOOLEAN DEFAULT true,          -- Posizioni visibili (con delay 30min)
  show_history BOOLEAN DEFAULT true,
  anonymize_amounts BOOLEAN DEFAULT false,      -- Mostra solo % invece di $

  -- Score Predimark (calcolato job nightly)
  score INTEGER,                                -- 0-100
  tier TEXT,                                    -- 'gold' | 'silver' | 'bronze' | 'rising' | 'standard'

  -- Stats cached
  followers_count INTEGER DEFAULT 0,
  copiers_active INTEGER DEFAULT 0,
  total_earnings NUMERIC(20, 2) DEFAULT 0,      -- Builder fee revenue share guadagnata

  -- Status
  is_suspended BOOLEAN DEFAULT false,
  suspended_at TIMESTAMPTZ,
  suspended_reason TEXT,

  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT score_range CHECK (score IS NULL OR (score >= 0 AND score <= 100))
);

CREATE INDEX idx_creators_user ON creators(user_id);
CREATE INDEX idx_creators_verified ON creators(is_verified) WHERE is_verified = true;
CREATE INDEX idx_creators_score ON creators(score DESC) WHERE is_verified = true;
CREATE INDEX idx_creators_application ON creators(application_status) WHERE application_status = 'pending';
CREATE INDEX idx_creators_active_public ON creators(is_verified, is_public) WHERE is_verified = true AND is_public = true;
```

---

### Tabella `creator_payouts`

Storico payout settimanali ai Verified Creators.

```sql
CREATE TABLE creator_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id),

  -- Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Calculation
  total_volume_copied NUMERIC(20, 2) NOT NULL,  -- Volume tradato dai copier
  total_builder_fee NUMERIC(20, 4) NOT NULL,    -- Builder fee generata
  revenue_share_pct NUMERIC(5, 2) DEFAULT 30,   -- 30%
  payout_amount NUMERIC(20, 4) NOT NULL,        -- 30% di builder_fee

  -- Status
  status TEXT DEFAULT 'pending',                -- 'pending' | 'processing' | 'completed' | 'failed'
  paid_at TIMESTAMPTZ,
  payment_method TEXT,                          -- 'usdc_polygon' | 'stripe_bank' (futuro)
  payment_tx_hash TEXT,                         -- Per pagamenti USDC on-chain

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payouts_creator ON creator_payouts(creator_id, period_end DESC);
CREATE INDEX idx_payouts_status ON creator_payouts(status) WHERE status IN ('pending', 'processing');
```

---

### Tabella `follows`

Chi segue chi (utente segue creator o external trader).

```sql
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Followed entity (XOR: o creator o external)
  followed_creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  followed_external_id UUID REFERENCES external_traders(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Notification preferences
  notify_new_position BOOLEAN DEFAULT true,
  notify_position_closed BOOLEAN DEFAULT true,
  notify_via_push BOOLEAN DEFAULT true,
  notify_via_telegram BOOLEAN DEFAULT false,

  CONSTRAINT exactly_one_followed CHECK (
    (followed_creator_id IS NOT NULL AND followed_external_id IS NULL) OR
    (followed_creator_id IS NULL AND followed_external_id IS NOT NULL)
  ),
  CONSTRAINT unique_follow UNIQUE (follower_user_id, followed_creator_id, followed_external_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_user_id);
CREATE INDEX idx_follows_creator ON follows(followed_creator_id) WHERE followed_creator_id IS NOT NULL;
CREATE INDEX idx_follows_external ON follows(followed_external_id) WHERE followed_external_id IS NOT NULL;
```

---

### Tabella `copy_trading_sessions`

Session keys Privy per copy trading automatico.

```sql
CREATE TABLE copy_trading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Target (XOR creator/external)
  target_creator_id UUID REFERENCES creators(id),
  target_external_id UUID REFERENCES external_traders(id),

  -- Session config
  session_key_pubkey TEXT NOT NULL,             -- Public key Privy session
  session_key_id TEXT UNIQUE NOT NULL,          -- ID interno Privy

  -- Limits
  budget_max_usdc NUMERIC(20, 2) NOT NULL,      -- Budget totale autorizzato
  budget_spent_usdc NUMERIC(20, 2) DEFAULT 0,   -- Quanto già speso
  max_per_trade_usdc NUMERIC(20, 2) NOT NULL,   -- Max singolo trade
  max_trades_per_day INTEGER DEFAULT 10,
  trades_today_count INTEGER DEFAULT 0,
  trades_today_reset_at TIMESTAMPTZ DEFAULT NOW(),

  -- Whitelist mercati (opzionale)
  allowed_categories TEXT[],                    -- Se NULL = tutti

  -- Duration
  duration_type TEXT NOT NULL,                  -- 'manual' | '24h' | '7d' | '30d' | 'indefinite'
  expires_at TIMESTAMPTZ,                       -- NULL se indefinite o manual

  -- Status
  status TEXT DEFAULT 'active',                 -- 'active' | 'expired' | 'revoked' | 'budget_exhausted'
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT,

  -- Stats
  trades_executed_count INTEGER DEFAULT 0,
  total_pnl NUMERIC(20, 2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT exactly_one_target CHECK (
    (target_creator_id IS NOT NULL AND target_external_id IS NULL) OR
    (target_creator_id IS NULL AND target_external_id IS NOT NULL)
  ),
  CONSTRAINT budget_positive CHECK (budget_max_usdc > 0),
  CONSTRAINT budget_not_exceeded CHECK (budget_spent_usdc <= budget_max_usdc)
);

CREATE INDEX idx_sessions_user ON copy_trading_sessions(user_id);
CREATE INDEX idx_sessions_active ON copy_trading_sessions(user_id, status) WHERE status = 'active';
CREATE INDEX idx_sessions_target_creator ON copy_trading_sessions(target_creator_id) WHERE target_creator_id IS NOT NULL;
CREATE INDEX idx_sessions_target_external ON copy_trading_sessions(target_external_id) WHERE target_external_id IS NOT NULL;
CREATE INDEX idx_sessions_expires ON copy_trading_sessions(expires_at) WHERE expires_at IS NOT NULL AND status = 'active';
```

---

## 3. SIGNALS & NOTIFICATIONS

### Tabella `signals`

Segnali algoritmici Predimark generati dal motore.

```sql
CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES markets(id),

  -- Signal details
  algorithm_name TEXT NOT NULL,                 -- 'final_period_momentum' | 'rsi_oversold' | 'mean_reversion'
  direction TEXT NOT NULL,                      -- 'buy_yes' | 'buy_no' | 'buy_up' | 'buy_down'
  edge_pct NUMERIC(5, 2) NOT NULL,              -- Edge previsto in % (es. +14.5)
  confidence_pct NUMERIC(5, 2) NOT NULL,        -- Confidence 0-100

  -- Predicted outcome
  predicted_probability NUMERIC(5, 4),          -- Probabilità prevista
  current_market_price NUMERIC(5, 4),           -- Prezzo mercato al momento

  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'active',                 -- 'active' | 'expired' | 'resolved' | 'invalidated'

  -- Resolution (post-event)
  resolved_at TIMESTAMPTZ,
  was_correct BOOLEAN,                          -- true se outcome corrispose
  realized_edge_pct NUMERIC(5, 2),              -- Edge effettivamente realizzato

  -- Metadata
  metadata JSONB,                               -- Dati extra dell'algoritmo

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_signals_market ON signals(market_id);
CREATE INDEX idx_signals_active ON signals(status, valid_until) WHERE status = 'active';
CREATE INDEX idx_signals_algorithm ON signals(algorithm_name);
CREATE INDEX idx_signals_created ON signals(created_at DESC);
```

**RLS**: pubblici per tutti (è un differenziatore Predimark).

---

### Tabella `notifications`

Notifiche per utenti (in-app, push, email, telegram).

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Content
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  cta_label TEXT,
  cta_url TEXT,

  -- Type & priority
  type TEXT NOT NULL,                           -- 'signal' | 'copy_trade' | 'position_update' | 'system' | 'admin_broadcast'
  priority TEXT DEFAULT 'normal',               -- 'low' | 'normal' | 'high' | 'urgent'

  -- Channels delivered
  delivered_in_app BOOLEAN DEFAULT false,
  delivered_push BOOLEAN DEFAULT false,
  delivered_email BOOLEAN DEFAULT false,
  delivered_telegram BOOLEAN DEFAULT false,

  -- Read status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Related entities
  related_market_id UUID REFERENCES markets(id),
  related_signal_id UUID REFERENCES signals(id),
  related_creator_id UUID REFERENCES creators(id),
  related_trade_id UUID REFERENCES trades(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type);
```

---

## 4. WATCHLIST & PREFERENCES

### Tabella `watchlist`

Mercati seguiti dall'utente.

```sql
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id),

  -- Notification preferences
  notify_price_change_pct NUMERIC(5, 2),        -- es. 5.0 = notifica se prezzo cambia >5%
  notify_signal BOOLEAN DEFAULT true,
  notify_resolution BOOLEAN DEFAULT true,

  added_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, market_id)
);

CREATE INDEX idx_watchlist_user ON watchlist(user_id);
CREATE INDEX idx_watchlist_market ON watchlist(market_id);
```

---

### Tabella `user_preferences`

Preferenze granulari dell'utente.

```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Interests (per personalizzare home)
  interests TEXT[] DEFAULT '{}',                -- ['crypto', 'sport', 'politics']

  -- Notification preferences globali
  notify_email BOOLEAN DEFAULT true,
  notify_push BOOLEAN DEFAULT true,
  notify_telegram BOOLEAN DEFAULT false,

  -- Telegram
  telegram_chat_id TEXT,
  telegram_premium BOOLEAN DEFAULT false,       -- $5/mese subscription
  telegram_premium_until TIMESTAMPTZ,

  -- Display preferences
  default_period_filter TEXT DEFAULT '7d',      -- 'today' | '7d' | '30d' | 'all'
  default_sort_leaderboard TEXT DEFAULT 'volume',
  default_chart_timeframe TEXT DEFAULT '1d',

  -- Onboarding state
  onboarding_step_completed INTEGER DEFAULT 0,  -- 0-4
  onboarding_skipped BOOLEAN DEFAULT false,
  show_demo_banner BOOLEAN DEFAULT true,
  show_welcome_banner BOOLEAN DEFAULT true,

  -- Privacy
  profile_visible BOOLEAN DEFAULT true,         -- Profilo visibile in leaderboard

  -- Settings JSON (extensible)
  settings JSONB DEFAULT '{}',

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prefs_user ON user_preferences(user_id);
CREATE INDEX idx_prefs_telegram ON user_preferences(telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;
```

---

## 5. KYC & COMPLIANCE

### Tabella `kyc_submissions`

Sottomissioni KYC per withdraw real money.

```sql
CREATE TABLE kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Documents (URLs encrypted in Supabase Storage)
  id_front_url TEXT NOT NULL,
  id_back_url TEXT,
  selfie_url TEXT NOT NULL,
  address_proof_url TEXT,

  -- AI fraud check
  ai_check_passed BOOLEAN,
  ai_check_confidence NUMERIC(5, 2),
  ai_check_metadata JSONB,

  -- Manual review
  status TEXT DEFAULT 'pending',                -- 'pending' | 'approved' | 'rejected' | 'requested_more_info'
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  reviewer_notes TEXT,
  rejection_reason TEXT,

  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT only_one_pending UNIQUE (user_id) DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX idx_kyc_user ON kyc_submissions(user_id);
CREATE INDEX idx_kyc_status ON kyc_submissions(status) WHERE status = 'pending';
CREATE INDEX idx_kyc_submitted ON kyc_submissions(submitted_at DESC);
```

---

### Tabella `geo_blocks`

Configurazione paesi bloccati (admin-managed).

```sql
CREATE TABLE geo_blocks (
  country_code CHAR(2) PRIMARY KEY,
  country_name TEXT NOT NULL,

  block_type TEXT NOT NULL,                     -- 'full_block' | 'demo_only' | 'kyc_required'
  reason TEXT,

  effective_from TIMESTAMPTZ DEFAULT NOW(),
  effective_until TIMESTAMPTZ,                  -- NULL = indefinite

  -- Audit
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. REFERRAL & ACHIEVEMENTS

### Tabella `referrals`

Programma referral.

```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL REFERENCES users(id),
  referred_user_id UUID UNIQUE NOT NULL REFERENCES users(id),

  referral_code TEXT NOT NULL,                  -- Codice usato dal referrato

  -- Tracking
  signed_up_at TIMESTAMPTZ DEFAULT NOW(),
  first_trade_at TIMESTAMPTZ,

  -- Revenue tracking
  total_volume_generated NUMERIC(20, 2) DEFAULT 0,
  total_fees_generated NUMERIC(20, 4) DEFAULT 0,
  total_payout_to_referrer NUMERIC(20, 4) DEFAULT 0,

  -- Validity (6 mesi)
  payout_until TIMESTAMPTZ,                     -- 6 mesi da first_trade_at
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX idx_referrals_active ON referrals(is_active) WHERE is_active = true;
```

---

### Tabella `achievements`

Catalogo achievement disponibili.

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,                     -- 'first_trade' | 'win_streak_5' | 'volume_10k'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,                                    -- Lucide icon name
  category TEXT,                                -- 'trading' | 'social' | 'streak' | 'volume' | 'special'

  -- Trigger condition (JSONB per flessibilità)
  trigger_condition JSONB NOT NULL,
  -- Es: {"type": "trade_count", "threshold": 1}
  -- Es: {"type": "win_streak", "threshold": 5}
  -- Es: {"type": "volume_total", "threshold": 10000}

  -- Rarity
  rarity TEXT DEFAULT 'common',                 -- 'common' | 'rare' | 'epic' | 'legendary'
  points INTEGER DEFAULT 10,                    -- Punti per leaderboard achievement

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabella `user_achievements`

Achievement sbloccati dall'utente.

```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id),

  unlocked_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_recent ON user_achievements(user_id, unlocked_at DESC);
```

---

## 7. ADMIN TABLES

### Tabella `admin_users`

Ruoli admin (super-admin / admin / moderator).

```sql
CREATE TABLE admin_users (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  role TEXT NOT NULL,                           -- 'super_admin' | 'admin' | 'moderator'

  -- Permessi granulari (per future estensioni)
  permissions JSONB DEFAULT '{}',

  -- MFA
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret TEXT,                              -- Encrypted

  -- Audit
  last_login_at TIMESTAMPTZ,
  ip_allowlist TEXT[],                          -- Optional IP restrictions

  added_by UUID REFERENCES users(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT role_valid CHECK (role IN ('super_admin', 'admin', 'moderator'))
);

CREATE INDEX idx_admin_users_role ON admin_users(role);
```

---

### Tabella `audit_log` (PARTITIONED)

Audit log dettagliato di tutte le azioni admin. **Partitioned by month**.

```sql
CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid(),

  -- Actor
  actor_user_id UUID NOT NULL REFERENCES users(id),
  actor_role TEXT NOT NULL,                     -- Snapshot ruolo al momento dell'azione
  actor_ip TEXT,

  -- Action
  action_type TEXT NOT NULL,                    -- 'BAN_USER' | 'UPDATE_FEE' | 'APPROVE_CREATOR' | etc.
  target_type TEXT NOT NULL,                    -- 'user' | 'market' | 'creator' | 'fee' | 'feature_flag'
  target_id UUID,

  -- Change details
  before_value JSONB,
  after_value JSONB,
  reason_note TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Partitions per mese (creiamo i prossimi 12)
CREATE TABLE audit_log_2026_05 PARTITION OF audit_log
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE audit_log_2026_06 PARTITION OF audit_log
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
-- ... etc.

-- Indici sulle partition (best practice: indici locali)
CREATE INDEX idx_audit_actor ON audit_log(actor_user_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_log(action_type, created_at DESC);
CREATE INDEX idx_audit_target ON audit_log(target_type, target_id);
```

**Job mensile**: cron job crea automaticamente la partition del mese successivo.

**RLS**:

```sql
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Solo admin può leggere audit log
CREATE POLICY audit_admin_select ON audit_log FOR SELECT
USING (
  (SELECT role FROM admin_users WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
);

-- INSERT solo via Edge Functions (service role)
-- NESSUN UPDATE o DELETE permesso (append-only)
```

---

### Tabella `feature_flags`

Feature flags runtime per rollout graduale.

```sql
CREATE TABLE feature_flags (
  key TEXT PRIMARY KEY,                         -- 'new_chart_engine' | 'copy_trading_external'
  description TEXT,

  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0,         -- 0-100 (per gradual rollout)

  -- Targeting (opzionale)
  target_audience JSONB DEFAULT '{}',
  -- Es: {"countries": ["US", "UK"], "user_segments": ["beta_testers"]}

  -- Audit
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT rollout_pct_range CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100)
);
```

---

### Tabella `ab_tests`

A/B test configuration.

```sql
CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,                    -- 'home_hero_carousel_size'
  description TEXT,

  -- Variants (JSONB)
  variants JSONB NOT NULL,
  -- Es: [{"id": "control", "weight": 50, "config": {"size": 3}}, {"id": "variant_b", "weight": 50, "config": {"size": 5}}]

  -- Tracking
  metric_tracked TEXT NOT NULL,                 -- 'click_through_rate' | 'signup_conversion' | etc.

  -- Status
  status TEXT DEFAULT 'draft',                  -- 'draft' | 'running' | 'paused' | 'ended'
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,

  -- Result
  winner_variant TEXT,
  statistical_significance NUMERIC(5, 2),

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabella `ab_test_assignments`

Tracking quale utente è in quale variant.

```sql
CREATE TABLE ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id),
  user_id UUID NOT NULL REFERENCES users(id),
  variant_id TEXT NOT NULL,

  assigned_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (test_id, user_id)
);

CREATE INDEX idx_assignments_test_user ON ab_test_assignments(test_id, user_id);
```

---

## 8. TIME-SERIES TABLES (TimescaleDB)

### Hypertable `equity_curve`

Snapshot orario del valore portfolio per ogni utente.

```sql
CREATE TABLE equity_curve (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL,

  -- Snapshot values
  total_value_usdc NUMERIC(20, 2) NOT NULL,     -- Saldo + valore posizioni aperte
  realized_pnl_total NUMERIC(20, 2) DEFAULT 0,
  unrealized_pnl_total NUMERIC(20, 2) DEFAULT 0,

  -- Demo separation
  is_demo BOOLEAN NOT NULL DEFAULT false,

  PRIMARY KEY (user_id, recorded_at, is_demo)
);

-- Convert to hypertable (TimescaleDB extension)
SELECT create_hypertable('equity_curve', 'recorded_at', chunk_time_interval => INTERVAL '7 days');

-- Compression dopo 30 giorni
ALTER TABLE equity_curve SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'user_id, is_demo'
);

SELECT add_compression_policy('equity_curve', INTERVAL '30 days');

-- Retention 1 anno (poi cancella vecchi dati)
SELECT add_retention_policy('equity_curve', INTERVAL '1 year');

CREATE INDEX idx_equity_user_time ON equity_curve(user_id, recorded_at DESC);
```

### Hypertable `price_history`

Storia prezzi mercati cached per chart.

```sql
CREATE TABLE price_history (
  market_id UUID NOT NULL REFERENCES markets(id),
  recorded_at TIMESTAMPTZ NOT NULL,

  yes_price NUMERIC(5, 4),
  no_price NUMERIC(5, 4),
  volume_period NUMERIC(20, 2),                 -- Volume in questo intervallo

  PRIMARY KEY (market_id, recorded_at)
);

SELECT create_hypertable('price_history', 'recorded_at', chunk_time_interval => INTERVAL '1 day');

-- Compression dopo 7 giorni
ALTER TABLE price_history SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'market_id'
);

SELECT add_compression_policy('price_history', INTERVAL '7 days');

-- Retention 6 mesi
SELECT add_retention_policy('price_history', INTERVAL '6 months');

CREATE INDEX idx_price_history_market ON price_history(market_id, recorded_at DESC);
```

---

## 9. INTERNAL FEATURES

### Tabella `market_comments_internal`

Commenti utenti Predimark sui mercati (non quelli Polymarket esterni).

```sql
CREATE TABLE market_comments_internal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES markets(id),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Content
  body TEXT NOT NULL,
  parent_comment_id UUID REFERENCES market_comments_internal(id),

  -- Engagement
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,

  -- Moderation
  is_hidden BOOLEAN DEFAULT false,
  hidden_by UUID REFERENCES users(id),
  hidden_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_comments_market ON market_comments_internal(market_id, created_at DESC);
CREATE INDEX idx_comments_user ON market_comments_internal(user_id);
```

---

## 10. HELPER FUNCTIONS & TRIGGERS

### Function: helper per query "real or demo"

Per evitare bug "ho dimenticato `is_demo` filter":

```sql
CREATE OR REPLACE FUNCTION user_positions(
  p_user_id UUID,
  p_is_demo BOOLEAN DEFAULT false
)
RETURNS SETOF positions AS $$
  SELECT * FROM positions
  WHERE user_id = p_user_id
    AND is_demo = p_is_demo
    AND is_open = true;
$$ LANGUAGE SQL;
```

### Trigger: auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trigger_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ... ripetere per altre tabelle
```

### Trigger: audit log automatico per cambi critici

```sql
CREATE OR REPLACE FUNCTION audit_critical_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    actor_user_id, actor_role,
    action_type, target_type, target_id,
    before_value, after_value
  ) VALUES (
    auth.uid(),
    (SELECT role FROM admin_users WHERE user_id = auth.uid()),
    TG_OP || '_' || TG_TABLE_NAME,
    TG_TABLE_NAME,
    NEW.id,
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to critical tables
CREATE TRIGGER audit_users_changes
  AFTER UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_critical_changes();
```

---

## 11. INITIAL SEED DATA

Dati di base da inserire al setup iniziale:

```sql
-- Achievement catalog
INSERT INTO achievements (key, name, description, icon, category, trigger_condition, rarity, points) VALUES
  ('first_trade', 'First Trade', 'Made your first trade', 'rocket', 'trading', '{"type": "trade_count", "threshold": 1}', 'common', 10),
  ('win_streak_5', '5 Win Streak', '5 wins in a row', 'flame', 'streak', '{"type": "win_streak", "threshold": 5}', 'rare', 50),
  ('volume_1k', '$1k Volume', 'Traded $1,000 total', 'trending-up', 'volume', '{"type": "volume_total", "threshold": 1000}', 'common', 25),
  ('volume_10k', '$10k Volume', 'Traded $10,000 total', 'trophy', 'volume', '{"type": "volume_total", "threshold": 10000}', 'rare', 100),
  ('verified_creator', 'Verified Creator', 'Approved as Verified Creator', 'badge-check', 'special', '{"type": "creator_verified"}', 'epic', 500);

-- Geo blocks default
INSERT INTO geo_blocks (country_code, country_name, block_type, reason) VALUES
  ('IT', 'Italy', 'demo_only', 'Real money trading not permitted under local regulations'),
  ('US', 'United States', 'demo_only', 'Subject to CFTC restrictions for prediction markets'),
  ('IR', 'Iran', 'full_block', 'International sanctions'),
  ('KP', 'North Korea', 'full_block', 'International sanctions'),
  ('SY', 'Syria', 'full_block', 'International sanctions');

-- Default feature flags
INSERT INTO feature_flags (key, description, enabled, rollout_percentage) VALUES
  ('demo_mode_enabled', 'Demo mode globally enabled', true, 100),
  ('copy_trading_external', 'Copy trading External Polymarket traders', true, 100),
  ('ai_signals_premium', 'Premium AI signals (paid tier)', false, 0),
  ('new_chart_engine', 'New custom SVG chart engine', true, 100);
```

---

## 12. ESEMPI DI QUERY COMUNI

### Equity curve utente ultimi 30 giorni

```sql
SELECT recorded_at, total_value_usdc
FROM equity_curve
WHERE user_id = $1
  AND is_demo = false
  AND recorded_at > NOW() - INTERVAL '30 days'
ORDER BY recorded_at;
```

### Posizioni di un creator (con delay 30 min)

```sql
SELECT p.*, m.title, m.image_url
FROM positions p
JOIN markets m ON m.id = p.market_id
WHERE p.user_id = (SELECT user_id FROM creators WHERE id = $1)
  AND p.is_open = true
  AND p.is_demo = false
  AND p.opened_at < NOW() - INTERVAL '30 minutes'
ORDER BY p.opened_at DESC;
```

### Leaderboard unificata top 50

```sql
WITH verified AS (
  SELECT
    u.id, u.username, u.avatar_url,
    'verified' as type,
    c.score, c.tier,
    b.real_volume_total as volume,
    b.real_total_pnl as pnl
  FROM users u
  JOIN creators c ON c.user_id = u.id
  JOIN balances b ON b.user_id = u.id
  WHERE c.is_verified = true AND c.is_public = true
),
external AS (
  SELECT
    e.id, e.wallet_address as username, NULL as avatar_url,
    'external' as type,
    NULL as score, NULL as tier,
    e.polymarket_volume_total as volume,
    e.polymarket_pnl_total as pnl
  FROM external_traders e
  WHERE e.is_active = true AND NOT e.is_blocked
)
SELECT * FROM verified
UNION ALL
SELECT * FROM external
ORDER BY volume DESC
LIMIT 50;
```

### Storico trade utente con calcolo win rate

```sql
SELECT
  COUNT(*) FILTER (WHERE is_win = true) as wins,
  COUNT(*) as total_trades,
  ROUND(100.0 * COUNT(*) FILTER (WHERE is_win = true) / COUNT(*), 2) as win_rate,
  SUM(pnl) as total_pnl,
  SUM(total_amount) as total_volume
FROM trades
WHERE user_id = $1
  AND is_demo = false
  AND trade_type IN ('sell', 'resolution');
```

### Calcolo creator payout settimanale

```sql
SELECT
  c.id as creator_id,
  SUM(t.total_amount) as volume_copied,
  SUM(t.builder_fee) as builder_fee_total,
  SUM(t.builder_fee) * 0.30 as payout_amount
FROM creators c
JOIN trades t ON t.copied_from_creator_id = c.id
WHERE t.executed_at >= $1  -- period_start
  AND t.executed_at < $2   -- period_end
  AND t.is_demo = false
GROUP BY c.id;
```

---

## 13. MIGRATIONS STRATEGY

### Naming convention

```
supabase/migrations/
├── 20260425000001_initial_schema.sql
├── 20260425000002_users_and_auth.sql
├── 20260425000003_markets_and_trades.sql
├── 20260425000004_creators_and_copy_trading.sql
├── 20260425000005_signals_and_notifications.sql
├── 20260425000006_admin_and_audit.sql
├── 20260425000007_timescale_hypertables.sql
└── 20260425000008_seed_data.sql
```

### Pattern best practice

1. **Idempotent migrations** (CREATE TABLE IF NOT EXISTS)
2. **Reversibili** (ogni migration ha rollback)
3. **Test su staging** prima di production
4. **Mai DROP COLUMN** in production (deprecate first, drop in V1.5)

---

## 14. DATABASE SIZING & SCALING

### Stima dimensioni tabelle (1 anno, 5k utenti attivi)

| Tabella          | Righe stimate | Dimensione stimata        |
| ---------------- | ------------- | ------------------------- |
| users            | 5,000         | 5 MB                      |
| external_traders | 5,000         | 5 MB                      |
| markets          | 50,000        | 50 MB                     |
| positions        | 500,000       | 200 MB                    |
| trades           | 5,000,000     | 2 GB                      |
| price_history    | 50,000,000    | 5 GB (compressed: 1 GB)   |
| equity_curve     | 10,000,000    | 1 GB (compressed: 200 MB) |
| audit_log        | 100,000/mese  | 50 MB/mese                |
| notifications    | 10,000,000    | 5 GB                      |
| **TOTALE**       |               | **~15 GB**                |

**Supabase Pro plan**: 8 GB DB included, $0.125/GB extra. Costo stimato: ~$1/mese in extra storage al primo anno.

### Quando dovremo scalare

- **>10k MAU**: passare a Supabase Team plan ($599/mese) per più CPU/RAM
- **>100k MAU**: considerare read replicas, sharding per user_id
- **>1M trades/giorno**: separare hot data (last 30g) da cold data (archive)

---

## 15. RIFERIMENTI

- **Documento 1** v3 — Vision (definisce architettura ibrida creator + delay 30min)
- **Documento 4** — Wireframes (definisce UX di ogni feature)
- **Documento 5** — Tech stack (Supabase + TimescaleDB)
- **Documento 7** — API design (prossimo, definisce contracts API che usano questo schema)

---

_Fine Documento 6 — Database Schema_
_Continua con Documento 7 (API Design) nella sessione successiva_
