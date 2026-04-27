import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { listUserPositions, summarizeUserPositions } from '@/lib/positions/queries'

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
 * GET /api/v1/users/me/positions
 * Query: ?is_demo=true|false (default false), ?only_open=true (default true),
 *        ?per_page=20 (max 100), ?page=1
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const url = new URL(request.url)
  const isDemo = url.searchParams.get('is_demo') === 'true'
  const onlyOpen = url.searchParams.get('only_open') !== 'false'
  const { page, perPage } = parsePaging(url)
  const offset = (page - 1) * perPage

  const supabase = createAdminClient()
  const [list, summary] = await Promise.all([
    listUserPositions(supabase, auth.userId, {
      isDemo,
      onlyOpen,
      limit: perPage,
      offset,
    }),
    summarizeUserPositions(supabase, auth.userId, { isDemo, onlyOpen }),
  ])
  if ('error' in list) {
    console.error('[positions GET]', list.error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Errore lettura positions' } },
      { status: 500 }
    )
  }
  if ('error' in summary) {
    console.error('[positions GET summary]', summary.error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Errore aggregati positions' } },
      { status: 500 }
    )
  }

  return NextResponse.json({
    items: list.items,
    meta: {
      total: list.total,
      page,
      perPage,
      totalValue: summary.totalValue,
      totalPnl: summary.totalPnl,
    },
  })
}
