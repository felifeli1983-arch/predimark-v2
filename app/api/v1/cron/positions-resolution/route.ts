import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/cron/positions-resolution
 *
 * Sprint 4.5.2 — Auto-update positions on resolution.
 * Vercel cron daily 02:00 UTC (vercel.json).
 *
 * Logica:
 * 1. Markets risolti negli ultimi 7d (resolved_at IS NOT NULL)
 * 2. Per ogni position aperta sul market resolved → calcola final value + pnl
 * 3. Close position (is_open=false, closed_at) + insert notification
 *
 * Auth: header `Authorization: Bearer ${CRON_SECRET}` (Vercel cron passa secret).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return ERR('AUTH_INVALID', 'Cron secret invalid', 401)
  }

  const supabase = createAdminClient()

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()

    const { data: resolvedMarkets, error: marketsErr } = await supabase
      .from('markets')
      .select('id, slug, title, resolved_outcome, resolved_at')
      .not('resolved_at', 'is', null)
      .gte('resolved_at', sevenDaysAgo)
      .limit(500)

    if (marketsErr) {
      console.error('[cron positions-resolution] markets', marketsErr)
      return ERR('INTERNAL_ERROR', 'Errore fetch markets', 500)
    }

    if (!resolvedMarkets || resolvedMarkets.length === 0) {
      return NextResponse.json({
        ok: true,
        processed: 0,
        message: 'No resolved markets in last 7d',
      })
    }

    let positionsUpdated = 0
    let notificationsSent = 0

    for (const market of resolvedMarkets) {
      const { data: positions, error: posErr } = await supabase
        .from('positions')
        .select('id, user_id, side, shares, total_cost, is_demo')
        .eq('market_id', market.id)
        .eq('is_open', true)

      if (posErr || !positions) continue

      for (const pos of positions) {
        const wonOutcome = market.resolved_outcome
        const isWin = wonOutcome === pos.side
        const finalPrice = isWin ? 1.0 : 0.0
        const finalValue = Number(pos.shares ?? 0) * finalPrice
        const finalPnl = finalValue - Number(pos.total_cost ?? 0)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updErr } = await (supabase.from('positions') as any)
          .update({
            is_open: false,
            current_price: finalPrice,
            current_value: finalValue,
            unrealized_pnl: finalPnl,
            unrealized_pnl_pct: pos.total_cost ? (finalPnl / Number(pos.total_cost)) * 100 : 0,
            closed_at: market.resolved_at,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pos.id)
          .eq('is_open', true)

        if (!updErr) {
          positionsUpdated++

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: notifErr } = await (supabase.from('notifications') as any).insert({
            user_id: pos.user_id,
            title: isWin ? '🎉 Posizione vincente!' : '📊 Posizione risolta',
            body: isWin
              ? `Hai vinto su "${market.title}": ${pos.shares} ${pos.side} → +$${finalPnl.toFixed(2)}`
              : `"${market.title}" risolta. P&L: $${finalPnl.toFixed(2)}`,
            type: 'position_resolved',
            priority: isWin ? 'high' : 'normal',
            related_market_id: market.id,
          })

          if (!notifErr) notificationsSent++
        }
      }
    }

    return NextResponse.json({
      ok: true,
      markets_processed: resolvedMarkets.length,
      positions_updated: positionsUpdated,
      notifications_sent: notificationsSent,
    })
  } catch (err) {
    console.error('[cron positions-resolution]', err)
    return ERR('INTERNAL_ERROR', 'Errore generale cron', 500)
  }
}
