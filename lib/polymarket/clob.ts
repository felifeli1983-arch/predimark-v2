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
