# Predimark V2 — API Design

> **Documento 7 di 10** — Engineering Layer
> Autore: Feliciano + Claude (architetto)
> Data: 25 aprile 2026
> Status: bozza v1 — API Design completo
> Predecessori: Doc 1-6
> Audience: Cowork (per implementazione frontend + backend) + integratori futuri

---

## Cos'è questo documento

Questo documento è il **contratto formale tra frontend e backend** di Predimark V2.

Definisce ESATTAMENTE:

- Tutti gli **endpoint REST** API (Next.js API routes + Supabase Edge Functions)
- I **WebSocket channels** (Polymarket WS + Supabase Realtime)
- I **payload** di request e response per ogni endpoint
- Le **convenzioni globali** (auth, errors, pagination, rate limit)
- Le **integrazioni esterne** (Polymarket, MoonPay, Telegram, Privy)

Una volta scritto, frontend e backend possono lavorare in parallelo conoscendo esattamente l'interfaccia.

---

## DECISIONI ARCHITETTURALI

| Decisione         | Scelta                                                                            |
| ----------------- | --------------------------------------------------------------------------------- |
| Naming convention | **REST resourceful con versioning**: `/api/v1/...`                                |
| Response format   | **Mix**: envelope `{data, meta}` per liste, direct per singoli                    |
| Error handling    | **HTTP status + error object structured**: `{error: {code, message, details}}`    |
| Pagination        | **Mix**: cursor per long lists (history, leaderboard), page-based per UI semplici |
| Real-time         | **WebSocket per tutto** (Polymarket WS + Supabase Realtime) con singleton manager |
| Auth              | **Privy JWT in `Authorization` header → verifica server-side → Supabase RLS**     |
| Content-Type      | **`application/json`** sempre                                                     |
| Date format       | **ISO 8601** UTC (`2026-04-25T14:30:00Z`)                                         |
| Numeric IDs       | **UUID v4** sempre (mai integer auto-increment)                                   |
| Versioning        | **`/api/v1/`** prefix. Breaking changes → `/api/v2/`                              |

---

## 1. CONVENZIONI GLOBALI

### Base URL

| Environment | URL                                    |
| ----------- | -------------------------------------- |
| Development | `http://localhost:3000/api/v1`         |
| Staging     | `https://staging.predimark.com/api/v1` |
| Production  | `https://predimark.com/api/v1`         |

### Authentication

Tutti gli endpoint protetti richiedono header:

```http
Authorization: Bearer <PRIVY_JWT>
```

Il backend:

1. Estrae JWT dall'header
2. Verifica con Privy server SDK (validità + scadenza + signature)
3. Cerca o crea utente Supabase corrispondente
4. Imposta sessione Supabase con `user_id` per RLS
5. Procede con la richiesta

**Endpoint pubblici** (no auth): listing mercati, leaderboard, profili creator pubblici, signup.

### Response format — singolo

Per endpoint che ritornano **un oggetto**:

```json
{
  "id": "uuid-here",
  "username": "theo4",
  "score": 87
}
```

Direct response, no wrapper. Più snello per casi comuni.

### Response format — lista

Per endpoint che ritornano **liste paginate**:

```json
{
  "data": [
    { "id": "uuid-1", "..." },
    { "id": "uuid-2", "..." }
  ],
  "meta": {
    "total": 1247,
    "next_cursor": "eyJpZCI6InV1aWQtMjAifQ==",
    "has_more": true
  }
}
```

### Error format

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with id xyz does not exist",
    "details": {
      "user_id": "xyz",
      "checked_in": ["users", "external_traders"]
    },
    "request_id": "req_abc123"
  }
}
```

| HTTP Code                   | Quando                            |
| --------------------------- | --------------------------------- |
| `200 OK`                    | Success                           |
| `201 Created`               | Resource creata                   |
| `204 No Content`            | Success senza body (es. delete)   |
| `400 Bad Request`           | Payload invalido                  |
| `401 Unauthorized`          | JWT mancante o invalido           |
| `403 Forbidden`             | JWT valido ma no permission       |
| `404 Not Found`             | Resource non esistente            |
| `409 Conflict`              | Conflict (es. username già preso) |
| `422 Unprocessable Entity`  | Validation failed                 |
| `429 Too Many Requests`     | Rate limit superato               |
| `500 Internal Server Error` | Errore server                     |
| `503 Service Unavailable`   | Polymarket/MoonPay down           |

### Error codes (custom)

```typescript
enum ErrorCode {
  // Auth
  AUTH_MISSING = 'AUTH_MISSING',
  AUTH_INVALID = 'AUTH_INVALID',
  AUTH_EXPIRED = 'AUTH_EXPIRED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',

  // Resources
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  MARKET_NOT_FOUND = 'MARKET_NOT_FOUND',
  CREATOR_NOT_FOUND = 'CREATOR_NOT_FOUND',

  // Validation
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  USERNAME_TAKEN = 'USERNAME_TAKEN',
  INVALID_AMOUNT = 'INVALID_AMOUNT',

  // Trading
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  MARKET_CLOSED = 'MARKET_CLOSED',
  TRADE_FAILED = 'TRADE_FAILED',

  // Geo
  GEO_BLOCKED = 'GEO_BLOCKED',
  KYC_REQUIRED = 'KYC_REQUIRED',

  // Rate limit
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // External
  POLYMARKET_API_ERROR = 'POLYMARKET_API_ERROR',
  MOONPAY_API_ERROR = 'MOONPAY_API_ERROR',

  // Generic
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
```

### Pagination — cursor-based (per long lists)

Request:

```http
GET /api/v1/leaderboard?limit=50&cursor=eyJpZCI6InV1aWQtMjAifQ==
```

Response:

```json
{
  "data": [...],
  "meta": {
    "next_cursor": "eyJpZCI6InV1aWQtNDAifQ==",
    "has_more": true
  }
}
```

Cursor è base64-encoded JSON con info per query successiva (es. `{"id": "uuid-20", "created_at": "2026-04-25T..."}`).

### Pagination — page-based (per UI semplici)

Request:

```http
GET /api/v1/notifications?page=2&per_page=20
```

Response:

```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "per_page": 20,
    "total": 87,
    "total_pages": 5
  }
}
```

### Rate limiting

Ogni endpoint ha rate limit configurato. Headers di response:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1714056000
```

