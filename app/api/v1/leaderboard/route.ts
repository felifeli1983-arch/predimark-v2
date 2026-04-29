import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

type Tab = 'creators' | 'external' | 'both'
type Period = 'today' | '7d' | '30d' | 'all'

const ALLOWED_TABS: ReadonlySet<Tab> = new Set(['creators', 'external', 'both'])
const ALLOWED_PERIODS: ReadonlySet<Period> = new Set(['today', '7d', '30d', 'all'])

function parseTab(value: string | null): Tab {
  return value && ALLOWED_TABS.has(value as Tab) ? (value as Tab) : 'both'
}

function parsePeriod(value: string | null): Period {
  return value && ALLOWED_PERIODS.has(value as Period) ? (value as Period) : '30d'
}

function rankColumn(period: Period): string {
  switch (period) {
    case 'today':
      return 'rank_today'
    case '7d':
      return 'rank_7d'
    case '30d':
      return 'rank_30d'
    case 'all':
      return 'rank_all_time'
  }
}

/**
 * GET /api/v1/leaderboard?tab=creators|external|both&period=today|7d|30d|all&limit=50&offset=0
 * Pubblico — no auth richiesta.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)
  const tab = parseTab(url.searchParams.get('tab'))
  const period = parsePeriod(url.searchParams.get('period'))
  const limitRaw = Number(url.searchParams.get('limit'))
  const offsetRaw = Number(url.searchParams.get('offset'))
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(Math.floor(limitRaw), 100) : 50
  const offset = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? Math.floor(offsetRaw) : 0

  const supabase = createAdminClient()

  try {
    if (tab === 'creators') {
      const { data, error, count } = await supabase
        .from('creators')
        .select(
          'user_id, score, tier, followers_count, copiers_active, total_earnings, bio_creator, twitter_handle, discord_handle, specialization, verified_at',
          { count: 'exact' }
        )
        .eq('is_verified', true)
        .eq('is_suspended', false)
        .eq('is_public', true)
        .order('total_earnings', { ascending: false })
        .range(offset, offset + limit - 1)
      if (error) throw error
      return NextResponse.json({
        items: (data ?? []).map((c) => ({ kind: 'creator' as const, ...c })),
        meta: { total: count ?? 0, hasMore: (count ?? 0) > offset + limit, tab, period },
      })
    }

    if (tab === 'external') {
      const rankCol = rankColumn(period)
      const { data, error, count } = await supabase
        .from('external_traders')
        .select(
          `id, wallet_address, polymarket_nickname, polymarket_pnl_total, polymarket_volume_total, win_rate, trades_count, specialization, ${rankCol}, last_trade_at`,
          { count: 'exact' }
        )
        .eq('is_active', true)
        .eq('is_blocked', false)
        .order(rankCol, { ascending: true, nullsFirst: false })
        .range(offset, offset + limit - 1)
      if (error) throw error
      const items = (data as unknown as Record<string, unknown>[] | null) ?? []
      return NextResponse.json({
        items: items.map((t) => ({ kind: 'external' as const, ...t })),
        meta: { total: count ?? 0, hasMore: (count ?? 0) > offset + limit, tab, period },
      })
    }

    // tab === 'both' — mix 50/50
    const half = Math.ceil(limit / 2)
    const rankCol = rankColumn(period)
    const [creators, externals] = await Promise.all([
      supabase
        .from('creators')
        .select(
          'user_id, score, tier, followers_count, copiers_active, total_earnings, bio_creator, twitter_handle, specialization, verified_at'
        )
        .eq('is_verified', true)
        .eq('is_suspended', false)
        .eq('is_public', true)
        .order('total_earnings', { ascending: false })
        .limit(half),
      supabase
        .from('external_traders')
        .select(
          `id, wallet_address, polymarket_nickname, polymarket_pnl_total, polymarket_volume_total, win_rate, trades_count, specialization, ${rankCol}, last_trade_at`
        )
        .eq('is_active', true)
        .eq('is_blocked', false)
        .order(rankCol, { ascending: true, nullsFirst: false })
        .limit(half),
    ])
    if (creators.error) throw creators.error
    if (externals.error) throw externals.error
    const externalRows = (externals.data as unknown as Record<string, unknown>[] | null) ?? []
    const items = [
      ...(creators.data ?? []).map((c) => ({ kind: 'creator' as const, ...c })),
      ...externalRows.map((t) => ({ kind: 'external' as const, ...t })),
    ]
    return NextResponse.json({
      items,
      meta: { total: items.length, hasMore: false, tab, period },
    })
  } catch (err) {
    console.error('[leaderboard GET]', err)
    return ERR('INTERNAL_ERROR', 'Errore lettura leaderboard', 500)
  }
}
