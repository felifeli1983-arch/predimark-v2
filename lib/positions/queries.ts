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
  /** Token id specifico del side della posizione (per sell REAL via CLOB). */
  tokenId: string | null
  /** Polymarket conditionId — fetchato al sell per tickSize/negRisk reali. */
  conditionId: string | null
}

interface ListOptions {
  isDemo: boolean
  onlyOpen?: boolean
  limit?: number
  offset?: number
}

/** Lista positions con join markets, filtrate per is_demo + open. Ritorna anche count totale. */
export async function listUserPositions(
  supabase: SupabaseClient<Database>,
  userId: string,
  opts: ListOptions
): Promise<{ items: PositionItem[]; total: number } | { error: string }> {
  let query = supabase
    .from('positions')
    .select(
      `
        id, market_id, side, shares, avg_price, total_cost,
        current_price, current_value, unrealized_pnl, unrealized_pnl_pct,
        is_demo, is_open, opened_at, closed_at,
        markets ( id, polymarket_market_id, slug, title, image_url, category, clob_token_ids )
      `,
      { count: 'exact' }
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

  const { data, error, count } = await query
  if (error) return { error: error.message }

  const items = (data ?? []).map((row) => {
    const tokenIds = (row.markets?.clob_token_ids ?? null) as [string, string] | null
    const sideLower = row.side.toLowerCase()
    const tokenId =
      tokenIds && (sideLower === 'yes' || sideLower === 'up')
        ? tokenIds[0]
        : tokenIds && (sideLower === 'no' || sideLower === 'down')
          ? tokenIds[1]
          : (tokenIds?.[0] ?? null)
    return {
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
      tokenId,
      // conditionId non in DB schema — SellConfirmModal usa tokenId per
      // getTickAndRiskByToken (lookup tickSize+negRisk diretto).
      conditionId: null,
    }
  })

  return { items, total: count ?? items.length }
}

/**
 * Aggregate (totalValue, totalPnl) calcolato server-side su TUTTE le positions
 * dell'user che matchano i filtri — indipendente dalla paginazione.
 */
export async function summarizeUserPositions(
  supabase: SupabaseClient<Database>,
  userId: string,
  opts: { isDemo: boolean; onlyOpen?: boolean }
): Promise<{ totalValue: number; totalPnl: number } | { error: string }> {
  let query = supabase
    .from('positions')
    .select('current_value, unrealized_pnl')
    .eq('user_id', userId)
    .eq('is_demo', opts.isDemo)
  if (opts.onlyOpen) query = query.eq('is_open', true)

  const { data, error } = await query
  if (error) return { error: error.message }
  const totalValue = (data ?? []).reduce(
    (acc, r) => acc + (r.current_value !== null ? Number(r.current_value) : 0),
    0
  )
  const totalPnl = (data ?? []).reduce(
    (acc, r) => acc + (r.unrealized_pnl !== null ? Number(r.unrealized_pnl) : 0),
    0
  )
  return { totalValue, totalPnl }
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