| Tipo endpoint        | Rate limit            |
| -------------------- | --------------------- |
| Public (no auth)     | 60 req/min per IP     |
| Authenticated reads  | 300 req/min per user  |
| Authenticated writes | 60 req/min per user   |
| Trade execution      | 30 req/min per user   |
| Admin                | 600 req/min per admin |

Implementato via **Upstash Redis** + middleware Next.js.

### Filtering & sorting

Query params standard:

- `?filter[field]=value` — filtri (es. `?filter[category]=crypto`)
- `?sort=field` — ascending (es. `?sort=created_at`)
- `?sort=-field` — descending (es. `?sort=-volume`)
- `?fields=id,name,score` — sparse fieldsets (per performance)

---

## 2. ENDPOINT PER DOMINIO

### 2.1 — Auth

#### `POST /api/v1/auth/session`

Crea/aggiorna sessione Supabase da Privy JWT.

**Auth**: required (Privy JWT)

**Response 200**:

```json
{
  "user": {
    "id": "uuid",
    "wallet_address": "0x...",
    "username": "theo4",
    "email": "user@example.com",
    "country_code": "IT",
    "geo_block_status": "demo_only",
    "language": "it",
    "onboarding_completed": false
  },
  "session": {
    "expires_at": "2026-04-25T15:30:00Z"
  }
}
```

**Errori**:

- `401 AUTH_INVALID` — JWT non valido
- `403 GEO_BLOCKED` — paese full block

#### `POST /api/v1/auth/logout`

Invalida sessione.

**Auth**: required

**Response 204**: nessun body

---

### 2.2 — Users

#### `GET /api/v1/users/me`

Profilo dell'utente loggato.

**Auth**: required

**Response 200**: oggetto user completo (vedi `/auth/session` per schema).

#### `PATCH /api/v1/users/me`

Aggiorna profilo proprio.

**Auth**: required

**Request body**:

```json
{
  "username": "theo4",
  "display_name": "Theodore Smith",
  "bio": "Crypto trader · Sport fan",
  "avatar_url": "https://...",
  "language": "en",
  "theme": "dark"
}
```

**Response 200**: oggetto user aggiornato

**Errori**:

- `409 USERNAME_TAKEN` — username già preso

#### `GET /api/v1/users/me/balances`

Saldo USDC reale e demo.

**Auth**: required

**Response 200**:

```json
{
  "real": {
    "usdc_balance": 124.5,
    "usdc_locked": 12.3,
    "total_pnl": 245.8,
    "volume_total": 5234.2
  },
  "demo": {
    "demo_balance": 10523.4,
    "demo_locked": 0,
    "total_pnl": 523.4,
    "volume_total": 8200.0
  }
}
```

#### `GET /api/v1/users/me/positions`

Posizioni aperte dell'utente.

**Query params**:

- `is_demo` (default false)
- `filter[category]`
- `sort` (default `-opened_at`)
- `page`, `per_page` (default 20)

**Auth**: required

**Response 200**:

```json
{
  "data": [
    {
      "id": "uuid",
      "market": {
        "id": "uuid",
        "title": "Trump 2028",
        "image_url": "...",
        "category": "politics"
      },
      "side": "yes",
      "shares": 100,
      "avg_price": 0.5,
      "total_cost": 50.0,
      "current_price": 0.62,
      "current_value": 62.0,
      "unrealized_pnl": 12.0,
      "unrealized_pnl_pct": 24.0,
      "opened_at": "2026-04-22T10:00:00Z"
    }
  ],
  "meta": {
    "total_value": 832.4,
    "total_pnl": 48.2,
    "page": 1,
    "per_page": 20,
    "total": 12,
    "total_pages": 1
  }
}
```

#### `GET /api/v1/users/me/trades`

Storico trade chiusi.

**Query params**:

- `is_demo`
- `filter[type]` ('buy' | 'sell' | 'resolution')
- `filter[is_win]` (true | false)
- `filter[period]` ('today' | '7d' | '30d' | 'all')
- `cursor`, `limit` (default 50)

**Auth**: required

**Response 200**:

```json
{
  "data": [
    {
      "id": "uuid",
      "market": {...},
      "trade_type": "resolution",
      "side": "yes",
      "shares": 50,
      "price": 1.00,
      "total_amount": 50.00,
      "pnl": 28.30,
      "pnl_pct": 130.00,
      "is_win": true,
      "source": "manual",
      "executed_at": "2026-04-22T11:23:00Z"
    }
  ],
  "meta": {
    "next_cursor": "...",
    "has_more": true
  }
}
```

#### `GET /api/v1/users/me/stats`

Statistiche aggregate utente.

**Query params**:

- `period` ('7d' | '30d' | '90d' | '1y' | 'all')
- `is_demo`

**Auth**: required

**Response 200**:

```json
{
  "period": "30d",
  "metrics": {
    "total_pnl": 345.2,
    "total_pnl_pct": 28.5,
    "win_rate": 62.0,
    "avg_roi": 4.8,
    "trade_count": 487,
    "volume_total": 12450,
    "drawdown_max": -87.3,
    "drawdown_max_pct": -7.0,
    "sharpe_ratio": 1.84,
    "calibration_brier_score": 0.18,
    "calibration_ece": 8.4
  },
  "by_category": [
    { "category": "crypto", "pnl": 120, "trades": 200 },
    { "category": "sport", "pnl": 80, "trades": 150 }
  ],
  "best_trades": [{ "id": "uuid", "market_title": "Trump 2024", "pnl": 245 }],
  "worst_trades": [{ "id": "uuid", "market_title": "Lakers vs Boston", "pnl": -87 }]
}
```

#### `GET /api/v1/users/me/equity-curve`

Storia valore portfolio per grafico.

**Query params**:

- `period` ('1d' | '1w' | '1m' | '3m' | '1y' | 'all')
- `is_demo`

**Auth**: required

**Response 200**:

```json
{
  "period": "30d",
  "points": [
    { "timestamp": "2026-03-26T00:00:00Z", "value": 1000.00 },
    { "timestamp": "2026-03-27T00:00:00Z", "value": 1023.50 },
    ...
  ]
}
```

#### `GET /api/v1/users/me/calibration`

Calibration curve (differenziatore Predimark).

**Auth**: required

**Response 200**:

