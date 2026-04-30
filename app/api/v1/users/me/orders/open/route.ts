import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { loadUserApiCreds } from '@/lib/polymarket/auth'
import { getOpenOrders } from '@/lib/polymarket/order-post'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/users/me/orders/open
 *
 * Lista ordini live (resting on book) dell'utente, fetched dal CLOB
 * server-side usando le L2 API creds salvate in DB. Filtri opzionali:
 *   ?market=<conditionId>  → solo ordini di un certo market
 *   ?asset_id=<tokenId>    → solo ordini di un certo outcome token
 *
 * Usato da:
 *  - /me/orders page → lista interattiva con bottoni Cancel
 *  - TradeWidget → calcolo maxOrderSize (balance - reserved)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const url = new URL(request.url)
  const market = url.searchParams.get('market') ?? undefined
  const assetId = url.searchParams.get('asset_id') ?? undefined

  const supabase = createAdminClient()
  const creds = await loadUserApiCreds(supabase, auth.userId)
  if (!creds) {
    return ERR(
      'NOT_ONBOARDED',
      'Utente non collegato a Polymarket — completa onboarding prima',
      400
    )
  }

  try {
    const orders = await getOpenOrders(
      { key: creds.apiKey, secret: creds.secret, passphrase: creds.passphrase },
      { market, assetId }
    )
    return NextResponse.json({
      items: orders,
      meta: {
        total: orders.length,
        reservedSize: orders.reduce((sum, o) => sum + o.remaining * o.price, 0),
      },
    })
  } catch (err) {
    console.error('[orders/open]', err)
    return ERR('CLOB_ERROR', 'Errore lettura ordini da CLOB', 502)
  }
}
