import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

export interface PositionItem {
  id: string
  marketId: string
  polymarketMarketId: string
  slug: string | null
  title: string
  image: string | null
  category: string | null
  side: string
  shares: number
  avgPrice: number
  totalCost: number
  currentPrice: number | null
  currentValue: number | null
  unrealizedPnl: number | null
  unrealizedPnlPct: number | null
  isDemo: boolean
  isOpen: boolean
  openedAt: string | null
  closedAt: string | null
}

interface ListOptions {
  isDemo: boolean
  onlyOpen?: boolean
  limit?: number
  offset?: number
}

/** Lista positions con join markets, filtrate per is_demo + open. */
export async function listUserPositions(
  supabase: SupabaseClient<Database>,
  userId: string,
  opts: ListOptions
): Promise<PositionItem[] | { error: string }> {
  let query = supabase
    .from('positions')
    .select(
      `
        id, market_id, side, shares, avg_price, total_cost,
        current_price, current_value, unrealized_pnl, unrealized_pnl_pct,
        is_demo, is_open, opened_at, closed_at,
        markets ( id, polymarket_market_id, slug, title, image_url, category )
      `
    )
    .eq('user_id', userId)
    .eq('is_demo', opts.isDemo)
    .order('opened_at', { ascending: false })

  if (opts.onlyOpen) {
    query = query.eq('is_open', true)
  }
  if (opts.limit !== undefined) {
    query = query.range(opts.offset ?? 0, (opts.offset ?? 0) + opts.limit - 1)
  }

  const { data, error } = await query
  if (error) return { error: error.message }

  return (data ?? []).map((row) => ({
    id: row.id,
    marketId: row.market_id,
    polymarketMarketId: row.markets?.polymarket_market_id ?? '',
    slug: row.markets?.slug ?? null,
    title: row.markets?.title ?? '',
    image: row.markets?.image_url ?? null,
    category: row.markets?.category ?? null,
    side: row.side,
    shares: Number(row.shares),
    avgPrice: Number(row.avg_price),
    totalCost: Number(row.total_cost),
    currentPrice: row.current_price !== null ? Number(row.current_price) : null,
    currentValue: row.current_value !== null ? Number(row.current_value) : null,
    unrealizedPnl: row.unrealized_pnl !== null ? Number(row.unrealized_pnl) : null,
    unrealizedPnlPct: row.unrealized_pnl_pct !== null ? Number(row.unrealized_pnl_pct) : null,
    isDemo: row.is_demo,
    isOpen: row.is_open ?? false,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
  }))
}

/** Lookup singola position con verifica ownership. */
export async function findPositionForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  positionId: string
): Promise<{
  id: string
  shares: number
  avgPrice: number
  side: string
  isDemo: boolean
  isOpen: boolean
  marketId: string
} | null> {
  const { data } = await supabase
    .from('positions')
    .select('id, shares, avg_price, side, is_demo, is_open, market_id')
    .eq('id', positionId)
    .eq('user_id', userId)
    .maybeSingle()
  if (!data) return null
  return {
    id: data.id,
    shares: Number(data.shares),
    avgPrice: Number(data.avg_price),
    side: data.side,
    isDemo: data.is_demo,
    isOpen: data.is_open ?? false,
    marketId: data.market_id,
  }
}