```json
{
  "brier_score": 0.18,
  "ece": 8.4,
  "buckets": [
    { "predicted_range": "0-10%", "actual_outcome_rate": 8.5, "trades_count": 47 },
    { "predicted_range": "10-20%", "actual_outcome_rate": 18.2, "trades_count": 32 },
    ...
  ]
}
```

#### `GET /api/v1/users/me/preferences`

Preferenze utente.

**Auth**: required

**Response 200**: oggetto `user_preferences` (vedi Doc 6 schema).

#### `PATCH /api/v1/users/me/preferences`

Aggiorna preferenze.

**Auth**: required

**Request body**: subset di campi da aggiornare.

#### `POST /api/v1/users/me/onboarding-complete`

Marca onboarding come completato.

**Auth**: required

**Response 200**: user aggiornato.

---

### 2.3 — Markets

#### `GET /api/v1/markets`

Lista mercati attivi (per home).

**Query params**:

- `filter[category]`
- `filter[card_kind]`
- `filter[is_featured]`
- `filter[is_hot]`
- `filter[tags]` (es. `?filter[tags]=election,usa`)
- `sort` (default `-volume_24h`)
- `cursor`, `limit` (default 20)

**Auth**: optional (mostra anche a non loggati)

**Response 200**:

```json
{
  "data": [
    {
      "id": "uuid",
      "polymarket_market_id": "...",
      "slug": "trump-2028",
      "title": "Will Trump win 2028?",
      "image_url": "...",
      "card_kind": "binary",
      "category": "politics",
      "tags": ["election", "usa"],
      "current_yes_price": 0.62,
      "current_no_price": 0.38,
      "volume_24h": 850000,
      "volume_total": 24500000,
      "resolves_at": "2028-11-05T00:00:00Z"
    }
  ],
  "meta": {
    "next_cursor": "...",
    "has_more": true
  }
}
```

#### `GET /api/v1/markets/:slug`

Dettaglio singolo mercato (o evento con N market).

**Auth**: optional

**Response 200**: oggetto market completo + array di market interni se evento.

#### `GET /api/v1/markets/:slug/orderbook`

Orderbook completo (per espansione inline).

**Query params**:

- `side` ('yes' | 'no')
- `depth` (default 10)

**Auth**: optional

**Response 200**:

```json
{
  "asks": [
    { "price": 0.68, "shares": 403.7, "total": 745.84 },
    { "price": 0.67, "shares": 320.88, "total": 471.32 }
  ],
  "bids": [
    { "price": 0.64, "shares": 276.53, "total": 176.98 },
    { "price": 0.63, "shares": 76.78, "total": 225.35 }
  ],
  "spread": 0.04,
  "mid_price": 0.66,
  "last_trade_price": 0.65
}
```

#### `GET /api/v1/markets/:slug/price-history`

Storia prezzi per chart.

**Query params**:

- `period` ('1H' | '6H' | '1D' | '1W' | '1M' | 'ALL')
- `interval` ('1m' | '5m' | '1h' | '1d')

**Auth**: optional

**Response 200**:

```json
{
  "period": "1D",
  "interval": "1h",
  "points": [
    { "timestamp": "2026-04-25T00:00:00Z", "yes_price": 0.58, "no_price": 0.42, "volume": 12000 }
  ]
}
```

#### `GET /api/v1/markets/:slug/holders`

Top holders del mercato.

**Query params**:

- `side` ('yes' | 'no')
- `limit` (default 20)

**Auth**: optional

**Response 200**:

```json
{
  "data": [
    {
      "user": {
        "id": "uuid",
        "username": "theo4",
        "is_verified": true,
        "avatar_url": "..."
      },
      "shares": 5000,
      "current_value": 3100,
      "pnl": 600
    }
  ]
}
```

#### `GET /api/v1/markets/:slug/comments`

Commenti del mercato (sia Predimark che Polymarket).

**Query params**:

- `source` ('all' | 'predimark' | 'polymarket')
- `cursor`, `limit` (default 50)

**Response 200**:

```json
{
  "data": [
    {
      "id": "uuid",
      "source": "predimark",
      "user": {...},
      "body": "Going up — RSI oversold",
      "likes_count": 23,
      "replies_count": 8,
      "created_at": "2026-04-25T13:00:00Z"
    }
  ]
}
```

#### `POST /api/v1/markets/:slug/comments`

Posta commento (solo utenti Predimark loggati).

**Auth**: required

**Request body**:

```json
{
  "body": "Going up — RSI oversold",
  "parent_comment_id": null
}
```

#### `GET /api/v1/markets/search`

Cerca mercati.

**Query params**:

- `q` (search query)
- `filter[category]`
- `limit` (default 20)

**Response 200**: lista markets matching.

---

### 2.4 — Trading (Edge Function)

#### `POST /api/v1/trades/submit`

**Edge Function**: critical, server-side signing per copy auto.

**Auth**: required

**Request body**:

```json
{
  "market_id": "uuid",
  "side": "yes",
  "amount_usdc": 5.0,
  "order_type": "market",
  "is_demo": false,

  "// Per limit orders:": "",
  "limit_price": 0.5,
  "expires_at": "2026-04-25T15:00:00Z",

  "// Per copy trade:": "",
  "source": "manual",
  "copied_from_creator_id": null,
  "copied_from_external_id": null
}
```

**Response 201**:

```json
{
  "trade_id": "uuid",
  "status": "pending",
  "polymarket_order_id": "...",
  "estimated_shares": 9.62,
  "estimated_total": 5.0,
  "fees": {
    "builder_fee": 0.025,
    "service_fee": 0
  }
}
```

**Errori**:

- `400 INVALID_AMOUNT` — amount fuori range
- `400 MARKET_CLOSED` — mercato chiuso
- `403 INSUFFICIENT_BALANCE` — saldo insufficiente
- `403 GEO_BLOCKED` — paese non permesso per real
- `503 POLYMARKET_API_ERROR` — Polymarket down

#### `POST /api/v1/trades/sell`

Vendi shares posseduti.

**Auth**: required

**Request body**:

```json
{
  "position_id": "uuid",
  "shares_to_sell": 50,
  "min_price": 0.55
}
```

**Response 201**: trade object.

#### `GET /api/v1/trades/:id`

Dettaglio singolo trade (post-execution).

**Auth**: required (utente o admin)

