import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/traders/[traderId]
 * Profile External Trader Polymarket (no opt-in Auktora).
 * Pubblico — no auth.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ traderId: string }> }
): Promise<NextResponse> {
  const { traderId } = await context.params
  if (!traderId) {
    return ERR('MISSING_ID', 'traderId richiesto', 400)
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('external_traders')
    .select(
      'id, wallet_address, polymarket_nickname, polymarket_pnl_total, polymarket_volume_total, win_rate, trades_count, specialization, rank_today, rank_7d, rank_30d, rank_all_time, last_trade_at, last_synced_at, is_active, is_blocked'
    )
    .eq('id', traderId)
    .maybeSingle()

  if (error) {
    console.error('[trader GET]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura trader', 500)
  }
  if (!data || !data.is_active || data.is_blocked) {
    return ERR('NOT_FOUND', 'Trader non trovato o non attivo', 404)
  }

  return NextResponse.json(data)
}
