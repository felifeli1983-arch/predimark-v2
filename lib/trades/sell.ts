import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { findPositionForUser } from '@/lib/positions/queries'
import { applyPartialSellToPosition } from '@/lib/positions/close'
import { computeSellPnL } from './pnl'

export interface SellTradeBody {
  positionId: string
  sharesToSell: number
  currentPrice: number
  isDemo: boolean
}

export interface SellTradeResult {
  tradeId: string
  newDemoBalance: number
  pnl: number
  isWin: boolean
}

export type SellTradeError = {
  code:
    | 'POSITION_NOT_FOUND'
    | 'POSITION_CLOSED'
    | 'INVALID_SHARES'
    | 'INVALID_PRICE'
    | 'REAL_NOT_SUPPORTED'
    | 'TRADE_INSERT_FAILED'
    | 'POSITION_UPDATE_FAILED'
    | 'BALANCE_UPDATE_FAILED'
  message: string
  status: number
}

/**
 * Sell DEMO orchestrator.
 * Sequenziale: validate → insert trade close → close/partial position →
 * update balance (demo_balance + total_pnl + volume_total).
 *
 * Real sell (Polymarket CLOB V2) arriverà in MA4.4.
 */
export async function sellSharesDemo(
  supabase: SupabaseClient<Database>,
  userId: string,
  body: SellTradeBody
): Promise<SellTradeResult | SellTradeError> {
  if (!body.isDemo) {
    return { code: 'REAL_NOT_SUPPORTED', message: 'Sell real arriverà in MA4.4', status: 501 }
  }
  if (
    !Number.isFinite(body.sharesToSell) ||
    body.sharesToSell <= 0 ||
    !Number.isFinite(body.currentPrice) ||
    body.currentPrice <= 0 ||
    body.currentPrice >= 1
  ) {
    return {
      code: 'INVALID_PRICE',
      message: 'sharesToSell e currentPrice devono essere validi',
      status: 400,
    }
  }

  const position = await findPositionForUser(supabase, userId, body.positionId)
  if (!position) {
    return { code: 'POSITION_NOT_FOUND', message: 'Posizione non trovata', status: 404 }
  }
  if (!position.isOpen) {
    return { code: 'POSITION_CLOSED', message: 'Posizione già chiusa', status: 409 }
  }
  if (!position.isDemo) {
    return { code: 'REAL_NOT_SUPPORTED', message: 'Sell real arriverà in MA4.4', status: 501 }
  }
  if (body.sharesToSell > position.shares) {
    return {
      code: 'INVALID_SHARES',
      message: `sharesToSell (${body.sharesToSell}) > shares possedute (${position.shares})`,
      status: 400,
    }
  }

  const pnlResult = computeSellPnL(position.avgPrice, body.currentPrice, body.sharesToSell)

  // 1. Insert close trade row
  const { data: trade, error: tradeErr } = await supabase
    .from('trades')
    .insert({
      user_id: userId,
      market_id: position.marketId,
      position_id: position.id,
      trade_type: 'close',
      side: position.side,
      shares: body.sharesToSell,
      price: body.currentPrice,
      total_amount: pnlResult.totalReceived,
      pnl: pnlResult.pnl,
      pnl_pct: pnlResult.pnlPct,
      is_win: pnlResult.isWin,
      source: 'manual',
      is_demo: true,
    })
    .select('id')
    .single()
  if (tradeErr || !trade) {
    console.error('[sell] trade insert', tradeErr)
    return { code: 'TRADE_INSERT_FAILED', message: 'Errore registrazione trade', status: 500 }
  }

  // 2. Update position (full close se shares=0, altrimenti partial)
  const remaining = position.shares - body.sharesToSell
  const closeResult = await applyPartialSellToPosition(supabase, {
    positionId: position.id,
    remainingShares: remaining,
    currentPrice: body.currentPrice,
  })
  if ('error' in closeResult) {
    console.error('[sell] position update', closeResult.error)
    return { code: 'POSITION_UPDATE_FAILED', message: 'Errore chiusura posizione', status: 500 }
  }

  // 3. Update balance: demo_balance + demo_total_pnl + demo_volume_total
  const { data: bal } = await supabase
    .from('balances')
    .select('demo_balance, demo_total_pnl, demo_volume_total')
    .eq('user_id', userId)
    .maybeSingle()
  const currentBalance = Number(bal?.demo_balance ?? 10000)
  const currentTotalPnl = Number(bal?.demo_total_pnl ?? 0)
  const currentVolume = Number(bal?.demo_volume_total ?? 0)

  const newDemoBalance = currentBalance + pnlResult.totalReceived
  const newTotalPnl = currentTotalPnl + pnlResult.pnl
  const newVolume = currentVolume + pnlResult.totalReceived

  const { error: balErr } = await supabase
    .from('balances')
    .update({
      demo_balance: newDemoBalance,
      demo_total_pnl: newTotalPnl,
      demo_volume_total: newVolume,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
  if (balErr) {
    console.error('[sell] balance update', balErr)
    return {
      code: 'BALANCE_UPDATE_FAILED',
      message: 'Trade chiuso ma saldo non aggiornato — riprova',
      status: 500,
    }
  }

  return {
    tradeId: trade.id,
    newDemoBalance,
    pnl: pnlResult.pnl,
    isWin: pnlResult.isWin,
  }
}
