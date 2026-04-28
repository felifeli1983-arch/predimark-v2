import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateTradeBody, type SubmitTradeBody } from '@/lib/trades/validation'
import { submitDemoTrade } from '@/lib/trades/submit'
import { submitRealTrade } from '@/lib/trades/submit-real'

export interface TradeSubmitResponse {
  tradeId: string
  positionId: string
  sharesAcquired: number
  newDemoBalance: number | null
  newRealBalance: number | null
  /** Solo REAL: orderID assegnato dal CLOB Polymarket. */
  polymarketOrderId?: string
  status?: string
}

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * POST /api/v1/trades/submit
 *
 * Single-market trade. Dispatcher DEMO vs REAL:
 *   - DEMO (default): submitDemoTrade — paper money su balances.demo_balance
 *   - REAL: submitRealTrade — Polymarket CLOB V2 con signedOrder pre-firmato
 *           dal client via Privy. L2 API creds caricate da DB cifrate.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  let body: SubmitTradeBody
  try {
    body = (await request.json()) as SubmitTradeBody
  } catch {
    return ERR('INVALID_BODY', 'JSON body non valido', 400)
  }

  const validation = validateTradeBody(body)
  if (validation) return ERR(validation.code, validation.message, validation.status)

  const supabase = createAdminClient()

  if (body.isDemo) {
    const result = await submitDemoTrade(supabase, auth.userId, body)
    if ('code' in result) return ERR(result.code, result.message, result.status)
    const response: TradeSubmitResponse = {
      tradeId: result.tradeId,
      positionId: result.positionId,
      sharesAcquired: result.sharesAcquired,
      newDemoBalance: result.newDemoBalance,
      newRealBalance: null,
    }
    return NextResponse.json(response, { status: 201 })
  }

  const result = await submitRealTrade(supabase, auth.userId, body)
  if ('code' in result) return ERR(result.code, result.message, result.status)
  const response: TradeSubmitResponse = {
    tradeId: result.tradeId,
    positionId: result.positionId,
    sharesAcquired: result.sharesAcquired,
    newDemoBalance: null,
    newRealBalance: result.newRealBalance,
    polymarketOrderId: result.polymarketOrderId,
    status: result.status,
  }
  return NextResponse.json(response, { status: 201 })
}
