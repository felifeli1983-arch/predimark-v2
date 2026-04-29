import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isBotEnabled, sendMessage } from '@/lib/telegram/bot'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/cron/follow-notifications
 *
 * Sprint 6.5.2 — Notifiche follow dispatcher.
 * Cron every 15 min (vercel.json).
 *
 * Logica:
 * 1. Fetch trades nuovi (executed_at last 15min) da Creator verified
 * 2. Per ogni trade, fetch follows attivi del Creator
 * 3. Per ogni follower con notify_via_push=true → INSERT notification
 * 4. Se follower ha telegram_chat_id → sendMessage Telegram bot (se abilitato)
 *
 * Auth: header `Authorization: Bearer ${CRON_SECRET}`.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return ERR('AUTH_INVALID', 'Cron secret invalid', 401)
  }

  const supabase = createAdminClient()

  try {
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()

    // 1. Fetch trades recenti from Creator verified (REAL only, no demo)
    const { data: trades, error: tradesErr } = await supabase
      .from('trades')
      .select('id, user_id, market_id, side, total_amount, trade_type, executed_at')
      .gte('executed_at', fifteenMinAgo)
      .eq('is_demo', false)
      .limit(500)

    if (tradesErr || !trades) {
      console.error('[cron follow-notifications] trades', tradesErr)
      return NextResponse.json({ ok: true, processed: 0, message: 'no trades' })
    }

    // 2. Filter trades che sono di Creator verified
    const creatorIds = new Set<string>()
    for (const t of trades) {
      const { data: creator } = await supabase
        .from('creators')
        .select('user_id')
        .eq('user_id', t.user_id)
        .eq('is_verified', true)
        .eq('is_suspended', false)
        .maybeSingle()
      if (creator) creatorIds.add(t.user_id)
    }

    let notificationsSent = 0
    let telegramSent = 0

    for (const trade of trades) {
      if (!creatorIds.has(trade.user_id)) continue

      // 3. Fetch followers
      const { data: follows } = await supabase
        .from('follows')
        .select('follower_user_id, notify_via_push, notify_via_telegram, notify_new_position')
        .eq('followed_creator_id', trade.user_id)
        .eq('notify_new_position', true)

      if (!follows) continue

      for (const f of follows) {
        if (!f.notify_via_push && !f.notify_via_telegram) continue

        // INSERT notification
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: notifErr } = await (supabase.from('notifications') as any).insert({
          user_id: f.follower_user_id,
          title: '🔔 Creator ha nuova posizione',
          body: `Trade ${trade.trade_type} ${trade.side} di $${Number(trade.total_amount ?? 0).toFixed(2)}`,
          type: 'creator_new_position',
          priority: 'normal',
          related_trade_id: trade.id,
          related_market_id: trade.market_id,
          related_creator_id: trade.user_id,
        })
        if (!notifErr) notificationsSent++

        // Send Telegram if enabled
        if (f.notify_via_telegram && isBotEnabled()) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: telegramSub } = await (
            supabase.from('telegram_subscriptions' as any) as any
          )
            .select('telegram_chat_id, is_linked')
            .eq('user_id', f.follower_user_id)
            .maybeSingle()
          if (telegramSub?.is_linked && telegramSub.telegram_chat_id) {
            const sent = await sendMessage({
              chatId: telegramSub.telegram_chat_id,
              text: `🔔 <b>Creator ha tradato</b>\n${trade.trade_type} ${trade.side} a $${Number(trade.total_amount ?? 0).toFixed(2)}\n<a href="https://auktora.com/event/${trade.market_id}">Vedi market</a>`,
            })
            if (sent) telegramSent++
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      trades_scanned: trades.length,
      creators_active: creatorIds.size,
      notifications_sent: notificationsSent,
      telegram_sent: telegramSent,
    })
  } catch (err) {
    console.error('[cron follow-notifications]', err)
    return ERR('INTERNAL_ERROR', 'Errore generale cron', 500)
  }
}
