import { NextRequest, NextResponse } from 'next/server'
import { getMarketRecentTrades } from '@/lib/polymarket/clob'

/**
 * GET /api/v1/markets/[marketId]/recent-trades
 *
 * `marketId` = `conditionId` del market (da `GammaMarket.conditionId`).
 * Sprint 3.5.4 — ultimi trade direttamente dalla CLOB V2 API, no DB.
 * Cache ISR: 60s (più freschi del chart).
 */
export const revalidate = 60

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ marketId: string }> }
): Promise<NextResponse> {
  const { marketId } = await context.params
  if (!marketId) {
    return NextResponse.json(
      { error: { code: 'MISSING_ID', message: 'marketId richiesto' } },
      { status: 400 }
    )
  }
  const trades = await getMarketRecentTrades(marketId)
  return NextResponse.json({ items: trades.slice(0, 50) })
}
