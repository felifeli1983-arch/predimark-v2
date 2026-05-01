import {
  ClobClient,
  Chain,
  PriceHistoryInterval,
  Side,
  SignatureTypeV2,
  type OrderBookSummary,
  type MarketPrice,
  type MarketTradeEvent,
} from '@polymarket/clob-client-v2'

export { PriceHistoryInterval, SignatureTypeV2 }
export type { MarketPrice, MarketTradeEvent }

/**
 * URL CLOB V2.
 *
 * IMPORTANTE: post-cutover il subdomain `clob-v2.polymarket.com` ritorna
 * 301 redirect senza body (l'SDK non segue il redirect). L'URL canonico
 * `clob.polymarket.com` punta direttamente a V2 e funziona.
 * Verificato 2026-04-30: clob-v2 = 301 vuoto, clob = 200 con prezzi reali.
 */
export const CLOB_URL = process.env.POLYMARKET_CLOB_URL ?? 'https://clob.polymarket.com'

/** Chain Polymarket — production Polygon, dev/test Amoy. */
export const CLOB_CHAIN: Chain =
  process.env.POLYMARKET_CHAIN_ID === '80002' ? Chain.AMOY : Chain.POLYGON

/**
 * Builder code Auktora (bytes32) — attribution + revenue share.
 * Da Builder Profile https://polymarket.com/settings?tab=builder.
 */
export const BUILDER_CODE = process.env.POLYMARKET_BUILDER_CODE

/**
 * Read-only client (no signer, no creds). Sufficient for:
 *   getMidpoint, getOrderBook, getMarket, getMarkets, getMarketTradesEvents.
 * Usato server-side per snapshots prezzi e in API route public.
 */
export function createReadOnlyClient(): ClobClient {
  return new ClobClient({
    host: CLOB_URL,
    chain: CLOB_CHAIN,
    retryOnError: true,
    throwOnError: true,
  })
}

/** Midpoint price (between best bid e best ask) per un tokenID. */
export async function getMidpoint(tokenId: string): Promise<number> {
  const client = createReadOnlyClient()
  const res = (await client.getMidpoint(tokenId)) as { mid?: string | number }
  const value = typeof res?.mid === 'string' ? Number(res.mid) : (res?.mid ?? NaN)
  if (!Number.isFinite(value)) throw new Error(`Midpoint non valido per token ${tokenId}`)
  return value
}

/** Orderbook summary (asks + bids) per un tokenID. */
export async function getOrderBook(tokenId: string): Promise<OrderBookSummary> {
  return createReadOnlyClient().getOrderBook(tokenId)
}

/**
 * Spread official di un token CLOB. Polymarket restituisce best_ask -
 * best_bid in cents (0.01 unità), già aggiornato real-time. Più
 * accurato che calcolare client-side dalla nostra orderbook snapshot
 * (che è top-5 con depth bars, non sempre best level rappresentato).
 *
 * Doc: GET https://clob.polymarket.com/spread?token_id=<id>
 */
export async function getSpread(tokenId: string): Promise<number | null> {
  try {
    const url = new URL('/spread', CLOB_URL)
    url.searchParams.set('token_id', tokenId)
    const res = await fetch(url.toString(), { next: { revalidate: 5 } })
    if (!res.ok) return null
    const data = (await res.json()) as { spread?: string | number }
    const v = typeof data?.spread === 'string' ? Number(data.spread) : (data?.spread ?? NaN)
    return Number.isFinite(v) ? v : null
  } catch {
    return null
  }
}

/**
 * Prezzi batch per N token IDs in una singola request (vs N calls
 * sequenziali). Body POST con array `[{token_id, side}]`. Polymarket
 * supporta sia BUY (best ask) che SELL (best bid).
 *
 * Critical perf: MultiOutcomeCard / MultiStrikeCard hanno N outcomes
 * (3-10 tipicamente). Polling individuale = N×30s requests; batch =
 * 1×30s request. Doc: POST /prices.
 */
