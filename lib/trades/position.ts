import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

interface UpsertParams {
  userId: string
  marketId: string
  side: string
  shares: number
  pricePerShare: number
  amountUsdc: number
  isDemo: boolean
}

/**
 * Apre una nuova posizione o incrementa quella esistente per
 * stesso (user, market, side, isDemo, is_open=true).
 *
 * Strategia DCA: ricalcola avg_price come media ponderata su shares + total_cost.
 *
 * Ritorna positionId su successo, o errore strutturato.
 */
export async function upsertOpenPosition(
  supabase: SupabaseClient<Database>,
  params: UpsertParams
): Promise<{ positionId: string } | { error: string }> {
  const { data: existing } = await supabase
    .from('positions')
    .select('id, shares, total_cost')
    .eq('user_id', params.userId)
    .eq('market_id', params.marketId)
    .eq('side', params.side)
    .eq('is_demo', params.isDemo)
    .eq('is_open', true)
    .maybeSingle()

  if (existing) {
    const newShares = Number(existing.shares) + params.shares
    const newTotalCost = Number(existing.total_cost) + params.amountUsdc
    const newAvgPrice = newTotalCost / newShares

    const { error } = await supabase
      .from('positions')
      .update({
        shares: newShares,
        total_cost: newTotalCost,
        avg_price: newAvgPrice,
        current_price: params.pricePerShare,
        current_value: newShares * params.pricePerShare,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (error) return { error: error.message }
    return { positionId: existing.id }
  }

  const { data: created, error } = await supabase
    .from('positions')
    .insert({
      user_id: params.userId,
      market_id: params.marketId,
      side: params.side,
      shares: params.shares,
      avg_price: params.pricePerShare,
      total_cost: params.amountUsdc,
      current_price: params.pricePerShare,
      current_value: params.amountUsdc,
      is_demo: params.isDemo,
      is_open: true,
    })
    .select('id')
    .single()

  if (error || !created) return { error: error?.message ?? 'insert failed' }
  return { positionId: created.id }
}
