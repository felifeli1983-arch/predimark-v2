import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { sellSharesDemo, sellSharesReal, type SellTradeBody } from '@/lib/trades/sell'
import { evaluateGeoStatus, extractGeoFromHeaders } from '@/lib/polymarket/geoblock'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * POST /api/v1/trades/sell — vendi (parzialmente o totalmente) una posizione.
 *
 * Dispatcher DEMO/REAL:
 *   DEMO: sellSharesDemo (paper money, no signing)
 *   REAL: sellSharesReal — body.signedOrder pre-firmato dal client per sell
 *         order su CLOB V2 con stesso tokenID e Side.SELL.
 *
 * Per REAL: i paesi close-only (PL, SG, TH, TW) POSSONO chiudere posizioni
 * ma non aprirne — quindi sell è permesso anche in close-only.
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

  const supabase = createAdminClient()

  if (body.isDemo) {
    const result = await sellSharesDemo(supabase, auth.userId, body)
    if ('code' in result) return ERR(result.code, result.message, result.status)
    return NextResponse.json(result, { status: 201 })
  }

  // REAL: geo check, ma close-only countries POSSONO chiudere
  const geo = extractGeoFromHeaders(request.headers)
  const status = evaluateGeoStatus(geo.country, geo.region)
  if (!status.allowed && status.reason === 'blocked') {
    return ERR('GEO_BLOCKED', `Trading non disponibile dalla tua regione (${status.country}).`, 451)
  }
  if (!status.allowed && status.reason === 'region-blocked') {
    return ERR(
      'GEO_BLOCKED',
      `Trading non disponibile dalla tua regione (${status.country}/${status.region}).`,
      451
    )
  }
  // close-only è OK per sell

  const result = await sellSharesReal(supabase, auth.userId, body)
  if ('code' in result) return ERR(result.code, result.message, result.status)
  return NextResponse.json(result, { status: 201 })
}
