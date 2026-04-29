# PROMPT — Sprint 3.5.4 — Live Data dalla CLOB V2 API diretta (zero DB per dati di mercato)

> **Priorità**: CRITICA — il chart e i dati live devono venire direttamente da Polymarket, non dal nostro DB
> **Base**: commit `7e501a2` (Sprint 3.5.3 completato)
> **Obiettivo**: rendere ogni pagina evento veloce e live quanto Polymarket.com stesso

---

## Principio architetturale

Il DB Supabase serve **solo per dati Predimark**:

- `users` — identità, KYC, referral
- `positions` / `trade_history` — trade degli utenti
- `equity_snapshots` — sparkline portafoglio
- `signals` — segnali algoritmici interni
- `markets` — registro FK (necessario per foreign keys su positions/signals)

**Non serve** per prezzi, chart storici, trade feed, orderbook — tutto questo viene da Polymarket direttamente.

---

## Task 1 — Espandere `lib/polymarket/clob.ts`

Aggiungere le seguenti funzioni read-only che wrappano il SDK `@polymarket/clob-client-v2`. Tutte usano `createReadOnlyClient()` già presente nel file. **No auth necessaria.**

### 1a. `getPricesHistory`

```ts
import { PriceHistoryInterval, type MarketPrice } from '@polymarket/clob-client-v2'

export { PriceHistoryInterval }
export type { MarketPrice }

/**
 * Storico prezzi per un tokenID (clobTokenIds[0] = YES token).
 * Ritorna array { t: unix_seconds, p: price_0_to_1 } ordinato per t crescente.
 * Intervalli disponibili: 1h | 6h | 1d | 1w | max
 *
 * Usato da PriceHistoryChart — nessun DB necessario.
 */
export async function getPricesHistory(
  tokenId: string,
  interval: PriceHistoryInterval = PriceHistoryInterval.ONE_WEEK,
  startTs?: number,
  endTs?: number
): Promise<MarketPrice[]> {
  const client = createReadOnlyClient()
  const result = await client.getPricesHistory({
    market: tokenId,
    interval,
    startTs,
    endTs,
    fidelity: 60, // 1 punto ogni 60 minuti (riduce dati, migliora performance)
  })
  return Array.isArray(result) ? result : []
}
```

### 1b. `getLastTradePrice`

```ts
/**
 * Prezzo dell'ultimo trade eseguito per un tokenID.
 * Più preciso di getMidpoint per mostrare "ultimo prezzo" in UI.
 */
export async function getLastTradePrice(tokenId: string): Promise<number | null> {
  try {
    const client = createReadOnlyClient()
    const res = (await client.getLastTradePrice(tokenId)) as { price?: string | number } | null
    const value = typeof res?.price === 'string' ? Number(res.price) : (res?.price ?? NaN)
    return Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}
```

### 1c. `getMarketRecentTrades`

```ts
import type { MarketTradeEvent } from '@polymarket/clob-client-v2'
export type { MarketTradeEvent }

/**
 * Ultimi trade eseguiti su un market (conditionId = market.conditionId da Gamma).
 * Usato per "Recent Trades" nella pagina evento (tab Activity).
 * Struttura: { side, price, size, outcome, timestamp, user.pseudonym }
 */
export async function getMarketRecentTrades(conditionId: string): Promise<MarketTradeEvent[]> {
  try {
    const client = createReadOnlyClient()
    return await client.getMarketTradesEvents(conditionId)
  } catch {
    return []
  }
}
```

### 1d. `calculateMarketImpact`

```ts
import { Side } from '@polymarket/clob-client-v2'

/**
 * Calcola il prezzo medio stimato per acquistare `amount` USDC di un tokenID.
 * Utile nel Trade Widget per mostrare price impact prima del submit.
 *
 * @param tokenId   clobTokenIds[0] per YES, [1] per NO
 * @param side      'BUY' | 'SELL'
 * @param amount    importo USDC
 * @returns prezzo stimato 0-1, o null se errore
 */
export async function calculateMarketImpact(
  tokenId: string,
  side: 'BUY' | 'SELL',
  amount: number
): Promise<number | null> {
  try {
    const client = createReadOnlyClient()
    const price = await client.calculateMarketPrice(
      tokenId,
      side === 'BUY' ? Side.BUY : Side.SELL,
      amount
    )
    return Number.isFinite(price) ? price : null
  } catch {
    return null
  }
}
```