**Response 200**: trade completo.

---

### 2.5 — Creators

#### `GET /api/v1/creators`

Lista Verified Creators.

**Query params**:

- `filter[tier]` ('gold' | 'silver' | 'bronze' | 'rising' | 'standard')
- `filter[specialization]` (array es. `?filter[specialization]=crypto,sport`)
- `sort` (default `-score`)
- `cursor`, `limit` (default 20)

**Auth**: optional

**Response 200**:

```json
{
  "data": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "username": "theo4",
        "avatar_url": "...",
        "bio": "Crypto trader"
      },
      "score": 87,
      "tier": "gold",
      "followers_count": 487,
      "copiers_active": 124,
      "specialization": ["crypto", "sport"],
      "is_verified": true
    }
  ],
  "meta": {...}
}
```

#### `GET /api/v1/creators/:username`

Profilo pubblico Verified Creator.

**Auth**: optional

**Response 200**: oggetto creator completo + user pubblico + stats aggregate.

#### `GET /api/v1/creators/:username/positions`

Posizioni del creator (con delay 30 min applicato server-side).

**Auth**: optional

**Response 200**: lista positions (filtrate `WHERE opened_at < NOW() - INTERVAL '30 minutes'`).

#### `GET /api/v1/creators/:username/trades`

Storico trade del creator.

**Auth**: optional

**Response 200**: lista trades pubbliche.

#### `GET /api/v1/creators/:username/stats`

Stats pubbliche del creator.

**Auth**: optional

**Response 200**: simile a `/users/me/stats` ma per il creator.

#### `POST /api/v1/creators/apply`

Applica al programma Verified Creator.

**Auth**: required

**Request body**:

```json
{
  "bio_creator": "Crypto trader · Sport fan",
  "website_url": "theo4.com",
  "twitter_handle": "theo4_eth",
  "discord_handle": "theo4#1234",
  "specialization": ["crypto", "sport"],
  "show_positions": true,
  "show_history": true,
  "anonymize_amounts": false
}
```

**Response 201**:

```json
{
  "creator_id": "uuid",
  "application_status": "pending",
  "applied_at": "..."
}
```

#### `POST /api/v1/creators/:username/follow`

Segui creator.

**Auth**: required

**Request body** (opzionale):

```json
{
  "notify_new_position": true,
  "notify_position_closed": true,
  "notify_via_telegram": false
}
```

**Response 201**: follow object.

#### `DELETE /api/v1/creators/:username/follow`

Unfollow creator.

**Auth**: required

**Response 204**.

---

### 2.6 — Traders esterni Polymarket

#### `GET /api/v1/traders/:address`

Profilo Top Trader esterno.

**Auth**: optional

**Response 200**:

```json
{
  "id": "uuid",
  "wallet_address": "0x9d84...0306",
  "polymarket_nickname": "WhaleAI",
  "polymarket_pnl_total": 12300,
  "polymarket_volume_total": 234000,
  "win_rate": 52.3,
  "trades_count": 487,
  "first_seen_at": "2025-12-01T...",
  "last_trade_at": "2026-04-25T...",
  "is_external_trader": true,
  "disclaimer": "External trader · Not a Predimark partner"
}
```

#### `GET /api/v1/traders/:address/positions`

Posizioni real-time del trader esterno (no delay, sono on-chain).

**Auth**: optional

**Response 200**: lista positions da Polymarket Data API (cache 60s).

#### `GET /api/v1/traders/:address/trades`

Trade storici on-chain.

**Auth**: optional

**Response 200**: lista trades.

#### `POST /api/v1/traders/:address/follow`

Segui trader esterno.

**Auth**: required

**Response 201**: follow object.

---

### 2.7 — Leaderboard

#### `GET /api/v1/leaderboard`

Classifica unificata (Verified + External) o tab specifica.

**Query params**:

- `period` ('today' | '7d' | '30d' | 'all') — default '7d'
- `sort` ('volume' | 'profit' | 'roi' | 'win_rate' | 'sharpe') — default 'volume'
- `filter[category]`
- `filter[trader_type]` ('all' | 'verified' | 'external') — default 'all'
- `min_volume` (default 1000)
- `cursor`, `limit` (default 50)

**Auth**: optional

**Response 200**:

```json
{
  "data": [
    {
      "rank": 1,
      "trader_type": "external",
      "id": "uuid",
      "wallet_address": "0x9d84...0306",
      "polymarket_nickname": "WhaleAI",
      "avatar_url": null,
      "score": null,
      "tier": null,
      "is_verified": false,
      "metrics": {
        "volume": 234000,
        "profit": 12300,
        "roi": 5.2,
        "win_rate": 52,
        "sharpe": null
      }
    },
    {
      "rank": 2,
      "trader_type": "verified",
      "id": "uuid",
      "username": "theo4",
      "avatar_url": "...",
      "score": 87,
      "tier": "gold",
      "is_verified": true,
      "metrics": {
        "volume": 48000,
        "profit": 2400,
        "roi": 6.2,
        "win_rate": 64,
        "sharpe": 1.84
      }
    }
  ],
  "meta": {
    "total_traders": 1247,
    "total_verified": 12,
    "total_external": 1235,
    "leaderboard_mode": "unified",
    "next_cursor": "...",
    "has_more": true
  }
}
```

**Note**: `meta.leaderboard_mode` è `"unified"` o `"two_tab"` in base a admin setting.

#### `GET /api/v1/leaderboard/me`

Posizione dell'utente loggato in classifica.

**Query params**: stessi della leaderboard.

**Auth**: required

**Response 200**:

```json
{
  "rank": 487,
  "user": {
    "id": "uuid",
    "username": "feliciano",
    "avatar_url": "..."
  },
  "metrics": {
    "volume": 3240,
    "profit": 184,
    "roi": 5.7,
    "win_rate": 58,
    "sharpe": 1.2
  },
  "score": 42,
  "tier": "standard"
}
```

#### `GET /api/v1/leaderboard/stats`

Statistiche live in cima alla pagina.

**Auth**: optional

**Response 200**:

```json
{
  "volume_today": 2400000,
  "active_traders": 1247,
  "verified_creators_count": 12,
  "external_traders_count": 1235
}
```

---

### 2.8 — Copy Trading

#### `GET /api/v1/copy/sessions`

