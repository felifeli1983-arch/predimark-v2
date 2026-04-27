import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { listTradesHistory } from '@/lib/trades/queries'

const VALID_TYPES = new Set(['open', 'close', 'resolution'])
const VALID_PERIODS = new Set(['today', '7d', '30d', 'all'])

/**
 * GET /api/v1/users/me/trades
 * Query: ?is_demo, ?type=open|close|resolution, ?period=today|7d|30d|all
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const url = new URL(request.url)
  const isDemo = url.searchParams.get('is_demo') === 'true'
  const type = url.searchParams.get('type')
  const period = url.searchParams.get('period')

  const result = await listTradesHistory(createAdminClient(), auth.userId, {
    isDemo,
    type: type && VALID_TYPES.has(type) ? (type as 'open' | 'close' | 'resolution') : undefined,
    period:
      period && VALID_PERIODS.has(period) ? (period as 'today' | '7d' | '30d' | 'all') : undefined,
    limit: 50,
  })
  if ('error' in result) {
    console.error('[trades GET]', result.error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Errore lettura trades' } },
      { status: 500 }
    )
  }

  return NextResponse.json({ items: result, meta: { total: result.length } })
}