export async function getPricesBatch(
  tokenIds: string[],
  side: 'BUY' | 'SELL' = 'BUY'
): Promise<Record<string, number>> {
  if (tokenIds.length === 0) return {}
  const url = new URL('/prices', CLOB_URL)
  const body = tokenIds.map((token_id) => ({ token_id, side }))
  try {
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      next: { revalidate: 5 },
    })
    if (!res.ok) return {}
    const data = (await res.json()) as Record<string, Record<string, string>>
    const out: Record<string, number> = {}
    for (const [tokenId, bySide] of Object.entries(data)) {
      const price = bySide?.[side]
      if (price !== undefined) {
        const n = Number(price)
        if (Number.isFinite(n)) out[tokenId] = n
      }
    }
    return out
  } catch {
    return {}
  }
}

/** Dettagli market per `conditionId` (Polymarket). */
export async function getMarket(conditionId: string): Promise<unknown> {
  return createReadOnlyClient().getMarket(conditionId)
}

/**
 * tickSize + negRisk reali per un market. Quickstart Polymarket dice di NON
 * usare default 0.01/false: i mercati neg-risk hanno tick 0.001 e gli ordini
 * con tick sbagliato vengono rifiutati dal CLOB.
 *
 * Due varianti:
 *  - by conditionId → fa una sola chiamata getMarket()
 *  - by tokenId → due chiamate getTickSize() + getNegRisk() (più rapide)
 *
 * Cache 60s per evitare chiamate ripetute in uno stesso trade flow.
 */
const _detailsCache = new Map<string, { tickSize: string; negRisk: boolean; ts: number }>()

/**
 * Invalida cache tickSize/negRisk per un tokenId — invocato dal
 * `tick_size_change` WS listener (Doc Polymarket Orderbook: tick può
 * cambiare al raggiungimento di price extremi >0.96 o <0.04, e ordini
 * con tick vecchio vengono rifiutati dal CLOB).
 */
export function invalidateMarketDetailsCache(tokenId: string): void {
  _detailsCache.delete(`t:${tokenId}`)
  // Non sappiamo il conditionId associato a un tokenId senza fetch,
  // ma il caso d'uso comune è la cache by-token (sell flow). Quella
  // by-condition viene refetchata al prossimo trade.
}
const DETAILS_TTL_MS = 60_000

export async function getMarketDetails(
  conditionId: string
): Promise<{ tickSize: string; negRisk: boolean }> {
  const cached = _detailsCache.get(`c:${conditionId}`)
  if (cached && Date.now() - cached.ts < DETAILS_TTL_MS) {
    return { tickSize: cached.tickSize, negRisk: cached.negRisk }
  }
  const raw = (await getMarket(conditionId)) as {
    minimum_tick_size?: string | number
    neg_risk?: boolean
  } | null
  const tickSize = String(raw?.minimum_tick_size ?? '0.01')
  const negRisk = Boolean(raw?.neg_risk ?? false)
  _detailsCache.set(`c:${conditionId}`, { tickSize, negRisk, ts: Date.now() })
  return { tickSize, negRisk }
}

/**
 * Variante by tokenId: usa /tick-size e /neg-risk endpoints CLOB diretti.
 * Utile per sell flow dove abbiamo solo position.tokenId, non conditionId.
 */
export async function getMarketDetailsByToken(
  tokenId: string
): Promise<{ tickSize: string; negRisk: boolean }> {
  const cached = _detailsCache.get(`t:${tokenId}`)
  if (cached && Date.now() - cached.ts < DETAILS_TTL_MS) {
    return { tickSize: cached.tickSize, negRisk: cached.negRisk }
  }
  const client = createReadOnlyClient()
  try {
    const [tickSize, negRisk] = await Promise.all([
      client.getTickSize(tokenId),
      client.getNegRisk(tokenId),
    ])
    const result = { tickSize: String(tickSize), negRisk: Boolean(negRisk) }
    _detailsCache.set(`t:${tokenId}`, { ...result, ts: Date.now() })
    return result
  } catch {
    return { tickSize: '0.01', negRisk: false }
  }
}