Lista session keys attive dell'utente.

**Auth**: required

**Response 200**:

```json
{
  "data": [
    {
      "id": "uuid",
      "target": {
        "type": "creator",
        "username": "theo4",
        "avatar_url": "..."
      },
      "duration_type": "30d",
      "expires_at": "2026-05-25T...",
      "status": "active",
      "budget_max_usdc": 500,
      "budget_spent_usdc": 87.3,
      "trades_executed_count": 12,
      "total_pnl": 23.4
    }
  ]
}
```

#### `POST /api/v1/copy/sessions`

Crea nuova session key.

**Auth**: required

**Request body**:

```json
{
  "target_creator_id": "uuid",
  "target_external_id": null,
  "duration_type": "30d",
  "budget_max_usdc": 500,
  "max_per_trade_usdc": 50,
  "max_trades_per_day": 10,
  "allowed_categories": ["crypto", "sport"],

  "// Per External Trader, acknowledge obbligatorio:": "",
  "external_acknowledged": false
}
```

**Response 201**:

```json
{
  "session_id": "uuid",
  "session_key_pubkey": "0x...",
  "expires_at": "2026-05-25T...",
  "privy_session_id": "..."
}
```

**Note**: per External trader serve `external_acknowledged: true`.

#### `DELETE /api/v1/copy/sessions/:id`

Revoca session immediata.

**Auth**: required

**Request body**:

```json
{
  "reason": "Changing strategy"
}
```

**Response 204**.

---

### 2.9 — Signals

#### `GET /api/v1/signals`

Lista segnali Predimark attivi.

**Query params**:

- `filter[market_id]`
- `filter[algorithm_name]`
- `filter[category]`
- `cursor`, `limit`

**Auth**: optional

**Response 200**:

```json
{
  "data": [
    {
      "id": "uuid",
      "market": {...},
      "algorithm_name": "final_period_momentum",
      "direction": "buy_up",
      "edge_pct": 14.5,
      "confidence_pct": 72,
      "predicted_probability": 0.65,
      "current_market_price": 0.51,
      "valid_until": "2026-04-25T16:15:00Z",
      "status": "active"
    }
  ]
}
```

#### `GET /api/v1/signals/:id`

Dettaglio singolo segnale con metadata algoritmico.

**Auth**: optional

**Response 200**: signal completo.

#### `GET /api/v1/signals/performance`

Performance storica algoritmi (per trasparenza pubblica).

**Query params**:

- `period` ('7d' | '30d' | 'all')
- `algorithm_name`

**Auth**: optional

**Response 200**:

```json
{
  "period": "30d",
  "algorithms": [
    {
      "name": "final_period_momentum",
      "total_signals": 487,
      "hit_rate": 64.0,
      "avg_edge_realized": 5.2,
      "calibration_error": 4.2
    }
  ]
}
```

---

### 2.10 — Notifications

#### `GET /api/v1/notifications`

Notifiche dell'utente.

**Query params**:

- `filter[is_read]`
- `filter[type]`
- `cursor`, `limit` (default 20)

**Auth**: required

