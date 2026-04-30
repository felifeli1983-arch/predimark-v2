import { NextRequest, NextResponse } from 'next/server'
import { fetchHolders } from '@/lib/polymarket/data-api'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/markets/[marketId]/holders?limit=10
 *
 * Top holders di un market raggruppati per outcome token. `marketId` qui
 * è il conditionId Polymarket (bytes32 hex). Wrapper attorno al
 * Data API pubblico (no auth richiesta).
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ marketId: string }> }
): Promise<NextResponse> {
  const { marketId } = await context.params
  if (!marketId || !marketId.startsWith('0x')) {
    return ERR('VALIDATION', 'marketId (conditionId) mancante o non valido', 400)
  }
  const url = new URL(request.url)
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') ?? 10)))

  try {
    const groups = await fetchHolders(marketId, limit)
    return NextResponse.json({ items: groups })
  } catch (err) {
    console.error('[holders]', err)
    return ERR('UPSTREAM_ERROR', 'Errore fetch holders Polymarket', 502)
  }
}
