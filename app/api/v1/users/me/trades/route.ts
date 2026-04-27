import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { listTradesHistory } from '@/lib/trades/queries'

const VALID_TYPES = new Set(['open', 'close', 'resolution'])
const VALID_PERIODS = new Set(['today', '7d', '30d', 'all'])
const DEFAULT_PER_PAGE = 20
const MAX_PER_PAGE = 100

function parsePaging(url: URL): { page: number; perPage: number } {
  const rawPage = Number(url.searchParams.get('page'))
  const rawPerPage = Number(url.searchParams.get('per_page'))
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
  const perPage =
    Number.isFinite(rawPerPage) && rawPerPage > 0
      ? Math.min(Math.floor(rawPerPage), MAX_PER_PAGE)
      : DEFAULT_PER_PAGE
  return { page, perPage }
}

/**
 * GET /api/v1/users/me/trades
 * Query: ?is_demo, ?type=open|close|resolution, ?period=today|7d|30d|all,
 *        ?per_page=20 (max 100), ?page=1
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const url = new URL(request.url)
  const isDemo = url.searchParams.get('is_demo') === 'true'
  const type = url.searchParams.get('type')
  const period = url.searchParams.get('period')
  const { page, perPage } = parsePaging(url)
  const offset = (page - 1) * perPage

  const result = await listTradesHistory(createAdminClient(), auth.userId, {
    isDemo,
    type: type && VALID_TYPES.has(type) ? (type as 'open' | 'close' | 'resolution') : undefined,
    period:
      period && VALID_PERIODS.has(period) ? (period as 'today' | '7d' | '30d' | 'all') : undefined,
    limit: perPage,
    offset,
  })
  if ('error' in result) {
    console.error('[trades GET]', result.error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Errore lettura trades' } },
      { status: 500 }
    )
  }

  return NextResponse.json({
    items: result.items,
    meta: { total: result.total, page, perPage },
  })
}
