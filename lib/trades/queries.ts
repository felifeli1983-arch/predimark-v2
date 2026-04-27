import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

export interface TradeHistoryItem {
  id: string
  marketId: string
  polymarketMarketId: string
  slug: string | null
  title: string
  image: string | null
  tradeType: string
  side: string
  shares: number
  price: number
  totalAmount: number
  pnl: number | null
  pnlPct: number | null
  isWin: boolean | null
  isDemo: boolean
  source: string
  executedAt: string | null
}

type TradeTypeFilter = 'open' | 'close' | 'resolution' | undefined
type PeriodFilter = 'today' | '7d' | '30d' | 'all' | undefined

interface ListOptions {
  isDemo: boolean
  type?: TradeTypeFilter
  period?: PeriodFilter
  limit?: number
  offset?: number
}

function periodCutoff(period: PeriodFilter): string | null {
  if (!period || period === 'all') return null
  const now = Date.now()
  if (period === 'today') {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }
  const days = period === '7d' ? 7 : 30
  return new Date(now - days * 24 * 60 * 60 * 1000).toISOString()
}

/** Storico trade dell'utente con join markets + filtri opzionali + count totale. */
export async function listTradesHistory(
  supabase: SupabaseClient<Database>,
  userId: string,
  opts: ListOptions
): Promise<{ items: TradeHistoryItem[]; total: number } | { error: string }> {
  let query = supabase
    .from('trades')
    .select(
      `
        id, market_id, trade_type, side, shares, price, total_amount,
        pnl, pnl_pct, is_win, is_demo, source, executed_at,
        markets ( polymarket_market_id, slug, title, image_url )
      `,
      { count: 'exact' }
    )
    .eq('user_id', userId)
    .eq('is_demo', opts.isDemo)
    .order('executed_at', { ascending: false })

  if (opts.type) query = query.eq('trade_type', opts.type)
  const cutoff = periodCutoff(opts.period)
  if (cutoff) query = query.gte('executed_at', cutoff)
  if (opts.limit !== undefined) {
    query = query.range(opts.offset ?? 0, (opts.offset ?? 0) + opts.limit - 1)
  }

  const { data, error, count } = await query
  if (error) return { error: error.message }

  const items = (data ?? []).map((row) => ({
    id: row.id,
    marketId: row.market_id,
    polymarketMarketId: row.markets?.polymarket_market_id ?? '',
    slug: row.markets?.slug ?? null,
    title: row.markets?.title ?? '',
    image: row.markets?.image_url ?? null,
    tradeType: row.trade_type,
    side: row.side,
    shares: Number(row.shares),
    price: Number(row.price),
    totalAmount: Number(row.total_amount),
    pnl: row.pnl !== null ? Number(row.pnl) : null,
    pnlPct: row.pnl_pct !== null ? Number(row.pnl_pct) : null,
    isWin: row.is_win,
    isDemo: row.is_demo,
    source: row.source,
    executedAt: row.executed_at,
  }))

  return { items, total: count ?? items.length }
}
