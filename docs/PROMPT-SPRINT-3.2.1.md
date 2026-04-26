# PROMPT — Sprint 3.2.1 — Polymarket Gamma API client

> Copia e incolla questo prompt in Claude in VS Code.

---

## Obiettivo

Costruire il layer di integrazione con la Polymarket Gamma API. Questo layer è la base di tutto MA3: senza di lui non esistono EventCard, Home page, pagine evento.

Nessuna UI in questo sprint — solo logica, types, e test.

---

## Struttura da creare

```
lib/polymarket/
  types.ts          ← TypeScript types per le response Gamma API
  client.ts         ← fetch wrapper con retry, timeout, cache headers
  queries.ts        ← funzioni query (searchEvents, getEventBySlug, ecc.)
  mappers.ts        ← trasforma GammaEvent → AuktoraEvent (tipo interno)
```

---

## 1. `lib/polymarket/types.ts`

Definisci i tipi TypeScript per le response della Gamma API di Polymarket.

**Base URL**: `https://gamma-api.polymarket.com`

Tipi da definire:

```typescript
// Mercato singolo (outcome di un evento)
export interface GammaMarket {
  id: string
  question: string
  conditionId: string
  slug: string
  resolutionSource: string
  endDate: string // ISO date string
  liquidity: string // numero come stringa
  startDate: string
  image: string
  icon: string
  description: string
  outcomes: string // JSON array stringificato: '["Yes","No"]'
  outcomePrices: string // JSON array stringificato: '["0.72","0.28"]'
  volume: string
  active: boolean
  closed: boolean
  archived: boolean
  new: boolean
  featured: boolean
  restricted: boolean
  groupItemTitle: string
  groupItemThreshold: string
  questionID: string
  enableOrderBook: boolean
  orderPriceMinTickSize: number
  orderMinSize: number
  volumeNum: number
  liquidityNum: number
  clobTokenIds: string // JSON array stringificato
  acceptingOrders: boolean
  acceptingOrdersTimestamp: string
  cyom: boolean // create your own market
  competitive: number
  pagerDutyNotificationEnabled: boolean
  makerBaseFeeRate: number
  takerBaseFeeRate: number
  spread: number
  lastTradePrice: number
  bestBid: number
  bestAsk: number
  automaticallyActive: boolean
}

// Evento (contenitore di 1 o più mercati)
export interface GammaEvent {
  id: string
  title: string
  slug: string
  description: string
  startDate: string
  endDate: string // ISO date string (quando si risolve)
  image: string
  icon: string
  active: boolean
  closed: boolean
  archived: boolean
  new: boolean
  featured: boolean
  restricted: boolean
  volume: string
  liquidity: string
  volume24hr: number
  commentCount: number
  markets: GammaMarket[]
  tags: GammTag[]
  series: GammaSeries[]
}

export interface GammTag {
  id: string
  label: string
  slug: string
}

export interface GammaSeries {
  id: string
  slug: string
  label: string
  image: string
}

// Parametri per la query degli eventi
export interface GammaEventsParams {
  limit?: number // default 20, max 100
  offset?: number
  order?: 'volume24hr' | 'volume' | 'liquidity' | 'startDate' | 'endDate'
  ascending?: boolean
  tag?: string // slug del tag
  active?: boolean
  closed?: boolean
  archived?: boolean
  featured?: boolean
  new?: boolean
  id?: string
  slug?: string
  search?: string // full-text search
}

// Risposta paginata
export interface GammaEventsResponse {
  events: GammaEvent[]
  // La Gamma API non ha un campo count — usa array length + offset per paginare
}
```

---

## 2. `lib/polymarket/client.ts`

Wrapper fetch con retry e gestione errori.

```typescript
const GAMMA_BASE = 'https://gamma-api.polymarket.com'
const DEFAULT_TIMEOUT_MS = 8000
const MAX_RETRIES = 2

export async function gammaGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: { revalidate?: number } // Next.js cache revalidation in secondi
): Promise<T>
```

Requisiti:

- Costruisce URL con `URLSearchParams` (skippa params undefined)
- Timeout via `AbortController` dopo `DEFAULT_TIMEOUT_MS`
- Retry automatico fino a `MAX_RETRIES` volte su errori di rete (non su 4xx)
- Next.js fetch cache: `{ next: { revalidate: options?.revalidate ?? 30 } }`
- Lancia `GammaApiError` con `status` e `message` su risposta non-ok
- `export class GammaApiError extends Error { constructor(public status: number, message: string) }`

---

## 3. `lib/polymarket/queries.ts`

Funzioni che usano `gammaGet` e ritornano i tipi Gamma.

```typescript
// Lista eventi (home feed, search)
export async function fetchEvents(params?: GammaEventsParams): Promise<GammaEvent[]>

// Evento singolo per slug (pagina evento)
export async function fetchEventBySlug(slug: string): Promise<GammaEvent | null>

// Evento singolo per ID
export async function fetchEventById(id: string): Promise<GammaEvent | null>

// Evento featured (home hero)
export async function fetchFeaturedEvents(limit?: number): Promise<GammaEvent[]>

// Search full-text
export async function searchEvents(query: string, limit?: number): Promise<GammaEvent[]>
```

Dettagli:

