import { NextRequest, NextResponse } from 'next/server'
import { getPricesHistory, PriceHistoryInterval, type MarketPrice } from '@/lib/polymarket/clob'

const INTERVAL_MAP: Record<string, PriceHistoryInterval> = {
  '1h': PriceHistoryInterval.ONE_HOUR,
  '6h': PriceHistoryInterval.SIX_HOURS,
  '1d': PriceHistoryInterval.ONE_DAY,
  '7d': PriceHistoryInterval.ONE_WEEK,
  '30d': PriceHistoryInterval.ONE_WEEK, // SDK max è 1w; 30d fallback su 1w
  all: PriceHistoryInterval.MAX,
}

/**
 * GET /api/v1/markets/[marketId]/price-history?period=1h|6h|1d|7d|all
 *
 * `marketId` = clobTokenIds[0] (YES token id del market).
 * Sprint 3.5.4 — legge direttamente dalla CLOB V2 API, niente DB.
 * Cache Next.js ISR: 300s (5 min) — bilancia freschezza vs rate limit.
 */
export const revalidate = 300

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ marketId: string }> }
): Promise<NextResponse> {
  const { marketId } = await context.params
  if (!marketId) {
    return NextResponse.json(
      { error: { code: 'MISSING_ID', message: 'marketId richiesto' } },
      { status: 400 }
    )
  }

  const url = new URL(request.url)
  const period = url.searchParams.get('period') ?? '7d'
  const interval = INTERVAL_MAP[period] ?? PriceHistoryInterval.ONE_WEEK

  try {
    const points: MarketPrice[] = await getPricesHistory(marketId, interval)
    return NextResponse.json({
      market_id: marketId,
      period,
      items: points.map((p) => ({
        timestamp: new Date(p.t * 1000).toISOString(),
        yes_price: p.p,
        no_price: 1 - p.p,
      })),
    })
  } catch (err) {
    console.error('[price-history CLOB]', err)
    return NextResponse.json({
      market_id: marketId,
      period,
      items: [],
    })
  }
}