**Response 200**:

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "New signal: BUY UP +14%",
      "body": "BTC up 5m round, confidence 72%",
      "type": "signal",
      "priority": "normal",
      "is_read": false,
      "cta_url": "/event/btc-up-down-5m",
      "related_market_id": "uuid",
      "created_at": "2026-04-25T..."
    }
  ],
  "meta": {
    "unread_count": 3,
    "next_cursor": "..."
  }
}
```

#### `POST /api/v1/notifications/:id/read`

Marca come letta.

**Auth**: required

**Response 204**.

#### `POST /api/v1/notifications/read-all`

Marca tutte come lette.

**Auth**: required

**Response 204**.

---

### 2.11 — Watchlist

#### `GET /api/v1/watchlist`

Mercati seguiti.

**Auth**: required

**Response 200**: lista markets con info watchlist (notify_price_change_pct, etc.).

#### `POST /api/v1/watchlist`

Aggiunge market a watchlist.

**Auth**: required

**Request body**:

```json
{
  "market_id": "uuid",
  "notify_price_change_pct": 5.0,
  "notify_signal": true,
  "notify_resolution": true
}
```

**Response 201**.

#### `DELETE /api/v1/watchlist/:market_id`

Rimuove dalla watchlist.

**Auth**: required

**Response 204**.

---

### 2.12 — Deposit / Withdraw

#### `POST /api/v1/deposit/moonpay-session`

Crea sessione MoonPay per deposit USDC.

**Auth**: required

**Request body**:

```json
{
  "amount_usd": 100
}
```

**Response 200**:

```json
{
  "moonpay_url": "https://buy.moonpay.com/...",
  "session_id": "...",
  "expires_at": "..."
}
```

#### `POST /api/v1/withdraw`

Avvia withdraw USDC.

**Auth**: required + KYC approved

**Request body**:

```json
{
  "amount_usdc": 50,
  "destination_address": "0x..."
}
```

**Response 201**:

```json
{
  "withdraw_id": "uuid",
  "status": "pending",
  "tx_hash": null
}
```

**Errori**:

- `403 KYC_REQUIRED` — KYC non approvato

---

### 2.13 — KYC

#### `POST /api/v1/kyc/submit`

Sottomette documenti KYC.

**Auth**: required

**Request body**: FormData multipart (file upload)

- `id_front`: file
- `id_back`: file
- `selfie`: file
- `address_proof`: file

**Response 201**:

```json
{
  "submission_id": "uuid",
  "status": "pending",
  "ai_check_passed": true,
  "ai_check_confidence": 92
}
```

#### `GET /api/v1/kyc/status`

Stato KYC corrente.

**Auth**: required

**Response 200**:

```json
{
  "status": "approved",
  "submitted_at": "...",
  "reviewed_at": "...",
  "rejection_reason": null
}
```

---

### 2.14 — Referrals

#### `GET /api/v1/referrals/me`

Info referral programma utente.

**Auth**: required

**Response 200**:

```json
{
  "referral_code": "FELIC2026",
  "referral_url": "https://predimark.com/?ref=FELIC2026",
  "stats": {
    "total_referrals": 12,
    "active_referrals": 8,
    "total_volume_generated": 24000,
    "total_payout_received": 24.5,
    "pending_payout": 5.2
  }
}
```

---

### 2.15 — Telegram bot

#### `POST /api/v1/telegram/connect`

Connette account Telegram.

**Auth**: required

**Request body**:

```json
{
  "telegram_chat_id": "1234567890"
}
```

**Response 200**: user preferences aggiornate.

#### `POST /api/v1/telegram/upgrade-premium`

Avvia upgrade a Telegram Premium ($5/mese).

**Auth**: required

**Response 200**:

```json
{
  "stripe_checkout_url": "https://...",
  "session_id": "..."
}
```

---

### 2.16 — Admin (protetta role-based)

Tutti gli endpoint admin sono prefissati con `/api/v1/admin/` e protetti da middleware:

```typescript
function requireAdminRole(roles: AdminRole[]) { ... }
```

Esempi principali:

#### `GET /api/v1/admin/users`

Lista tutti gli utenti (paginated).

**Auth**: admin / moderator

**Query params**:

- `filter[status]` ('active' | 'banned' | 'suspended')
- `filter[country]`
- `q` (search by username/email/address)
- `cursor`, `limit`

**Response 200**: lista users con dati admin (KYC status, balance, last activity).

#### `POST /api/v1/admin/users/:id/ban`

Banna utente.

**Auth**: admin / moderator

**Request body**:

```json
{
  "reason": "Bot activity detected",
  "duration_days": null
}
```

**Response 200**: user updated.

#### `POST /api/v1/admin/users/:id/unban`

Rimuove ban.

**Auth**: admin / super_admin

#### `POST /api/v1/admin/users/:id/refund`

Refund manuale.

**Auth**: admin / super_admin

#### `GET /api/v1/admin/markets`

Lista mercati con info admin.

**Auth**: admin

#### `POST /api/v1/admin/markets/:id/feature`

Promuove a featured.

**Auth**: admin

#### `POST /api/v1/admin/markets/:id/hide`

Nasconde dalla home.

**Auth**: admin

#### `GET /api/v1/admin/fees`

Configurazione fee corrente.

**Auth**: admin

#### `POST /api/v1/admin/fees`

Aggiorna fee runtime.

**Auth**: super_admin

**Request body**:

```json
{
  "builder_fee_pct": 0.7,
  "service_fee_external_pct": 1.0,
  "creator_revenue_share_pct": 30,
  "referral_revenue_share_pct": 20,
  "telegram_premium_price_usd": 5,
  "reason_note": "Increase builder fee due to..."
}
```

#### `GET /api/v1/admin/creators/applications`

Queue applications da review.

**Auth**: admin

#### `POST /api/v1/admin/creators/:id/approve`

Approva applicazione.

**Auth**: admin

#### `POST /api/v1/admin/creators/:id/reject`

Reject applicazione.

**Auth**: admin

#### `POST /api/v1/admin/notifications/broadcast`

Invio annuncio a tutti.

**Auth**: admin

**Request body**:

```json
{
  "audience": "all",
  "channels": ["push", "email"],
  "title": "...",
  "body": "...",
  "cta_label": "Learn more",
  "cta_url": "...",
  "schedule_at": null
}
```

#### `GET /api/v1/admin/analytics/dashboard`

KPI dashboard.

**Auth**: admin

**Response 200**:

```json
{
  "period": "24h",
  "kpis": {
    "dau": 1247,
    "volume_total": 2400000,
    "revenue_total": 12400,
    "active_users": 487,
    "signups": 47,
    "trades": 8234,
    "kyc_pending": 3,
    "refunds_pending": 1
  },
  "alerts": ["Builder fee revenue +35% spike vs 7d avg", "3 KYC pending da >48h"]
}
```

#### `GET /api/v1/admin/audit-log`

Audit log dettagliato.

**Auth**: admin

**Query params**:

- `filter[actor_id]`
- `filter[action_type]`
- `filter[target_type]`
- `period`
- `cursor`, `limit`

#### `GET /api/v1/admin/feature-flags`

Lista feature flags.

**Auth**: admin

#### `PATCH /api/v1/admin/feature-flags/:key`

Aggiorna feature flag.

**Auth**: admin

**Request body**:

```json
{
  "enabled": true,
  "rollout_percentage": 50
}
```

#### `GET /api/v1/admin/settings/leaderboard-mode`

Toggle 1-tab vs 2-tab.

**Auth**: super_admin

#### `POST /api/v1/admin/settings/leaderboard-mode`

Cambia modalità leaderboard.

**Auth**: super_admin

**Request body**:

```json
{
  "mode": "two_tab"
}
```

---

## 3. WEBSOCKET CHANNELS

### Pattern singleton manager

Riusiamo il pattern V1: 1 WebSocket connection per source, condivisa via React Context.

### 3.1 — Polymarket CLOB WebSocket

**URL**: `wss://ws-subscriptions-clob.polymarket.com/ws/`

**Topics**:

- `book` — orderbook updates per market
- `price_change` — cambi prezzo midpoint
- `last_trade_price` — ultimo trade eseguito

**Subscribe message**:

```json
{
  "type": "MARKET",
  "markets": ["market_id_1", "market_id_2"]
}
```

**Message format**:

```json
{
  "event_type": "book",
  "market": "market_id",
  "asks": [...],
  "bids": [...],
  "timestamp": 1714056000
}
```

### 3.2 — Polymarket RTDS WebSocket

**URL**: `wss://ws-live-data.polymarket.com/`

**Topics**:

- `activity` — feed live trade
- `crypto_prices` — prezzi crypto Binance source
- `crypto_prices_chainlink` — prezzi crypto Chainlink source
- `comments` — commenti real-time

**Subscribe message**:

```json
{
  "subscriptions": [
    { "topic": "crypto_prices_chainlink", "type": "subscribe", "filters": { "symbol": "btc/usd" } }
  ]
}
```

### 3.3 — Supabase Realtime

**URL**: `wss://[project-ref].supabase.co/realtime/v1/websocket`

**Channels Predimark**:

- `notifications:user_id` — notifiche per utente specifico
- `positions:user_id` — updates posizioni utente
- `comments:market_id` — commenti Predimark per market
- `leaderboard` — updates classifica (broadcasted ogni 60s)

**Subscribe pattern (client-side)**:

```typescript
const channel = supabase
  .channel(`notifications:${userId}`)
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'notifications' },
    (payload) => {
      // Handle new notification
    }
  )
  .subscribe()
```