- `fetchEvents` → `GET /events` con params
- `fetchEventBySlug` → `GET /events?slug={slug}&limit=1` → ritorna `events[0] ?? null`
- `fetchEventById` → `GET /events?id={id}&limit=1` → ritorna `events[0] ?? null`
- `fetchFeaturedEvents` → `GET /events?featured=true&active=true&order=volume24hr&ascending=false&limit={limit??10}`
- `searchEvents` → `GET /events?search={query}&active=true&limit={limit??20}`
- Revalidate: 30s per featured, 60s per slug/id, 15s per search

---

## 4. `lib/polymarket/mappers.ts`

Trasforma i tipi Gamma in tipi interni Auktora.

Prima definisci i tipi interni:

```typescript
// I 5 CardKind dell'app (da Doc 1 e Doc 4)
export type CardKind =
  | 'binary' // 1 mercato, outcomes Yes/No
  | 'multi_outcome' // 1 evento, N candidati (elezioni, premi)
  | 'multi_strike' // 1 evento, N soglie numeriche
  | 'h2h_sport' // 2 outcomes, titoli tipo "Team A vs Team B"
  | 'crypto_up_down' // binary su crypto price, ha round con scadenza

// Mercato interno normalizzato
export interface AuktoraMarket {
  id: string
  question: string
  slug: string
  yesPrice: number // 0-1
  noPrice: number // 0-1
  volume: number
  liquidity: number
  endDate: Date
  active: boolean
  closed: boolean
  clobTokenIds: [string, string] | null // [yes token, no token]
}

// Evento interno normalizzato
export interface AuktoraEvent {
  id: string
  title: string
  slug: string
  description: string
  image: string
  icon: string
  endDate: Date
  active: boolean
  closed: boolean
  volume24hr: number
  totalVolume: number
  totalLiquidity: number
  commentCount: number
  tags: string[] // array di slug
  markets: AuktoraMarket[]
  kind: CardKind // classificazione per rendering
}
```

Poi implementa:

```typescript
export function mapGammaMarket(raw: GammaMarket): AuktoraMarket
export function mapGammaEvent(raw: GammaEvent): AuktoraEvent
export function classifyEvent(event: GammaEvent): CardKind
```

**Logica `classifyEvent`**:

```
1 mercato, outcomes = ["Yes","No"]
  → slug contiene "btc"|"eth"|"sol"|"crypto"|"bitcoin"|"ethereum" E endDate entro 7 giorni
    → 'crypto_up_down'
  → altrimenti → 'binary'

1 mercato, outcomes NON Yes/No (es. 2 squadre)
  → 'h2h_sport'

N mercati (>1)
  → outcomes[0] è numero (es. "50000", "1.5")
    → 'multi_strike'
  → altrimenti → 'multi_outcome'
```

**Logica `mapGammaMarket`**:

- `outcomePrices` è stringa JSON tipo `'["0.72","0.28"]'` → parsa con `JSON.parse`, prendi index 0 come yesPrice
- `volume` e `liquidity` sono stringhe → `parseFloat`
- `endDate` → `new Date(raw.endDate)`
- `clobTokenIds` → `JSON.parse(raw.clobTokenIds)` se presente

---

## 5. Test — `lib/polymarket/__tests__/`

### `client.test.ts`

- Mock `fetch` globale
- Test: risposta 200 ritorna i dati parsati
- Test: risposta 404 lancia `GammaApiError` con status 404
- Test: timeout dopo 8s lancia errore
- Test: retry su errore di rete (fetch rigetta), massimo 2 tentativi

### `mappers.test.ts`

- Fixture: un `GammaEvent` reale minimo (hardcoded nel test)
- Test: `classifyEvent` per ogni CardKind (5 fixture diverse)
- Test: `mapGammaMarket` parsa correttamente `outcomePrices` e `clobTokenIds`
- Test: `mapGammaEvent` ritorna `AuktoraEvent` con campi corretti

---

## Struttura cartelle finale

```
lib/polymarket/
  types.ts
  client.ts
  queries.ts
  mappers.ts
  __tests__/
    client.test.ts
    mappers.test.ts
```

**Nessun barrel `index.ts`** — ogni file viene importato direttamente dove serve.

---

## Acceptance criteria

- [ ] `npm run validate` passa (typecheck + lint + test)
- [ ] Tutti i test del nuovo layer passano
- [ ] `npm run build` exit 0
- [ ] Nessuna dipendenza npm nuova richiesta (solo fetch nativo + TypeScript)
- [ ] `lib/polymarket/queries.ts` funziona: esegui uno smoke test manuale in `app/page.tsx` — aggiungi temporaneamente `const events = await fetchFeaturedEvents(3)` e `console.log(events[0]?.title)` in un Server Component — verifica che l'output appaia nel log del server (poi rimuovi lo smoke test prima del commit)
- [ ] Commit: `git commit -m "feat: Polymarket Gamma API client — types, client, queries, mappers (3.2.1)" && git push origin main`

---

## Note

- Non installare `@polymarket/clob-client` qui — arriva in Sprint 4.4.1 (REAL trading)
- Non costruire WebSocket qui — arriva in Sprint 3.2.3
- I tipi `GammaMarket.outcomes` e `outcomePrices` sono stringhe JSON — questo è il formato reale dell'API, non un errore
- Il campo `clobTokenIds` è anch'esso una stringa JSON — parsalo con try/catch
