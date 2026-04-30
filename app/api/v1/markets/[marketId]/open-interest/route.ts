import { NextRequest, NextResponse } from 'next/server'
import { fetchOpenInterest } from '@/lib/polymarket/data-api'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/markets/[marketId]/open-interest
 *
 * Open interest di un market (USD value dei conditional tokens
 * outstanding). `marketId` è conditionId. Wrapper attorno al Data API
 * pubblico, cache 60s.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ marketId: string }> }
): Promise<NextResponse> {
  const { marketId } = await context.params
  if (!marketId || !marketId.startsWith('0x')) {
    return ERR('VALIDATION', 'marketId (conditionId) mancante o non valido', 400)
  }
  try {
    const value = await fetchOpenInterest(marketId)
    return NextResponse.json({ value })
  } catch (err) {
    console.error('[oi]', err)
    return ERR('UPSTREAM_ERROR', 'Errore fetch OI Polymarket', 502)
  }
}
