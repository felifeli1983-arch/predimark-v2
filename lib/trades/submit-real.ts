import type { SupabaseClient } from '@supabase/supabase-js'
import type { SignedOrder } from '@polymarket/clob-client-v2'
import type { Database } from '@/lib/supabase/database.types'
import { resolveOrUpsertMarket } from '@/lib/markets/upsert'
import { loadUserApiCreds } from '@/lib/polymarket/auth'
import { postSignedOrder } from '@/lib/polymarket/order-post'
import type { SubmitTradeBody } from './validation'
import { getOrInitRealBalance, applyRealBalanceDelta } from './balance'
import { upsertOpenPosition } from './position'
import { insertOpenTrade } from './insert'

export interface SubmitRealTradeResult {
  tradeId: string
  positionId: string
  sharesAcquired: number
  newRealBalance: number
  polymarketOrderId: string
  status: string
}

export interface SubmitRealTradeError {
  code:
    | 'NOT_ONBOARDED'
    | 'MARKET_UPSERT_FAILED'
    | 'BALANCE_INIT_FAILED'
    | 'CLOB_POST_FAILED'
    | 'POSITION_FAILED'
    | 'TRADE_INSERT_FAILED'
    | 'BALANCE_UPDATE_FAILED'
  message: string
  status: number
}

/**
 * Orchestratore trade REAL via Polymarket CLOB V2:
 *   1. Carica creds L2 dell'utente (deve essere onboardato)
 *   2. Upsert market + balance check
 *   3. Post signed order al CLOB → orderID
 *   4. Insert trade row + position upsert + cached balance update
 *
 * Sequenziale, non atomic. Se postSignedOrder fallisce → niente DB write.
 * Se DB write fallisce dopo ordine fillato → orderID accumulato in log per
 * recovery manuale (rare, ricalcolato dal CLOB orders endpoint).
 */
export async function submitRealTrade(
  supabase: SupabaseClient<Database>,
  userId: string,
  body: SubmitTradeBody
): Promise<SubmitRealTradeResult | SubmitRealTradeError> {
  if (!body.tokenId || !body.signedOrder) {
    return { code: 'CLOB_POST_FAILED', message: 'tokenId/signedOrder mancanti', status: 400 }
  }

  const creds = await loadUserApiCreds(supabase, userId)
  if (!creds) {
    return {
      code: 'NOT_ONBOARDED',
      message: 'Utente non ha completato onboarding Polymarket',
      status: 412,
    }
  }

  const marketResult = await resolveOrUpsertMarket(supabase, {
    ...body,
    clobTokenIds: body.clobTokenIds,
  })
  if ('error' in marketResult) {
    console.error('[trade/submit-real] markets', marketResult.error)
    return { code: 'MARKET_UPSERT_FAILED', message: 'Errore sync mercato', status: 500 }
  }

  const balanceResult = await getOrInitRealBalance(supabase, userId)
  if ('error' in balanceResult) {
    console.error('[trade/submit-real] balance init', balanceResult.error)
    return { code: 'BALANCE_INIT_FAILED', message: 'Errore lettura balance real', status: 500 }
  }

  let postRes
  try {
    postRes = await postSignedOrder(body.signedOrder as unknown as SignedOrder, {
      key: creds.apiKey,
      secret: creds.secret,
      passphrase: creds.passphrase,
    })
  } catch (err) {
    console.error('[trade/submit-real] CLOB post', err)
    return {
      code: 'CLOB_POST_FAILED',
      message: err instanceof Error ? err.message : 'CLOB submit failed',
      status: 502,
    }
  }

  const shares = body.amountUsdc / body.pricePerShare

  const posResult = await upsertOpenPosition(supabase, {
    userId,
    marketId: marketResult.id,
    side: body.side,
    shares,
    pricePerShare: body.pricePerShare,
    amountUsdc: body.amountUsdc,
    isDemo: false,
  })
  if ('error' in posResult) {
    console.error('[trade/submit-real] position', posResult.error)
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
    isDemo: false,
    polymarketOrderId: postRes.orderID,
  })
  if ('error' in tradeResult) {
    console.error('[trade/submit-real] trade insert', tradeResult.error)
    return { code: 'TRADE_INSERT_FAILED', message: 'Errore registrazione trade', status: 500 }
  }

  const newUsdcBalance = Math.max(0, balanceResult.usdcBalance - body.amountUsdc)
  const newRealVolumeTotal = balanceResult.realVolumeTotal + body.amountUsdc
  const balErr = await applyRealBalanceDelta(supabase, userId, newUsdcBalance, newRealVolumeTotal)
  if (balErr) {
    console.error('[trade/submit-real] balance update', balErr)
    // Trade già registrato a CLOB + DB, balance cached desincronizzato.
    // Il prossimo BalanceHydrator refresh ricalcolerà da on-chain pUSD.
  }

  return {
    tradeId: tradeResult.tradeId,
    positionId: posResult.positionId,
    sharesAcquired: shares,
    newRealBalance: newUsdcBalance,
    polymarketOrderId: postRes.orderID,
    status: postRes.status,
  }
}
