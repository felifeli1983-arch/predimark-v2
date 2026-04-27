import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateTradeBody, type SubmitTradeBody } from '@/lib/trades/validation'
import { submitDemoTrade } from '@/lib/trades/submit'

export interface TradeSubmitResponse {
  tradeId: string
  positionId: string
  sharesAcquired: number
  newDemoBalance: number | null
  newRealBalance: number | null
}

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * POST /api/v1/trades/submit
 *
 * Single-market trade. MA4.3: solo DEMO mode (real → MA4.4 CLOB).
 * Logica orchestrata in `lib/trades/submit.ts`.
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

  const result = await submitDemoTrade(createAdminClient(), auth.userId, body)
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
