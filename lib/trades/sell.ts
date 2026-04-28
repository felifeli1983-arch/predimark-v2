import type { SupabaseClient } from '@supabase/supabase-js'
import type { SignedOrder } from '@polymarket/clob-client-v2'
import type { Database } from '@/lib/supabase/database.types'
import { findPositionForUser } from '@/lib/positions/queries'
import { applyPartialSellToPosition } from '@/lib/positions/close'
import { loadUserApiCreds } from '@/lib/polymarket/auth'
import { postSignedOrder } from '@/lib/polymarket/order-post'
import { computeSellPnL } from './pnl'

export interface SellTradeBody {
  positionId: string
  sharesToSell: number
  currentPrice: number
  isDemo: boolean
  /** REAL: signed sell order pre-firmato dal client. */
  signedOrder?: Record<string, unknown>
  /** REAL: token id usato nel sell order (ridondante ma comodo per validation). */
  tokenId?: string
}

export interface SellTradeResult {
  tradeId: string
  newDemoBalance: number
  pnl: number
  isWin: boolean
}

export interface SellRealTradeResult {
  tradeId: string
  newRealBalance: number
  pnl: number
  isWin: boolean
  polymarketOrderId: string
  status: string
}

export type SellTradeError = {
  code:
    | 'POSITION_NOT_FOUND'
    | 'POSITION_CLOSED'
    | 'INVALID_SHARES'
    | 'INVALID_PRICE'
    | 'NOT_ONBOARDED'
    | 'REAL_FIELDS_MISSING'
    | 'CLOB_POST_FAILED'
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
  const validation = validateSellBody(body)
  if (validation) return validation

  const position = await findPositionForUser(supabase, userId, body.positionId)
  if (!position) {
    return { code: 'POSITION_NOT_FOUND', message: 'Posizione non trovata', status: 404 }
  }
  if (!position.isOpen) {
    return { code: 'POSITION_CLOSED', message: 'Posizione già chiusa', status: 409 }
  }
  if (!position.isDemo) {
    return {
      code: 'INVALID_SHARES',
      message: "Posizione REAL: usa l'endpoint REAL invece di sellSharesDemo",
      status: 400,
    }
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

/** Validazione comune body sell (DEMO + REAL). */
function validateSellBody(body: SellTradeBody): SellTradeError | null {
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
  return null
}

/**
 * Sell REAL via Polymarket CLOB V2.
 *
 * Flow:
 *   1. Validate body + posizione (open, REAL, shares sufficienti)
 *   2. Carica L2 creds dell'user (deve essere onboardato)
 *   3. Post signed sell order al CLOB → orderID
 *   4. Insert close trade row + update position (partial/full close)
 *   5. Update cached usdc_balance + real_total_pnl + real_volume_total
 *
 * Sequenziale, non atomic. Se postSignedOrder fallisce → niente DB write.
 */
export async function sellSharesReal(
  supabase: SupabaseClient<Database>,
  userId: string,
  body: SellTradeBody
): Promise<SellRealTradeResult | SellTradeError> {
  const validation = validateSellBody(body)
  if (validation) return validation
  if (!body.signedOrder || !body.tokenId) {
    return {
      code: 'REAL_FIELDS_MISSING',
      message: 'signedOrder + tokenId richiesti per sell REAL',
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
  if (position.isDemo) {
    return {
      code: 'INVALID_SHARES',
      message: 'Posizione DEMO: usa sellSharesDemo',
      status: 400,
    }
  }
  if (body.sharesToSell > position.shares) {
    return {
      code: 'INVALID_SHARES',
      message: `sharesToSell (${body.sharesToSell}) > shares possedute (${position.shares})`,
      status: 400,
    }
  }

  const creds = await loadUserApiCreds(supabase, userId)
  if (!creds) {
    return {
      code: 'NOT_ONBOARDED',
      message: 'Utente non ha completato onboarding Polymarket',
      status: 412,
    }
  }

  let postRes
  try {
    postRes = await postSignedOrder(body.signedOrder as unknown as SignedOrder, {
      key: creds.apiKey,
      secret: creds.secret,
      passphrase: creds.passphrase,
    })
  } catch (err) {
    console.error('[sell-real] CLOB post', err)
    return {
      code: 'CLOB_POST_FAILED',
      message: err instanceof Error ? err.message : 'CLOB sell submit failed',
      status: 502,
    }
  }

  const pnlResult = computeSellPnL(position.avgPrice, body.currentPrice, body.sharesToSell)

  // Insert close trade
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
      is_demo: false,
      polymarket_order_id: postRes.orderID,
    })
    .select('id')
    .single()
  if (tradeErr || !trade) {
    console.error('[sell-real] trade insert', tradeErr)
    return { code: 'TRADE_INSERT_FAILED', message: 'Errore registrazione trade', status: 500 }
  }

  const remaining = position.shares - body.sharesToSell
  const closeResult = await applyPartialSellToPosition(supabase, {
    positionId: position.id,
    remainingShares: remaining,
    currentPrice: body.currentPrice,
  })
  if ('error' in closeResult) {
    console.error('[sell-real] position update', closeResult.error)
    return { code: 'POSITION_UPDATE_FAILED', message: 'Errore chiusura posizione', status: 500 }
  }

  // Update cached real balance: usdc_balance += proceeds, real_total_pnl += pnl
  const { data: bal } = await supabase
    .from('balances')
    .select('usdc_balance, real_total_pnl, real_volume_total')
    .eq('user_id', userId)
    .maybeSingle()
  const currentBalance = Number(bal?.usdc_balance ?? 0)
  const currentTotalPnl = Number(bal?.real_total_pnl ?? 0)
  const currentVolume = Number(bal?.real_volume_total ?? 0)

  const newRealBalance = currentBalance + pnlResult.totalReceived
  const newTotalPnl = currentTotalPnl + pnlResult.pnl
  const newVolume = currentVolume + pnlResult.totalReceived

  const { error: balErr } = await supabase
    .from('balances')
    .update({
      usdc_balance: newRealBalance,
      real_total_pnl: newTotalPnl,
      real_volume_total: newVolume,
      usdc_last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
  if (balErr) {
    console.error('[sell-real] balance update', balErr)
    // Cached balance desincronizzato — il prossimo BalanceHydrator
    // refresh ricalcolerà da on-chain pUSD.
  }

  return {
    tradeId: trade.id,
    newRealBalance,
    pnl: pnlResult.pnl,
    isWin: pnlResult.isWin,
    polymarketOrderId: postRes.orderID,
    status: postRes.status,
  }
}
