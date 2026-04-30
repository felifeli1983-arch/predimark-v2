import type { PositionItem } from '@/lib/positions/queries'
import type { TradeHistoryItem } from '@/lib/trades/queries'

export type { PositionItem, TradeHistoryItem }

interface PositionsResponse {
  items: PositionItem[]
  meta: { total: number; page: number; perPage: number; totalValue: number; totalPnl: number }
}

interface TradesResponse {
  items: TradeHistoryItem[]
  meta: { total: number; page: number; perPage: number }
}

async function authedGet<T>(token: string, url: string): Promise<T> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) {
    let detail = ''
    try {
      const body = (await res.json()) as { error?: { message?: string } }
      detail = body?.error?.message ?? ''
    } catch {
      /* ignore */
    }
    throw new Error(`HTTP ${res.status}${detail ? ` — ${detail}` : ''}`)
  }
  return (await res.json()) as T
}

interface PositionsListOpts {
  page?: number
  perPage?: number
}

export async function fetchOpenPositions(
  token: string,
  isDemo: boolean,
  opts: PositionsListOpts = {}
): Promise<PositionsResponse> {
  const params = new URLSearchParams({ is_demo: String(isDemo), only_open: 'true' })
  if (opts.page) params.set('page', String(opts.page))
  if (opts.perPage) params.set('per_page', String(opts.perPage))
  return authedGet<PositionsResponse>(token, `/api/v1/users/me/positions?${params}`)
}

/**
 * Fetch posizioni RISOLTE (is_open=false). Include sia winning che
 * losing — il caller filtra per `currentPrice > 0.5` per mostrare solo
 * quelle redimibili.
 */
export async function fetchResolvedPositions(
  token: string,
  isDemo: boolean,
  opts: PositionsListOpts = {}
): Promise<PositionsResponse> {
  const params = new URLSearchParams({ is_demo: String(isDemo), only_open: 'false' })
  if (opts.page) params.set('page', String(opts.page))
  if (opts.perPage) params.set('per_page', String(opts.perPage))
  return authedGet<PositionsResponse>(token, `/api/v1/users/me/positions?${params}`)
}

interface HistoryFilters {
  isDemo: boolean
  type?: 'open' | 'close' | 'resolution'
  period?: 'today' | '7d' | '30d' | 'all'
  page?: number
  perPage?: number
}

export async function fetchTradesHistory(
  token: string,
  filters: HistoryFilters
): Promise<TradesResponse> {
  const params = new URLSearchParams({ is_demo: String(filters.isDemo) })
  if (filters.type) params.set('type', filters.type)
  if (filters.period) params.set('period', filters.period)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.perPage) params.set('per_page', String(filters.perPage))
  return authedGet<TradesResponse>(token, `/api/v1/users/me/trades?${params}`)
}

export interface SellTradePayload {
  positionId: string
  sharesToSell: number
  currentPrice: number
  isDemo: boolean
  /** REAL: token id usato nel sell order. */
  tokenId?: string
  /** REAL: SignedOrder pre-firmato dal client (Side.SELL). */
  signedOrder?: Record<string, unknown>
}

export interface SellTradeResponse {
  tradeId: string
  /** DEMO only */
  newDemoBalance?: number
  /** REAL only */
  newRealBalance?: number
  pnl: number
  isWin: boolean
  /** REAL only */
  polymarketOrderId?: string
  status?: string
}

export async function postSellTrade(
  token: string,
  payload: SellTradePayload
): Promise<SellTradeResponse> {
  const res = await fetch('/api/v1/trades/sell', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    let detail = ''
    try {
      const body = (await res.json()) as { error?: { code?: string; message?: string } }
      detail = body?.error?.message ?? body?.error?.code ?? ''
    } catch {
      /* ignore */
    }
    throw new Error(`HTTP ${res.status}${detail ? ` — ${detail}` : ''}`)
  }
  return (await res.json()) as SellTradeResponse
}
