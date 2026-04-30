import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { getBuilderTrades, aggregateBuilderStats } from '@/lib/polymarket/builder'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/admin/builder/trades?limit=100&market=&asset_id=&before=&after=
 *
 * Admin-only — fetcha i trade attribuiti al builder code Auktora dal
 * CLOB Polymarket (BuilderClient L2 auth via env vars).
 *
 * Ritorna `items` + `stats` aggregate (volume USDC, fee, unique
 * traders/markets).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request, ['super_admin', 'admin'])
  if ('error' in auth) return auth.error

  const url = new URL(request.url)
  const limit = Math.min(500, Math.max(1, Number(url.searchParams.get('limit') ?? 100)))
  const market = url.searchParams.get('market') ?? undefined
  const assetId = url.searchParams.get('asset_id') ?? undefined
  const before = url.searchParams.get('before') ?? undefined
  const after = url.searchParams.get('after') ?? undefined

  const trades = await getBuilderTrades({ limit, market, assetId, before, after })
  if (trades === null) {
    return ERR(
      'BUILDER_NOT_CONFIGURED',
      'Builder code/creds non configurati (POLYMARKET_BUILDER_CODE + POLYMARKET_BUILDER_API_KEY/SECRET/PASSPHRASE)',
      503
    )
  }

  const stats = aggregateBuilderStats(trades)
  return NextResponse.json({ items: trades, stats })
}
