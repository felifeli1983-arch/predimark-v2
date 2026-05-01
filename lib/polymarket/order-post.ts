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
 * Cancella tutti gli ordini per uno specifico market (conditionId),
 * opzionalmente filtrato a un singolo asset_id (token YES o NO).
 *
 * Use case: utente apre un evento e vuole cancellare solo gli ordini
 * su quello (lasciando gli altri intatti). Più chirurgico di cancelAll.
 *
 * Doc "Cancel Order": Cancel by Market — entrambi i parametri opzionali.
 */
export async function cancelMarketOrders(
  creds: ApiKeyCreds,
  filters: { market?: string; assetId?: string } = {}
): Promise<{ canceled: string[]; notCanceled: Record<string, string> }> {
  const params: { market?: string; asset_id?: string } = {}
  if (filters.market) params.market = filters.market
  if (filters.assetId) params.asset_id = filters.assetId
  const res = (await authClient(creds).cancelMarketOrders(params)) as {
    canceled?: string[]
    not_canceled?: Record<string, string>
  }
  return {
    canceled: res.canceled ?? [],
    notCanceled: res.not_canceled ?? {},
  }
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
 * Heartbeat — Polymarket cancella automaticamente TUTTI gli open orders
 * dell'API key se non riceve heartbeat entro 10s (+5s buffer = 15s).
 * Doc Orders Overview: "If a valid heartbeat is not received within 10
 * seconds, all of your open orders will be cancelled".
 *
 * Pattern: la prima call passa undefined, le successive l'`heartbeat_id`
 * ritornato dalla precedente. Il server invalida heartbeat_id stale
 * con 400 + provides il corretto nel response.
 *
 * Caller responsibility: setInterval ogni 5s finché user ha open orders.
 */
export async function postHeartbeat(
  creds: ApiKeyCreds,
  heartbeatId?: string
): Promise<{ heartbeatId: string }> {
  const res = (await authClient(creds).postHeartbeat(heartbeatId)) as {
    heartbeat_id?: string
  }
  return { heartbeatId: res.heartbeat_id ?? '' }
}

export interface UserTradeRow {
  id: string
  takerOrderId: string
  market: string
  assetId: string
  side: 'BUY' | 'SELL'
  size: number
  price: number
  feeRateBps: number
  status: string
  matchTime: string
  outcome: string
  makerAddress: string
  transactionHash: string
  traderSide: 'TAKER' | 'MAKER'
}

/**
 * Trade history utente — paginato cursor-based via SDK V2.
 * Filtri opzionali per market/assetId/before/after.
 *
 * Doc "Cancel Order" → Trade History: trade transitano per status
 * MATCHED → MINED → CONFIRMED (terminale) | RETRYING → FAILED.
 *
 * Per riconciliazione split-trade (trade su più tx per gas limit),
 * usare bucket_index + match_time del payload raw.
 */
export async function getOrderTrades(
  creds: ApiKeyCreds,
  filters: {
    market?: string
    assetId?: string
    before?: string
    after?: string
    cursor?: string
  } = {}
): Promise<{ trades: UserTradeRow[]; nextCursor: string }> {
  const params: Record<string, string> = {}
  if (filters.market) params.market = filters.market
  if (filters.assetId) params.asset_id = filters.assetId
  if (filters.before) params.before = filters.before
  if (filters.after) params.after = filters.after
  if (filters.cursor) params.next_cursor = filters.cursor
  const res = (await authClient(creds).getTrades(params)) as {
    data?: Array<Record<string, unknown>>
    next_cursor?: string
  }
  const rows = res?.data ?? []
  return {
    trades: rows.map((r) => ({
      id: String(r.id ?? ''),
      takerOrderId: String(r.taker_order_id ?? ''),
      market: String(r.market ?? ''),
      assetId: String(r.asset_id ?? ''),
      side: r.side === 'SELL' ? 'SELL' : 'BUY',
      size: Number(r.size ?? 0),
      price: Number(r.price ?? 0),
      feeRateBps: Number(r.fee_rate_bps ?? 0),
      status: String(r.status ?? ''),
      matchTime: String(r.match_time ?? ''),
      outcome: String(r.outcome ?? ''),
      makerAddress: String(r.maker_address ?? ''),
      transactionHash: String(r.transaction_hash ?? ''),
      traderSide: r.trader_side === 'MAKER' ? 'MAKER' : 'TAKER',
    })),
    nextCursor: res.next_cursor ?? '',
  }
}

/**
 * Verifica se un ordine resting è eligibile per maker rebates
 * (incentivi per liquidity provider). Doc "Cancel Order" →
 * Order Scoring. Usato da OpenOrdersList per badge "Earning rebate".
 */
export async function isOrderScoring(creds: ApiKeyCreds, orderId: string): Promise<boolean> {
  const res = (await authClient(creds).isOrderScoring({ order_id: orderId })) as
    | { scoring?: boolean }
    | boolean
  if (typeof res === 'boolean') return res
  return Boolean(res?.scoring)
}

/** Batch variant per checkare scoring su più ordini in una sola call. */
export async function areOrdersScoring(
  creds: ApiKeyCreds,
  orderIds: string[]
): Promise<Record<string, boolean>> {
  if (orderIds.length === 0) return {}
  const res = (await authClient(creds).areOrdersScoring({ orderIds })) as unknown as
    | Record<string, boolean>
    | { scoring?: Record<string, boolean> }
  if (res && typeof res === 'object' && 'scoring' in res && res.scoring) {
    return res.scoring as Record<string, boolean>
  }
  return (res as Record<string, boolean>) ?? {}
}

export interface PolymarketNotification {
  id: number
  type: number
  /** 1=cancellation, 2=fill, 4=market_resolved (Doc L2 Methods → Notifications). */
  typeLabel: 'cancellation' | 'fill' | 'market_resolved' | 'unknown'
  payload: unknown
  timestamp: number | null
  owner: string
}

const NOTIF_TYPE_MAP: Record<number, PolymarketNotification['typeLabel']> = {
  1: 'cancellation',
  2: 'fill',
  4: 'market_resolved',
}

/**
 * Notifiche eventi Polymarket per l'utente (ordine cancellato/filled,
 * market resolved). Doc L2 Methods → getNotifications. Auto-purge dopo
 * 48h server-side, quindi vanno fetchate periodicamente.
 *
 * Usate dal NotificationBell in header per badge count + dropdown lista.
 */
export async function getPolymarketNotifications(
  creds: ApiKeyCreds
): Promise<PolymarketNotification[]> {
  try {
    const res = (await authClient(creds).getNotifications()) as Array<{
      id?: number
      type?: number
      payload?: unknown
      timestamp?: number
      owner?: string
    }>
    return (res ?? []).map((n) => ({
      id: Number(n.id ?? 0),
      type: Number(n.type ?? 0),
      typeLabel: NOTIF_TYPE_MAP[Number(n.type ?? 0)] ?? 'unknown',
      payload: n.payload ?? null,
      timestamp: n.timestamp ?? null,
      owner: String(n.owner ?? ''),
    }))
  } catch {
    return []
  }
}

/** Marca notifiche come read/dismissed (Doc L2 Methods → dropNotifications). */
export async function dropPolymarketNotifications(
  creds: ApiKeyCreds,
  ids: string[]
): Promise<void> {
  if (ids.length === 0) return
  await authClient(creds).dropNotifications({ ids })
}

export interface BalanceAllowance {
  /** Saldo in human units (USDC = 1.5 per $1.50, conditional shares = float). */
  balance: number
  /** Allowance contratto CTFExchange — se < balance, il trade viene rifiutato. */
  allowance: number
  /** True se balance ≥ allowance ≥ 0 e nessuno è null. */
  ready: boolean
}

/**
 * Balance + allowance per COLLATERAL (USDC) o CONDITIONAL (token shares).
 * Doc L2 Methods → getBalanceAllowance. Critical per pre-trade UI:
 * mostra "Disponibile: $X" e warns se allowance < balance (richiede
 * approve on-chain prima di poter tradare).
 *
 * Se assetType=CONDITIONAL, tokenId è REQUIRED.
 */
export async function getBalanceAllowance(
  creds: ApiKeyCreds,
  assetType: 'COLLATERAL' | 'CONDITIONAL',
  tokenId?: string
): Promise<BalanceAllowance | null> {
  try {
    // Cast as unknown — il SDK richiede AssetType enum + token_id condizionale,
    // ma noi normalizziamo col nostro union literal che equivale.
    const res = (await authClient(creds).getBalanceAllowance({
      asset_type: assetType,
      ...(tokenId && { token_id: tokenId }),
    } as unknown as Parameters<ClobClient['getBalanceAllowance']>[0])) as {
      balance?: string | number
      allowance?: string | number
    }
    const balance = Number(res?.balance ?? 0)
    const allowance = Number(res?.allowance ?? 0)
    return {
      balance,
      allowance,
      ready: Number.isFinite(balance) && Number.isFinite(allowance) && allowance >= balance,
    }
  } catch {
    return null
  }
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
