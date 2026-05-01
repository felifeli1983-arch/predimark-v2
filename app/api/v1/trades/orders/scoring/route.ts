import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { loadUserApiCreds } from '@/lib/polymarket/auth'
import { areOrdersScoring } from '@/lib/polymarket/order-post'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * POST /api/v1/trades/orders/scoring
 * Body: { orderIds: string[] }
 *
 * Verifica quali ordini sono eligibili per maker rebates.
 * Doc "Cancel Order" → Order Scoring. UI mostra badge per ordine.
 *
 * Usato da OpenOrdersList per visualizzare quali ordini stanno
 * facendo accumulare incentivi liquidity provider.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  let body: { orderIds?: unknown }
  try {
    body = (await request.json()) as { orderIds?: unknown }
  } catch {
    return ERR('VALIDATION', 'Body JSON invalido', 400)
  }
  if (!Array.isArray(body.orderIds) || body.orderIds.some((x) => typeof x !== 'string')) {
    return ERR('VALIDATION', 'orderIds deve essere array di string', 400)
  }
  const orderIds = body.orderIds as string[]
  if (orderIds.length === 0) return NextResponse.json({ scoring: {} })

  const supabase = createAdminClient()
  const creds = await loadUserApiCreds(supabase, auth.userId)
  if (!creds) return ERR('NOT_ONBOARDED', 'Utente non collegato a Polymarket', 400)

  try {
    const scoring = await areOrdersScoring(
      { key: creds.apiKey, secret: creds.secret, passphrase: creds.passphrase },
      orderIds
    )
    return NextResponse.json({ scoring })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Errore CLOB'
    console.error('[orders/scoring]', err)
    return ERR('CLOB_ERROR', `Errore scoring: ${msg}`, 502)
  }
}
