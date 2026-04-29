import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/cron/equity-snapshot
 *
 * Sprint 5.2.2 — Cron daily snapshot equity_curve.
 * Per ogni utente attivo last 30d, scrive snapshot:
 *   { user_id, date, total_value (cash + positions), pnl_realized, pnl_unrealized, is_demo }
 *
 * Usato per chart equity in `/me/stats` (sprint 5.3.3).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return ERR('AUTH_INVALID', 'Cron secret invalid', 401)
  }

  const supabase = createAdminClient()

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()

    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .gte('last_login_at', thirtyDaysAgo)
      .limit(10000)

    if (error) {
      console.error('[cron equity-snapshot] users', error)
      return ERR('INTERNAL_ERROR', 'Errore fetch users', 500)
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ ok: true, processed: 0 })
    }

    const today = new Date().toISOString().split('T')[0]
    let snapshotsCreated = 0

    for (const user of users) {
      for (const isDemo of [false, true]) {
        // Aggrega positions
        const { data: positions } = await supabase
          .from('positions')
          .select('current_value, unrealized_pnl, total_cost')
          .eq('user_id', user.id)
          .eq('is_demo', isDemo)
          .eq('is_open', true)

        const portfolioValue = (positions ?? []).reduce(
          (sum, p) => sum + Number(p.current_value ?? 0),
          0
        )
        const unrealizedPnl = (positions ?? []).reduce(
          (sum, p) => sum + Number(p.unrealized_pnl ?? 0),
          0
        )

        // Aggrega closed trades for realized pnl
        const { data: closedPositions } = await supabase
          .from('positions')
          .select('unrealized_pnl')
          .eq('user_id', user.id)
          .eq('is_demo', isDemo)
          .eq('is_open', false)

        const realizedPnl = (closedPositions ?? []).reduce(
          (sum, p) => sum + Number(p.unrealized_pnl ?? 0),
          0
        )

        // Get cash balance
        const { data: balance } = await supabase
          .from('balances')
          .select(isDemo ? 'demo_balance' : 'usdc_balance')
          .eq('user_id', user.id)
          .maybeSingle()
        const balRow = balance as Record<string, unknown> | null
        const cashBalance = Number(balRow?.[isDemo ? 'demo_balance' : 'usdc_balance'] ?? 0)

        const totalValue = cashBalance + portfolioValue

        // Upsert snapshot (one per day per user per mode)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insErr } = await (supabase.from('equity_curve') as any).upsert(
          {
            user_id: user.id,
            snapshot_date: today,
            total_value: totalValue,
            cash_balance: cashBalance,
            portfolio_value: portfolioValue,
            unrealized_pnl: unrealizedPnl,
            realized_pnl: realizedPnl,
            is_demo: isDemo,
          },
          { onConflict: 'user_id,snapshot_date,is_demo' }
        )

        if (!insErr) snapshotsCreated++
      }
    }

    return NextResponse.json({
      ok: true,
      users_processed: users.length,
      snapshots_created: snapshotsCreated,
    })
  } catch (err) {
    console.error('[cron equity-snapshot]', err)
    return ERR('INTERNAL_ERROR', 'Errore generale cron', 500)
  }
}
