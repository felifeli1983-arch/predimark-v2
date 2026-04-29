import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

interface KPIData {
  dau: number
  totalUsers: number
  activeUsers7d: number
  signups24h: number
  totalTrades: number
  trades24h: number
  totalVolume: number
  volume24h: number
  kycPending: number
  refundsPending: number
}

/**
 * GET /api/v1/admin/analytics?period=24h|7d|30d|all
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await requireAdmin(request, ['super_admin', 'admin', 'moderator', 'viewer'])
  if ('error' in result) return result.error

  const supabase = createAdminClient()

  try {
    const now = new Date()
    const _24h = new Date(now.getTime() - 24 * 3600 * 1000).toISOString()
    const _7d = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString()

    const [totalUsers, activeUsers7d, signups24h, totalTrades, trades24h, tradesAll, kycPending] =
      await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .gte('last_login_at', _7d),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', _24h),
        supabase.from('trades').select('*', { count: 'exact', head: true }),
        supabase
          .from('trades')
          .select('*', { count: 'exact', head: true })
          .gte('executed_at', _24h),
        supabase.from('trades').select('total_amount, executed_at'),
        supabase
          .from('kyc_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
      ])

    const allTrades = (tradesAll.data ?? []) as Array<{
      total_amount: number | null
      executed_at: string | null
    }>
    const totalVolume = allTrades.reduce((sum, t) => sum + Number(t.total_amount ?? 0), 0)
    const volume24h = allTrades
      .filter((t) => t.executed_at && t.executed_at >= _24h)
      .reduce((sum, t) => sum + Number(t.total_amount ?? 0), 0)

    const data: KPIData = {
      dau: activeUsers7d.count ?? 0,
      totalUsers: totalUsers.count ?? 0,
      activeUsers7d: activeUsers7d.count ?? 0,
      signups24h: signups24h.count ?? 0,
      totalTrades: totalTrades.count ?? 0,
      trades24h: trades24h.count ?? 0,
      totalVolume,
      volume24h,
      kycPending: kycPending.count ?? 0,
      refundsPending: 0,
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[admin analytics]', err)
    return ERR('INTERNAL_ERROR', 'Errore lettura analytics', 500)
  }
}
