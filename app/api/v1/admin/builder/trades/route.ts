import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { getBuilderTrades, aggregateBuilderStats } from '@/lib/polymarket/builder'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/admin/builder/trades?market=&asset_id=&before=&after=
 *
 * Admin-only — fetcha i trade attribuiti al builder code Auktora dal
 * CLOB Polymarket (BuilderClient L2 auth via env vars). Doc Builder
 * Methods → BuilderTradesPaginatedResponse.
 *
 * Paginazione cursor-based: passa il `nextCursor` ritornato come query
 * param `before` (o `after` per l'ordine opposto) per la prossima pagina.
 *
 * Ritorna:
 *  - `items`: trade della pagina corrente (max ~100, server-side)
 *  - `meta`: { nextCursor, count, limit } — UI per "Load more"
 *  - `stats`: aggregate per LA PAGINA corrente (per stats globali, il
 *    client deve accumulare across pages)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request, ['super_admin', 'admin'])
  if ('error' in auth) return auth.error

  const url = new URL(request.url)
  const market = url.searchParams.get('market') ?? undefined
  const assetId = url.searchParams.get('asset_id') ?? undefined
  const before = url.searchParams.get('before') ?? undefined
  const after = url.searchParams.get('after') ?? undefined

  const res = await getBuilderTrades({ market, assetId, before, after })
  if (res === null) {
    return ERR(
      'BUILDER_NOT_CONFIGURED',
      'Builder code/creds non configurati (POLYMARKET_BUILDER_CODE + POLYMARKET_BUILDER_API_KEY/SECRET/PASSPHRASE)',
      503
    )
  }

  const stats = aggregateBuilderStats(res.trades)
  return NextResponse.json({
    items: res.trades,
    meta: {
      nextCursor: res.nextCursor,
      count: res.count,
      limit: res.limit,
    },
    stats,
  })
}