/**
 * Storico prezzi per un tokenID (clobTokenIds[0] = YES token).
 * Ritorna array { t: unix_seconds, p: price_0_to_1 } ordinato per t crescente.
 * Intervalli disponibili: 1h | 6h | 1d | 1w | max.
 *
 * NOTA: l'API risponde `{ "history": [...] }` ma il SDK type dichiara
 * `Promise<MarketPrice[]>` (sbagliato). Estraiamo manualmente .history.
 */
export async function getPricesHistory(
  tokenId: string,
  interval: PriceHistoryInterval = PriceHistoryInterval.ONE_WEEK,
  startTs?: number,
  endTs?: number
): Promise<MarketPrice[]> {
  const client = createReadOnlyClient()
  const result = (await client.getPricesHistory({
    market: tokenId,
    interval,
    startTs,
    endTs,
    fidelity: 60,
  })) as MarketPrice[] | { history?: MarketPrice[] } | null
  if (Array.isArray(result)) return result
  if (result && Array.isArray(result.history)) return result.history
  return []
}

/** Prezzo dell'ultimo trade eseguito per un tokenID. */
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

/**
 * Ultimi trade eseguiti su un market (conditionId).
 * NOTA: SDK type dichiara `Promise<MarketTradeEvent[]>` ma l'endpoint
 * `/markets/live-activity/<conditionId>` restituisce in realtà solo metadata
 * del market (oggetto, NON array di trade). Verificato via curl il 2026-04-30.
 * La feed real-time dei trade richiede un endpoint diverso (data-api), TBD.
 * Per ora ritorniamo array vuoto se la response non è un array → evita 500.
 */
export async function getMarketRecentTrades(conditionId: string): Promise<MarketTradeEvent[]> {
  try {
    const client = createReadOnlyClient()
    const result = await client.getMarketTradesEvents(conditionId)
    return Array.isArray(result) ? result : []
  } catch {
    return []
  }
}

/**
 * Stima il prezzo medio per acquistare/vendere `amount` USDC di un tokenID
 * (price impact preview pre-submit). Ritorna null se errore.
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

/**
 * Health check del CLOB Polymarket (Doc Public Methods → getOk).
 * Ritorna true se il servizio risponde, false su qualsiasi errore o
 * timeout. Usato in /api/v1/polymarket/health per esporre lo stato
 * upstream nella admin dashboard / monitoring.
 */
export async function getClobOk(): Promise<boolean> {
  try {
    await createReadOnlyClient().getOk()
    return true
  } catch {
    return false
  }
}

/**
 * Server time CLOB (Unix seconds). Doc Public Methods → getServerTime.
 * Utile per:
 *  - Clock skew check tra client/server (warn se diff >30s)
 *  - GTD expiration sync (l'expiration deve essere relative al server,
 *    non al client clock che può essere off)
 */
