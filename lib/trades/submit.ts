import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { resolveOrUpsertMarket } from '@/lib/markets/upsert'
import type { SubmitTradeBody } from './validation'
import { getOrInitDemoBalance, applyDemoBalanceDelta } from './balance'
import { upsertOpenPosition } from './position'
import { insertOpenTrade } from './insert'

export interface SubmitTradeResult {
  tradeId: string
  positionId: string
  sharesAcquired: number
  newDemoBalance: number
}

export interface SubmitTradeError {
  code:
    | 'MARKET_UPSERT_FAILED'
    | 'BALANCE_INIT_FAILED'
    | 'INSUFFICIENT_BALANCE'
    | 'POSITION_FAILED'
    | 'TRADE_INSERT_FAILED'
    | 'BALANCE_UPDATE_FAILED'
  message: string
  status: number
}

/**
 * Orchestratore trade DEMO: markets upsert → balance check → position upsert
 * → trade insert → balance update.
 *
 * Sequenziale, non atomic. Su balance update fail il trade resta inserito
 * (recovery via ricalcolo da somma trades al prossimo refresh balance).
 */
export async function submitDemoTrade(
  supabase: SupabaseClient<Database>,
  userId: string,
  body: SubmitTradeBody
): Promise<SubmitTradeResult | SubmitTradeError> {
  const marketResult = await resolveOrUpsertMarket(supabase, {
    ...body,
    clobTokenIds: body.clobTokenIds,
  })
  if ('error' in marketResult) {
    console.error('[trade/submit] markets', marketResult.error)
    return { code: 'MARKET_UPSERT_FAILED', message: 'Errore sync mercato', status: 500 }
  }

  const balanceResult = await getOrInitDemoBalance(supabase, userId)
  if ('error' in balanceResult) {
    console.error('[trade/submit] balance init', balanceResult.error)
    return { code: 'BALANCE_INIT_FAILED', message: 'Errore inizializzazione saldo', status: 500 }
  }
  if (balanceResult.demoBalance < body.amountUsdc) {
    return { code: 'INSUFFICIENT_BALANCE', message: 'Saldo demo insufficiente', status: 403 }
  }

  const shares = body.amountUsdc / body.pricePerShare

  const posResult = await upsertOpenPosition(supabase, {
    userId,
    marketId: marketResult.id,
    side: body.side,
    shares,
    pricePerShare: body.pricePerShare,
    amountUsdc: body.amountUsdc,
    isDemo: true,
  })
  if ('error' in posResult) {
    console.error('[trade/submit] position', posResult.error)
    return { code: 'POSITION_FAILED', message: 'Errore aggiornamento posizione', status: 500 }
  }

  const tradeResult = await insertOpenTrade(supabase, {
    userId,
    marketId: marketResult.id,
    positionId: posResult.positionId,
    side: body.side,
    shares,
    pricePerShare: body.pricePerShare,
    amountUsdc: body.amountUsdc,
    isDemo: true,
  })
  if ('error' in tradeResult) {
    console.error('[trade/submit] trade', tradeResult.error)
    return { code: 'TRADE_INSERT_FAILED', message: 'Errore registrazione trade', status: 500 }
  }

  const newDemoBalance = balanceResult.demoBalance - body.amountUsdc
  const newDemoVolumeTotal = balanceResult.demoVolumeTotal + body.amountUsdc
  const balErr = await applyDemoBalanceDelta(supabase, userId, newDemoBalance, newDemoVolumeTotal)
  if (balErr) {
    console.error('[trade/submit] balance update', balErr)
    return {
      code: 'BALANCE_UPDATE_FAILED',
      message: 'Trade registrato ma saldo non aggiornato — riprova',
      status: 500,
    }
  }

  return {
    tradeId: tradeResult.tradeId,
    positionId: posResult.positionId,
    sharesAcquired: shares,
    newDemoBalance,
  }
}
