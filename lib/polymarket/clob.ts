import { ClobClient, Chain, type OrderBookSummary } from '@polymarket/clob-client-v2'

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
