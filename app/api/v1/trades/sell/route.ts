import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { sellSharesDemo, type SellTradeBody } from '@/lib/trades/sell'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * POST /api/v1/trades/sell — vendi (parzialmente o totalmente) una posizione.
 *
 * MA4.5: solo DEMO. Real sell via Polymarket CLOB V2 → MA4.4.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  let body: SellTradeBody
  try {
    body = (await request.json()) as SellTradeBody
  } catch {
    return ERR('INVALID_BODY', 'JSON body non valido', 400)
  }
  if (!body.positionId) {
    return ERR('MISSING_FIELD', 'positionId richiesto', 400)
  }

  const result = await sellSharesDemo(createAdminClient(), auth.userId, body)
  if ('code' in result) return ERR(result.code, result.message, result.status)

  return NextResponse.json(result, { status: 201 })
}
