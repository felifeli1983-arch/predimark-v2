import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

interface ClosePartialParams {
  positionId: string
  remainingShares: number
  currentPrice: number
}

/**
 * Aggiorna una position dopo una sell parziale o totale.
 *  - se `remainingShares <= 0`: chiude la posizione (`is_open=false`, `closed_at=NOW`).
 *  - altrimenti: aggiorna shares + current_value (no avg_price change).
 */
export async function applyPartialSellToPosition(
  supabase: SupabaseClient<Database>,
  params: ClosePartialParams
): Promise<{ closed: boolean } | { error: string }> {
  const fullyClosed = params.remainingShares <= 0
  const update = fullyClosed
    ? {
        shares: 0,
        current_value: 0,
        is_open: false,
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    : {
        shares: params.remainingShares,
        current_price: params.currentPrice,
        current_value: params.remainingShares * params.currentPrice,
        updated_at: new Date().toISOString(),
      }

  const { error } = await supabase.from('positions').update(update).eq('id', params.positionId)
  if (error) return { error: error.message }
  return { closed: fullyClosed }
}
