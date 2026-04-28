import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

interface InsertParams {
  userId: string
  marketId: string
  positionId: string
  side: string
  shares: number
  pricePerShare: number
  amountUsdc: number
  isDemo: boolean
  source?: 'manual' | 'copy'
  /** Polymarket CLOB orderID (solo REAL trades). */
  polymarketOrderId?: string
}

/**
 * Inserisce un trade aperto (`trade_type='open'`) collegato a una posizione.
 * Per close trades userà MA4.5 + sell flow con `trade_type='close'`.
 */
export async function insertOpenTrade(
  supabase: SupabaseClient<Database>,
  params: InsertParams
): Promise<{ tradeId: string } | { error: string }> {
  const { data, error } = await supabase
    .from('trades')
    .insert({
      user_id: params.userId,
      market_id: params.marketId,
      position_id: params.positionId,
      trade_type: 'open',
      side: params.side,
      shares: params.shares,
      price: params.pricePerShare,
      total_amount: params.amountUsdc,
      source: params.source ?? 'manual',
      is_demo: params.isDemo,
      polymarket_order_id: params.polymarketOrderId ?? null,
    })
    .select('id')
    .single()

  if (error || !data) return { error: error?.message ?? 'insert failed' }
  return { tradeId: data.id }
}