### 3.4 — Singleton manager pattern

```typescript
// lib/ws/SingletonWS.ts
class SingletonWS {
  private static instances = new Map<string, WebSocket>()

  static getInstance(url: string): WebSocket {
    if (!this.instances.has(url)) {
      const ws = new WebSocket(url)
      ws.onopen = () => console.log(`WS ${url} connected`)
      ws.onclose = () => this.handleReconnect(url)
      this.instances.set(url, ws)
    }
    return this.instances.get(url)!
  }

  private static handleReconnect(url: string) {
    setTimeout(() => {
      this.instances.delete(url)
      this.getInstance(url) // Reconnect
    }, 1000)
  }
}
```

### 3.5 — React hooks

```typescript
// useLiveMidpoint hook
export function useLiveMidpoint(marketId: string) {
  const [midpoint, setMidpoint] = useState<number | null>(null)

  useEffect(() => {
    const ws = SingletonWS.getInstance(POLYMARKET_CLOB_WS_URL)

    ws.send(JSON.stringify({ type: 'MARKET', markets: [marketId] }))

    const handler = (event: MessageEvent) => {
      const msg = JSON.parse(event.data)
      if (msg.market === marketId && msg.event_type === 'price_change') {
        setMidpoint(msg.midpoint)
      }
    }

    ws.addEventListener('message', handler)
    return () => ws.removeEventListener('message', handler)
  }, [marketId])

  return midpoint
}
```

---

## 4. EDGE FUNCTIONS (Supabase Deno)

Le Edge Functions girano su Deno runtime e sono usate per logica server critica.

### 4.1 — `submit-trade`

Esegue trade Polymarket lato server (per copy auto + sicurezza).

**Trigger**: API call da `/api/v1/trades/submit` (per trade copy auto).

**Logic**:

1. Verifica saldo utente (real o demo)
2. Se demo: aggiorna `positions` + `trades` con flag `is_demo=true`
3. Se real:
   - Verifica geo-block
   - Build EIP-712 typed data
   - Sign con session key (per copy) o restituisci typed data al client (per manual)
   - Submit ordine via CLOB POST /order
   - Aggiorna `positions` + `trades`
   - Calcola fee (builder + service)
4. Crea notification per utente

### 4.2 — `process-deposit-webhook`

Riceve webhook MoonPay e accredita USDC.

**Trigger**: webhook MoonPay HTTP POST.

**Logic**:

1. Verifica firma webhook (signature header)
2. Trova utente da customer_id
3. Marca deposit come completato
4. Aggiorna balance USDC (refresh on-chain)
5. Crea notification "Deposit completed"

### 4.3 — `calculate-creator-payout`

Job nightly per calcolo payout settimanale Verified Creators.

**Trigger**: Supabase cron (ogni domenica 23:59 UTC).

**Logic**:

1. Per ogni Verified Creator attivo:
2. SELECT trades WHERE copied_from_creator_id = X AND executed_at IN [last week]
3. SUM(builder_fee) × 30% = payout amount
4. INSERT INTO creator_payouts (status='pending')
5. Trigger payment via USDC transfer Polygon
6. Update status='completed' + tx_hash

### 4.4 — `import-polymarket-leaderboard`

Job nightly per importare top trader Polymarket.

**Trigger**: Supabase cron (ogni 6 ore).

**Logic**:

1. Fetch Polymarket Data API `/leaderboard?limit=2000`
2. UPSERT into `external_traders` (basato su wallet_address)
3. Calcola ranking, win_rate, specialization
4. Update `last_synced_at`

### 4.5 — `calculate-user-stats`

Job ogni 5 min per stats utente.

**Trigger**: Supabase cron.

**Logic**:

1. Per ogni utente attivo (last activity <30 giorni):
2. Calcola P&L cumulato, win rate, ROI, sharpe, calibration
3. INSERT snapshot in `equity_curve` (hypertable)
4. UPDATE balances con stats cached

### 4.6 — `signal-generator`

Job ogni minuto per generare segnali.

**Trigger**: Supabase cron.

**Logic**:

1. Per ogni mercato attivo nelle categorie supportate:
2. Esegui algoritmi (final_period_momentum, RSI, mean reversion, etc.)
3. Se edge > threshold: INSERT in `signals`
4. Notifica utenti che hanno il mercato in watchlist
5. Pubblica su Telegram (free tier 5 min delay, paid real-time)

### 4.7 — `kyc-fraud-check`

Pre-screening AI dei documenti KYC.

**Trigger**: trigger Postgres ON INSERT su `kyc_submissions`.

**Logic**:

1. Per ogni nuovo KYC submission:
2. Chiama Claude API con immagini documenti
3. Verifica: ID type valid, foto matches selfie, no manipulation
4. Update `ai_check_passed`, `ai_check_confidence`
5. Se confidence > 90% e tutto OK: auto-approve (status='approved')
6. Altrimenti: flag per review manuale admin

---

## 5. EXTERNAL INTEGRATIONS

### 5.1 — Polymarket

**Base URLs**:

- Gamma API: `https://gamma-api.polymarket.com`
- CLOB: `https://clob.polymarket.com`
- Data API: `https://data-api.polymarket.com`
- WebSocket CLOB: `wss://ws-subscriptions-clob.polymarket.com/ws/`
- WebSocket RTDS: `wss://ws-live-data.polymarket.com/`

**Builder code**: hardcoded in env var `POLYMARKET_BUILDER_CODE=0xc520...92475`

**Auth**: nessuna API key per Gamma + CLOB (pubblica).

**Rate limit**: ~10 req/sec per IP (osservato V1, no documentazione ufficiale).

### 5.2 — MoonPay

**Base URL**: `https://api.moonpay.com/v3`

**Auth**: API key in header `Authorization: Api-Key <KEY>`

**Webhook**: configurato in MoonPay dashboard, chiama `/api/v1/webhooks/moonpay`

**Verifica firma**: HMAC SHA256 header `Moonpay-Signature-V2`

### 5.3 — Privy

**SDK Server**: `@privy-io/server-auth`

**Endpoints usati**:

- Verify JWT
- Get user details
- Create session keys
- Revoke session keys

**Auth**: API key + secret in env vars

### 5.4 — Telegram Bot API

