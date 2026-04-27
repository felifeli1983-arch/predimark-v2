import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * DELETE /api/v1/watchlist/[marketId]
 * `marketId` parametro = polymarket_market_id (stringa Gamma).
 *
 * Rimuove il record dalla watchlist dell'utente. Idempotente:
 * 204 anche se la riga non esisteva.
 */
export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ marketId: string }> }
): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const { marketId } = await ctx.params
  if (!marketId) {
    return NextResponse.json(
      { error: { code: 'MISSING_PARAM', message: 'marketId mancante' } },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  // 1. Risolvi internal markets.id da polymarket_market_id
  const { data: market } = await supabase
    .from('markets')
    .select('id')
    .eq('polymarket_market_id', marketId)
    .maybeSingle()

  if (!market) {
    // Mai stato in watchlist (o markets row non esiste). Idempotente: 204.
    return new NextResponse(null, { status: 204 })
  }

  // 2. Delete watchlist row (scope su user_id)
  const { error: delErr } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', auth.userId)
    .eq('market_id', market.id)

  if (delErr) {
    console.error('[watchlist DELETE]', delErr)
    return NextResponse.json(
      { error: { code: 'DELETE_FAILED', message: 'Errore rimozione' } },
      { status: 500 }
    )
  }

  return new NextResponse(null, { status: 204 })
}
