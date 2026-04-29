import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

const PERIODS_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, all: 365 }

/**
 * GET /api/v1/users/me/equity-curve?is_demo=false&period=30d
 * Sprint 5.2.2 — Equity curve data per chart.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const url = new URL(request.url)
  const isDemo = url.searchParams.get('is_demo') === 'true'
  const period = url.searchParams.get('period') ?? '30d'
  const days = PERIODS_DAYS[period] ?? 30
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString().split('T')[0]

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('equity_curve')
    .select(
      'snapshot_date, total_value, cash_balance, portfolio_value, unrealized_pnl, realized_pnl'
    )
    .eq('user_id', auth.userId)
    .eq('is_demo', isDemo)
    .gte('snapshot_date', since!)
    .order('snapshot_date', { ascending: true })
    .limit(365)

  if (error) {
    console.error('[equity-curve]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura equity_curve', 500)
  }

  return NextResponse.json({ items: data ?? [], period, is_demo: isDemo })
}