export async function getServerTime(): Promise<number | null> {
  try {
    const t = (await createReadOnlyClient().getServerTime()) as number | string
    const n = Number(t)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

/**
 * Tutti i CLOB-level params per un market in una sola call (Doc Public
 * Methods → getClobMarketInfo). Più efficient di getMarketDetailsByToken
 * (1 call vs 2: getTickSize + getNegRisk).
 *
 * Risposta abbreviata: t=tokens, mts=tickSize, mos=minOrderSize,
 * mbf/tbf=base fees, fd=fee curve, rfqe=RFQ enabled, gst=game start.
 */
export interface ClobMarketInfo {
  tokens: Array<{ tokenId: string; outcome: string }>
  minOrderSize: number
  tickSize: string
  makerBaseFeeBps: number
  takerBaseFeeBps: number
  rfqEnabled: boolean
  gameStartTime: string | null
}

export async function getClobMarketInfo(conditionId: string): Promise<ClobMarketInfo | null> {
  try {
    const raw = (await createReadOnlyClient().getClobMarketInfo(conditionId)) as {
      t?: Array<{ t?: string; o?: string }>
      mos?: number
      mts?: number | string
      mbf?: number
      tbf?: number
      rfqe?: boolean
      gst?: string | null
    } | null
    if (!raw) return null
    return {
      tokens: (raw.t ?? []).map((tk) => ({
        tokenId: String(tk.t ?? ''),
        outcome: String(tk.o ?? ''),
      })),
      minOrderSize: Number(raw.mos ?? 1),
      tickSize: String(raw.mts ?? '0.01'),
      makerBaseFeeBps: Number(raw.mbf ?? 0),
      takerBaseFeeBps: Number(raw.tbf ?? 0),
      rfqEnabled: Boolean(raw.rfqe ?? false),
      gameStartTime: raw.gst ?? null,
    }
  } catch {
    return null
  }
}

/**
 * Fee rate in basis points per un tokenID (Doc Public Methods).
 * Usato dalla preview UI per mostrare "Fee 0.4%" prima del submit.
 */
export async function getFeeRateBps(tokenId: string): Promise<number | null> {
  try {
    const bps = await createReadOnlyClient().getFeeRateBps(tokenId)
    return Number.isFinite(Number(bps)) ? Number(bps) : null
  } catch {
    return null
  }
}

/** Fee curve exponent per un tokenID (Doc Public Methods). */
export async function getFeeExponent(tokenId: string): Promise<number | null> {
  try {
    const exp = await createReadOnlyClient().getFeeExponent(tokenId)
    return Number.isFinite(Number(exp)) ? Number(exp) : null
  } catch {
    return null
  }
}

/**
 * Midpoints batch per N token IDs (Doc Public Methods → getMidpoints).
 * 1 call invece di N. Usato da MultiStrikeCard / multi-line chart.
 */
export async function getMidpointsBatch(tokenIds: string[]): Promise<Record<string, number>> {
  if (tokenIds.length === 0) return {}
  try {
    const params = tokenIds.map((token_id) => ({ token_id, side: Side.BUY }))
    const res = (await createReadOnlyClient().getMidpoints(params)) as Record<string, string>
    const out: Record<string, number> = {}
    for (const [tokenId, value] of Object.entries(res ?? {})) {
      const n = Number(value)
      if (Number.isFinite(n)) out[tokenId] = n
    }
    return out
  } catch {
    return {}
  }
}

/**
 * OrderBooks batch per N token IDs (Doc Public Methods → getOrderBooks).
 * Per dashboard di market making — 1 call vs N.
 */
export async function getOrderBooksBatch(
  tokenIds: string[]
): Promise<Record<string, OrderBookSummary>> {
  if (tokenIds.length === 0) return {}
  try {
    const params = tokenIds.map((token_id) => ({ token_id, side: Side.BUY }))
    const res = (await createReadOnlyClient().getOrderBooks(params)) as OrderBookSummary[]
    const out: Record<string, OrderBookSummary> = {}
    for (const book of res ?? []) {
      if (book?.asset_id) out[book.asset_id] = book
    }
    return out
  } catch {
    return {}
  }
}

/**
 * Last trade prices batch (Doc Public Methods → getLastTradesPrices).
 * Usato da home grid per mostrare "ultimo prezzo trade" come fallback
 * quando midpoint non è disponibile (es. spread ampio).
 */
export async function getLastTradesPricesBatch(
  tokenIds: string[]
): Promise<Record<string, { price: number; side: 'BUY' | 'SELL' }>> {
  if (tokenIds.length === 0) return {}
  try {
    const params = tokenIds.map((token_id) => ({ token_id, side: Side.BUY }))
    const res = (await createReadOnlyClient().getLastTradesPrices(params)) as Array<{
      token_id?: string
      price?: string | number
      side?: string
    }>
    const out: Record<string, { price: number; side: 'BUY' | 'SELL' }> = {}
    for (const row of res ?? []) {
      const tokenId = String(row.token_id ?? '')
      const price = Number(row.price ?? 0)
      if (tokenId && Number.isFinite(price)) {
        out[tokenId] = { price, side: row.side === 'SELL' ? 'SELL' : 'BUY' }
      }
    }
    return out
  } catch {
    return {}
  }
}
