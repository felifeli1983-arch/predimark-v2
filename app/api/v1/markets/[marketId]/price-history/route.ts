import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

const PERIODS = {
  '1d': 24 * 3600 * 1000,
  '7d': 7 * 24 * 3600 * 1000,
  '30d': 30 * 24 * 3600 * 1000,
  all: 365 * 24 * 3600 * 1000,
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * GET /api/v1/markets/[marketId]/price-history?period=1d|7d|30d|all
 * Sprint 3.5.2 — fornisce serie storica per chart.
 *
 * `marketId` può essere:
 *  - UUID locale (markets.id)
 *  - Polymarket market id (text) — risolto via markets.polymarket_market_id
 *
 * Source: tabella `price_history`, popolata dal cron `sync-price-history`
 * (ogni 6h). Pubblico — no auth.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ marketId: string }> }
): Promise<NextResponse> {
  const { marketId } = await context.params
  if (!marketId) return ERR('MISSING_ID', 'marketId richiesto', 400)

  const url = new URL(_request.url)
  const period = (url.searchParams.get('period') ?? '7d') as keyof typeof PERIODS
  const ms = PERIODS[period] ?? PERIODS['7d']
  const since = new Date(Date.now() - ms).toISOString()

  const supabase = createAdminClient()

  // Risolve Polymarket text id → UUID locale, se necessario.
  let localId: string | null = UUID_RE.test(marketId) ? marketId : null
  if (!localId) {
    const { data: row } = await supabase
      .from('markets')
      .select('id')
      .eq('polymarket_market_id', marketId)
      .maybeSingle()
    localId = row?.id ?? null
  }
  if (!localId) {
    // Mercato non ancora syncato localmente: nessuna storia da mostrare.
    return NextResponse.json({ market_id: marketId, period, items: [] })
  }

  const { data, error } = await supabase
    .from('price_history')
    .select('recorded_at, yes_price, no_price')
    .eq('market_id', localId)
    .gte('recorded_at', since)
    .order('recorded_at', { ascending: true })
    .limit(500)

  if (error) {
    console.error('[price-history]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura price_history', 500)
  }

  return NextResponse.json({
    market_id: marketId,
    period,
    items: data ?? [],
  })
}
