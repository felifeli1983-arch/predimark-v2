import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { loadUserApiCreds } from '@/lib/polymarket/auth'
import { getOrderTrades } from '@/lib/polymarket/order-post'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/trades?market=&assetId=&before=&after=&cursor=
 *
 * Trade history Polymarket-side dell'utente, paginato cursor-based.
 * Doc "Cancel Order" → Trade History. Trade transitano per status
 * MATCHED → MINED → CONFIRMED (terminale) | RETRYING → FAILED.
 *
 * Differenza vs `/users/me/onchain-history`: quello ritorna trade
 * on-chain via data-api (proxy address), questo via CLOB con maker
 * rebate info + scoring. Complementari.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const url = new URL(request.url)
  const market = url.searchParams.get('market') ?? undefined
  const assetId = url.searchParams.get('assetId') ?? undefined
  const before = url.searchParams.get('before') ?? undefined
  const after = url.searchParams.get('after') ?? undefined
  const cursor = url.searchParams.get('cursor') ?? undefined

  const supabase = createAdminClient()
  const creds = await loadUserApiCreds(supabase, auth.userId)
  if (!creds) return ERR('NOT_ONBOARDED', 'Utente non collegato a Polymarket', 400)

  try {
    const res = await getOrderTrades(
      { key: creds.apiKey, secret: creds.secret, passphrase: creds.passphrase },
      { market, assetId, before, after, cursor }
    )
    return NextResponse.json({
      items: res.trades,
      meta: { nextCursor: res.nextCursor, count: res.trades.length },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Errore CLOB'
    console.error('[trades]', err)
    return ERR('CLOB_ERROR', `Errore fetch trade: ${msg}`, 502)
  }
}
