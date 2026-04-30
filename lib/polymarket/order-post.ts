import {
  ClobClient,
  Chain,
  OrderType,
  type SignedOrder,
  type ApiKeyCreds,
} from '@polymarket/clob-client-v2'

import { CLOB_URL } from './clob'

export { OrderType }

export interface PostOrderResult {
  orderID: string
  /** "matched" | "live" | "delayed" | "unmatched" — stato Polymarket */
  status: string
  /** Trades fillati immediatamente (su market order). */
  takingAmount?: string
  makingAmount?: string
}

export interface OpenOrderRow {
  id: string
  status: string
  market: string
  assetId: string
  side: 'BUY' | 'SELL'
  originalSize: number
  sizeMatched: number
  price: number
  outcome: string
  expiration: string
  orderType: string
  /** Quantità ancora aperta (`originalSize - sizeMatched`). */
  remaining: number
}

function authClient(creds: ApiKeyCreds): ClobClient {
  return new ClobClient({
    host: CLOB_URL,
    chain: Chain.POLYGON,
    creds,
    throwOnError: true,
  })
}

/**
 * Posta un SignedOrder al CLOB V2 server-side, usando le L2 API creds
 * dell'utente (caricate decifrate da DB). Ritorna l'orderID assegnato.
 *
 * Order types supportati (Polymarket "Order Lifecycle" doc):
 *   - GTC (Good Till Cancelled): default, rest on book
 *   - GTD (Good Till Date): auto-expira a `expiration`
 *   - FOK (Fill Or Kill): fill all or cancel
 *   - FAK (Fill And Kill): fill what's available, cancel rest
 *
 * `postOnly=true` rifiuta l'ordine se incrocia lo spread → garantisce
 * che l'utente sia maker (no taker fees).
 *
 * MA4.4 Phase C-2 — server-only, mai chiamare lato client.
 */
export async function postSignedOrder(
  signedOrder: SignedOrder,
  creds: ApiKeyCreds,
  orderType: OrderType = OrderType.GTC,
  postOnly: boolean = false
): Promise<PostOrderResult> {
  const client = authClient(creds)
  const res = (await client.postOrder(signedOrder, orderType, postOnly)) as {
    orderID?: string
    status?: string
    takingAmount?: string
    makingAmount?: string
  }
  if (!res?.orderID) {
    throw new Error(`CLOB post failed (no orderID): ${JSON.stringify(res)}`)
  }
  return {
    orderID: res.orderID,
    status: res.status ?? 'unknown',
    takingAmount: res.takingAmount,
    makingAmount: res.makingAmount,
  }
}

/**
 * Cancella un ordine GTC/GTD ancora live sul book. Idempotente:
 * cancellare un ordine già matched/cancelled ritorna error gracefully.
 *
 * Limite: ordini parzialmente fillati cancellano solo la quantità
 * rimanente (la parte già matched è settled on-chain, non rimborsabile).
 */
export async function cancelOrder(orderID: string, creds: ApiKeyCreds): Promise<void> {
  await authClient(creds).cancelOrder({ orderID })
}

/** Cancella più ordini in un solo batch (per "Cancel all"). */
export async function cancelOrders(orderIDs: string[], creds: ApiKeyCreds): Promise<void> {
  if (orderIDs.length === 0) return
  await authClient(creds).cancelOrders(orderIDs)
}

/** Cancella TUTTI gli ordini live dell'utente. */
export async function cancelAllOrders(creds: ApiKeyCreds): Promise<void> {
  await authClient(creds).cancelAll()
}

/**
 * Lista ordini "live" (resting on book) dell'utente. Filtri opzionali
 * per market/assetId. Usato da /me/orders + maxOrderSize calc per
 * sottrarre la "reserved size" dal balance disponibile.
 */
export async function getOpenOrders(
  creds: ApiKeyCreds,
  filters: { market?: string; assetId?: string } = {}
): Promise<OpenOrderRow[]> {
  const params: { market?: string; asset_id?: string } = {}
  if (filters.market) params.market = filters.market
  if (filters.assetId) params.asset_id = filters.assetId
  const res = (await authClient(creds).getOpenOrders(params)) as {
    data?: Array<{
      id: string
      status: string
      market: string
      asset_id: string
      side: string
      original_size: string
      size_matched: string
      price: string
      outcome: string
      expiration: string
      order_type: string
    }>
  }
  const rows = res?.data ?? []
  return rows.map((r) => {
    const orig = Number(r.original_size)
    const matched = Number(r.size_matched)
    return {
      id: r.id,
      status: r.status,
      market: r.market,
      assetId: r.asset_id,
      side: r.side === 'BUY' || r.side === 'buy' ? 'BUY' : 'SELL',
      originalSize: orig,
      sizeMatched: matched,
      price: Number(r.price),
      outcome: r.outcome,
      expiration: r.expiration,
      orderType: r.order_type,
      remaining: Number.isFinite(orig - matched) ? Math.max(0, orig - matched) : 0,
    }
  })
}

/**
 * Status snapshot di un singolo ordine (per polling live → matched/
 * cancelled/expired). Returns null se non trovato.
 */
export async function getOrderStatus(
  orderID: string,
  creds: ApiKeyCreds
): Promise<{ status: string; sizeMatched: number; remaining: number } | null> {
  try {
    const res = (await authClient(creds).getOrder(orderID)) as {
      status?: string
      original_size?: string
      size_matched?: string
    }
    const orig = Number(res.original_size ?? 0)
    const matched = Number(res.size_matched ?? 0)
    return {
      status: res.status ?? 'unknown',
      sizeMatched: matched,
      remaining: Math.max(0, orig - matched),
    }
  } catch {
    return null
  }
}
