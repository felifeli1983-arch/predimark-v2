import {
  ClobClient,
  Chain,
  PriceHistoryInterval,
  Side,
  type OrderBookSummary,
  type MarketPrice,
  type MarketTradeEvent,
} from '@polymarket/clob-client-v2'

export { PriceHistoryInterval }
export type { MarketPrice, MarketTradeEvent }

/**
 * URL CLOB V2. Pre-cutover usa `clob-v2.polymarket.com`, post-cutover
 * (V1 spento) la stessa URL canonica `clob.polymarket.com` punta a V2.
 */
export const CLOB_URL = process.env.POLYMARKET_CLOB_URL ?? 'https://clob-v2.polymarket.com'

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
 * Storico prezzi per un tokenID (clobTokenIds[0] = YES token).
 * Ritorna array { t: unix_seconds, p: price_0_to_1 } ordinato per t crescente.
 * Intervalli disponibili: 1h | 6h | 1d | 1w | max.
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
    fidelity: 60,
  })
  return Array.isArray(result) ? result : []
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
 * Ritorna array vuoto in caso di errore.
 */
export async function getMarketRecentTrades(conditionId: string): Promise<MarketTradeEvent[]> {
  try {
    const client = createReadOnlyClient()
    return await client.getMarketTradesEvents(conditionId)
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
