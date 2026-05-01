import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { loadUserApiCreds } from '@/lib/polymarket/auth'
import { cancelMarketOrders } from '@/lib/polymarket/order-post'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * DELETE /api/v1/trades/orders/market?market=0x...&assetId=...
 *
 * Cancella tutti gli ordini per un specifico market (conditionId).
 * Optional `assetId` per filtrare a un singolo token (YES o NO).
 *
 * Doc "Cancel Order" → cancelMarketOrders. Use case: utente apre
 * event page e clicca "Annulla ordini su questo evento".
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const url = new URL(request.url)
  const market = url.searchParams.get('market') ?? undefined
  const assetId = url.searchParams.get('assetId') ?? undefined

  if (!market && !assetId) {
    return ERR('VALIDATION', 'market o assetId richiesto', 400)
  }

  const supabase = createAdminClient()
  const creds = await loadUserApiCreds(supabase, auth.userId)
  if (!creds) return ERR('NOT_ONBOARDED', 'Utente non collegato a Polymarket', 400)

  try {
    const res = await cancelMarketOrders(
      { key: creds.apiKey, secret: creds.secret, passphrase: creds.passphrase },
      { market, assetId }
    )
    return NextResponse.json({
      ok: true,
      canceled: res.canceled,
      notCanceled: res.notCanceled,
      counts: {
        canceled: res.canceled.length,
        notCanceled: Object.keys(res.notCanceled).length,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Errore CLOB'
    console.error('[orders/cancel-market]', err)
    return ERR('CLOB_ERROR', `Errore cancellazione: ${msg}`, 502)
  }
}