---

## Task 2 — Riscrivere `/api/v1/markets/[marketId]/price-history/route.ts`

**Eliminare completamente la query al DB.** Usare `getPricesHistory` dalla CLOB API.

Il `marketId` passato dall'app è il `clobTokenIds[0]` del market (YES token ID).
Da `EventPageShell`, passare direttamente `event.markets[0].clobTokenIds?.[0]` come `marketId`.

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getPricesHistory, PriceHistoryInterval, type MarketPrice } from '@/lib/polymarket/clob'

const INTERVAL_MAP: Record<string, PriceHistoryInterval> = {
  '1h': PriceHistoryInterval.ONE_HOUR,
  '6h': PriceHistoryInterval.SIX_HOURS,
  '1d': PriceHistoryInterval.ONE_DAY,
  '7d': PriceHistoryInterval.ONE_WEEK,
  '30d': PriceHistoryInterval.ONE_WEEK, // fallback: max disponibile è 1w
  all: PriceHistoryInterval.MAX,
}

/**
 * GET /api/v1/markets/[marketId]/price-history?period=1h|6h|1d|7d|all
 *
 * marketId = clobTokenIds[0] (YES token ID del market).
 * Legge direttamente da CLOB V2 API — nessun DB.
 * Cache Next.js revalidate: 300s (5 min).
 */
export const revalidate = 300

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ marketId: string }> }
): Promise<NextResponse> {
  const { marketId } = await context.params
  if (!marketId) {
    return NextResponse.json(
      { error: { code: 'MISSING_ID', message: 'marketId richiesto' } },
      { status: 400 }
    )
  }

  const url = new URL(request.url)
  const period = url.searchParams.get('period') ?? '7d'
  const interval = INTERVAL_MAP[period] ?? PriceHistoryInterval.ONE_WEEK

  try {
    const points: MarketPrice[] = await getPricesHistory(marketId, interval)
    return NextResponse.json({
      market_id: marketId,
      period,
      // Normalizza al formato { timestamp, yes_price } atteso dal componente
      items: points.map((p) => ({
        timestamp: new Date(p.t * 1000).toISOString(),
        yes_price: p.p,
        no_price: 1 - p.p,
      })),
    })
  } catch (err) {
    console.error('[price-history CLOB]', err)
    return NextResponse.json({
      market_id: marketId,
      period,
      items: [],
    })
  }
}
```

---

## Task 3 — Aggiornare `EventPageShell.tsx`

Passare il **tokenId** (non il market ID Gamma) a `PriceHistoryChart`:

```tsx
{
  event.markets[0]?.clobTokenIds?.[0] && (
    <PriceHistoryChart
      marketId={event.markets[0].clobTokenIds[0]} // ← YES token ID diretto
      cardKind={event.kind}
      assetId={event.markets[0].clobTokenIds[0]}
      isLive={event.markets[0].active && !event.markets[0].closed}
    />
  )
}
```

---

## Task 4 — Aggiungere route `/api/v1/markets/[marketId]/recent-trades/route.ts`

```ts
/**
 * GET /api/v1/markets/[marketId]/recent-trades
 * marketId = conditionId del market (da GammaMarket.conditionId)
 * Ritorna ultimi trade CLOB, no auth, revalidate 60s.
 */
export const revalidate = 60

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ marketId: string }> }
): Promise<NextResponse> {
  const { marketId } = await context.params
  const trades = await getMarketRecentTrades(marketId)
  return NextResponse.json({ items: trades.slice(0, 50) })
}
```

---

## Task 5 — `HeroCrypto.tsx` — usare `useCryptoLivePrice` (Chainlink) invece di `useLiveMidpoint`

Per carte `crypto_up_down`, il prezzo rilevante NON è la probabilità YES del mercato predittivo, ma il **prezzo spot dell'asset sottostante** (es. BTC/USD).

Il simbolo si estrae dal titolo/slug dell'evento:

```ts
// Utility: estrae il simbolo crypto dallo slug/titolo
function extractCryptoSymbol(event: AuktoraEvent): string {
  const text = (event.slug + ' ' + event.title).toLowerCase()
  if (text.includes('btc') || text.includes('bitcoin')) return 'btcusdt'
  if (text.includes('eth') || text.includes('ethereum')) return 'ethusdt'
  if (text.includes('sol') || text.includes('solana')) return 'solusdt'
  if (text.includes('matic') || text.includes('polygon')) return 'maticusdt'
  return ''
}
```

In `HeroCrypto.tsx`:

```ts
// PRIMA (sbagliato — mostra prob YES del predmarket, non il prezzo spot crypto)
const { midpoint, change } = useLiveMidpoint(yesTokenId)

