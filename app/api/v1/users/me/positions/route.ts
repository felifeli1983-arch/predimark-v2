import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { listUserPositions } from '@/lib/positions/queries'

/**
 * GET /api/v1/users/me/positions
 * Query: ?is_demo=true|false (default false), ?only_open=true (default true)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const url = new URL(request.url)
  const isDemo = url.searchParams.get('is_demo') === 'true'
  const onlyOpen = url.searchParams.get('only_open') !== 'false'

  const result = await listUserPositions(createAdminClient(), auth.userId, {
    isDemo,
    onlyOpen,
  })
  if ('error' in result) {
    console.error('[positions GET]', result.error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Errore lettura positions' } },
      { status: 500 }
    )
  }

  const totalValue = result.reduce((acc, p) => acc + (p.currentValue ?? 0), 0)
  const totalPnl = result.reduce((acc, p) => acc + (p.unrealizedPnl ?? 0), 0)

  return NextResponse.json({
    items: result,
    meta: { total: result.length, totalValue, totalPnl },
  })
}
