import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { findMarketByPolymarketId } from '@/lib/markets/upsert'
import { removeFromWatchlist } from '@/lib/watchlist/queries'

/**
 * DELETE /api/v1/watchlist/[marketId]
 * `marketId` parametro = polymarket_market_id (stringa Gamma).
 * Idempotente: 204 anche se la riga non esisteva.
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
  const market = await findMarketByPolymarketId(supabase, marketId)
  if (!market) {
    // Mai stato in watchlist → idempotente.
    return new NextResponse(null, { status: 204 })
  }

  const result = await removeFromWatchlist(supabase, auth.userId, market.id)
  if (result?.error) {
    console.error('[watchlist DELETE]', result.error)
    return NextResponse.json(
      { error: { code: 'DELETE_FAILED', message: 'Errore rimozione' } },
      { status: 500 }
    )
  }
  return new NextResponse(null, { status: 204 })
}