**Base URL**: `https://api.telegram.org/bot<TOKEN>`

**Webhook**: `https://predimark.com/api/v1/webhooks/telegram`

**Endpoints usati**:

- `sendMessage` — invio notifiche
- `editMessageText` — update messaggio (es. signal expired)
- `setMyCommands` — registra comandi `/start`, `/watchlist`, `/signals`

### 5.5 — Stripe (futuro V1.5)

Per Stripe Connect Express + payout creator.

### 5.6 — Anthropic Claude API

**Base URL**: `https://api.anthropic.com/v1`

**Endpoints usati**:

- `/messages` — KYC document review, classificazione mercati
- Model: `claude-opus-4-7` per casi critici, `claude-haiku-4-5` per batch

---

## 6. ESEMPI DI CODICE PER COWORK

### 6.1 — Next.js API route con Privy auth

```typescript
// app/api/v1/users/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyPrivyToken } from '@/lib/privy/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  // Extract JWT from Authorization header
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: { code: 'AUTH_MISSING', message: 'Missing authorization header' } },
      { status: 401 }
    )
  }

  const token = authHeader.slice(7)

  try {
    // Verify with Privy server SDK
    const privyUser = await verifyPrivyToken(token)

    // Get or create Supabase user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', privyUser.userId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (err) {
    return NextResponse.json(
      { error: { code: 'AUTH_INVALID', message: 'Invalid token' } },
      { status: 401 }
    )
  }
}
```

### 6.2 — Edge Function pattern (Supabase Deno)

```typescript
// supabase/functions/submit-trade/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { market_id, side, amount_usdc, is_demo } = await req.json()

  // Validate
  if (!market_id || !side || !amount_usdc) {
    return new Response(JSON.stringify({ error: { code: 'VALIDATION_FAILED' } }), { status: 400 })
  }

  // Insert position + trade in transaction
  const { data, error } = await supabase.rpc('submit_trade', {
    p_market_id: market_id,
    p_side: side,
    p_amount: amount_usdc,
    p_is_demo: is_demo,
  })

  if (error) {
    return new Response(
      JSON.stringify({ error: { code: 'TRADE_FAILED', details: error.message } }),
      { status: 500 }
    )
  }

  return new Response(JSON.stringify(data), { status: 201 })
})
```

### 6.3 — React Query hook per fetch

```typescript
// hooks/useUserStats.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

export function useUserStats(period: '7d' | '30d' | '1y' = '30d') {
  return useQuery({
    queryKey: ['user-stats', period],
    queryFn: () => apiClient.get(`/users/me/stats?period=${period}`),
    staleTime: 5 * 60 * 1000, // 5 min
  })
}
```

### 6.4 — React Query mutation per trade

```typescript
// hooks/useSubmitTrade.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useSubmitTrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: SubmitTradeParams) => apiClient.post('/trades/submit', params),
    onSuccess: () => {
      // Invalidate positions, balances, history
      queryClient.invalidateQueries({ queryKey: ['positions'] })
      queryClient.invalidateQueries({ queryKey: ['balances'] })
      queryClient.invalidateQueries({ queryKey: ['trades'] })
    },
  })
}
```

### 6.5 — Rate limiting middleware

```typescript
// middleware.ts (Next.js)
import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
})

export async function middleware(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1'
  const { success, limit, remaining, reset } = await ratelimit.limit(ip)

  const response = success
    ? NextResponse.next()
    : new NextResponse(JSON.stringify({ error: { code: 'RATE_LIMIT_EXCEEDED' } }), { status: 429 })

  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', reset.toString())

  return response
}

export const config = {
  matcher: '/api/v1/:path*',
}
```

---

## 7. SECURITY BEST PRACTICES

### Input validation

Usa **Zod** per validare tutti i payload:

```typescript
import { z } from 'zod'

const SubmitTradeSchema = z.object({
  market_id: z.string().uuid(),
  side: z.enum(['yes', 'no', 'up', 'down']),
  amount_usdc: z.number().positive().max(10000),
  is_demo: z.boolean(),
  order_type: z.enum(['market', 'limit']),
  limit_price: z.number().min(0.01).max(0.99).optional(),
})

const parsed = SubmitTradeSchema.safeParse(body)
if (!parsed.success) {
  return NextResponse.json(
    { error: { code: 'VALIDATION_FAILED', details: parsed.error.flatten() } },
    { status: 422 }
  )
}
```

### CORS

Solo domini Predimark autorizzati:

```typescript
// middleware.ts
const ALLOWED_ORIGINS = [
  'https://predimark.com',
  'https://staging.predimark.com',
  'http://localhost:3000', // dev only
]
```

### CSRF

Next.js App Router gestisce CSRF automaticamente con Server Actions. Per API routes, usiamo header `X-CSRF-Token` sui POST critici.

### Audit logging

Ogni endpoint admin logga automaticamente in `audit_log` via trigger Postgres.

---

## 8. RIFERIMENTI

- **Documento 1** v3 — Vision (definisce features prodotto)
- **Documento 4** — Wireframes (definisce UX che usa queste API)
- **Documento 5** — Tech stack (architettura backend)
- **Documento 6** — Database schema (tabelle che API usano)
- **Documento 8** — Design System (prossimo)

---

## 9. CHECKLIST IMPLEMENTAZIONE

Per Cowork:

- [ ] Setup Next.js 16 con App Router
- [ ] Configurare Supabase project + migrations Doc 6
- [ ] Configurare Privy app + JWT verification
- [ ] Implementare middleware auth (Privy + Supabase)
- [ ] Implementare middleware rate limit (Upstash Redis)
- [ ] Implementare API routes per dominio (in ordine: auth → users → markets → trades → creators → leaderboard → copy → signals → notifications → admin)
- [ ] Implementare Edge Functions critiche (submit-trade, process-deposit-webhook, calculate-creator-payout, import-polymarket-leaderboard, signal-generator)
- [ ] Implementare WebSocket singleton manager + hooks
- [ ] Implementare hooks React Query per ogni endpoint
- [ ] Setup Sentry + PostHog per monitoring (free tier)
- [ ] Implementare validazione Zod per tutti i payload
- [ ] Test E2E con Playwright per flussi critici (signup → trade → withdraw)

---

_Fine Documento 7 — API Design_
_Continua con Documento 8 (Design System) nella sessione successiva_