// DOPO (corretto — prezzo spot Chainlink, aggiornato ogni ~5s)
import { useCryptoLivePrice } from '@/lib/ws/hooks/useCryptoLivePrice'
const symbol = extractCryptoSymbol(event)
const { price, change24h, loading } = useCryptoLivePrice(symbol, 'chainlink')
```

Mostrare:

- Prezzo spot in formato `$XX,XXX.XX`
- Variazione 24h colorata (verde/rosso)
- Label "Live · Chainlink"
- Countdown scadenza round (già implementato con `useCountdown`)

---

## Task 6 — Rimuovere cron `sync-price-history` da `vercel.json`

Il cron era necessario solo per popolare `price_history`. Ora che usiamo CLOB API direttamente, è inutile. Rimuovere l'entry:

```json
// Rimuovere da vercel.json:
{ "path": "/api/v1/cron/sync-price-history", "schedule": "0 0,6,12,18 * * *" }
```

Il file `app/api/v1/cron/sync-price-history/route.ts` può restare (non fa male), ma non viene più schedulato.

---

## Task 7 — `PriceHistoryChart.tsx` — allineare interfaccia al nuovo formato

La route ora ritorna `{ timestamp: string, yes_price: number, no_price: number }` (come prima).
Il componente già usa questo formato — **nessuna modifica** al componente.

Aggiornare solo il period selector per rispecchiare gli intervalli reali disponibili:

```tsx
// PRIMA
const PERIODS = ['1d', '7d', '30d', 'all'] as const

// DOPO — allineato agli intervalli CLOB disponibili
const PERIODS = [
  { value: '1h', label: '1H' },
  { value: '6h', label: '6H' },
  { value: '1d', label: '1G' },
  { value: '7d', label: '7G' },
  { value: 'all', label: 'MAX' },
] as const
```

---

## Struttura file modificati/creati

```
lib/polymarket/clob.ts                                 ← +4 funzioni: getPricesHistory, getLastTradePrice,
                                                           getMarketRecentTrades, calculateMarketImpact
app/api/v1/markets/[marketId]/price-history/route.ts   ← riscritta: query CLOB, non DB
app/api/v1/markets/[marketId]/recent-trades/route.ts   ← NUOVA: ultimi trade dal CLOB
components/event/EventPageShell.tsx                    ← passa clobTokenIds[0] come marketId
components/event/hero/HeroCrypto.tsx                   ← useCryptoLivePrice (Chainlink) invece di useLiveMidpoint
components/event/PriceHistoryChart.tsx                 ← period selector aggiornato (1H/6H/1G/7G/MAX)
vercel.json                                            ← rimuovere cron sync-price-history
```

---

## Regole architetturali

- Nessun colore hardcoded — solo CSS vars
- `createReadOnlyClient()` — no auth, read-only, public endpoints
- `export const revalidate = 300` sulle route chart (Next.js ISR cache 5 min)
- `export const revalidate = 60` sulla route recent-trades (dati più freschi)
- Non rimuovere la tabella `price_history` dal DB — può restare come archivio futuro
- Non rimuovere `app/api/v1/cron/sync-price-history/route.ts` — solo togliere dalla schedule
- Max 300 righe per componente

---

## Acceptance criteria

- [ ] Aprire `/event/[slug]` su un mercato binary: chart mostra dati storici reali da Polymarket CLOB (non DB)
- [ ] Period selector 1H/6H/1G/7G/MAX funziona, ogni tab mostra dati diversi
- [ ] `crypto_up_down`: HeroCrypto mostra prezzo spot BTC/ETH live da Chainlink con variazione 24h
- [ ] `GET /api/v1/markets/[marketId]/recent-trades` ritorna trade reali
- [ ] `GET /api/v1/polymarket/health?token_id=<tokenId>` ritorna midpoint reale (smoke test CLOB)
- [ ] Cron `sync-price-history` rimosso da vercel.json
- [ ] `npx tsc --noEmit` exit 0
- [ ] `npm run validate` passa
- [ ] Commit: `git commit -m "feat: price-history + crypto live da CLOB V2 diretta — no DB (3.5.4)" && git push origin main`
