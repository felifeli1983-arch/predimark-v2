import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { loadUserApiCreds } from '@/lib/polymarket/auth'
import { cancelOrder } from '@/lib/polymarket/order-post'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * DELETE /api/v1/trades/orders/[orderId]
 *
 * Cancella un ordine live (rest on book). Idempotente — se l'ordine è
 * già matched o cancelled, il CLOB ritorna error che propaghiamo come
 * 409 Conflict; altrimenti 200 con success.
 *
 * Auth: user JWT + L2 API creds salvate in DB. Il CLOB verifica che
 * il maker_address dell'ordine sia owner delle creds → no privilege
 * escalation cross-user possibile.
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const { orderId } = await context.params
  if (!orderId || typeof orderId !== 'string') {
    return ERR('VALIDATION', 'orderId mancante', 400)
  }

  const supabase = createAdminClient()
  const creds = await loadUserApiCreds(supabase, auth.userId)
  if (!creds) {
    return ERR('NOT_ONBOARDED', 'Utente non collegato a Polymarket', 400)
  }

  try {
    await cancelOrder(orderId, {
      key: creds.apiKey,
      secret: creds.secret,
      passphrase: creds.passphrase,
    })
    return NextResponse.json({ ok: true, orderId })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Errore CLOB'
    // CLOB ritorna 4xx per "already matched"/"not found"
    if (msg.includes('not found') || msg.includes('already')) {
      return ERR('ORDER_NOT_CANCELLABLE', msg, 409)
    }
    console.error('[orders/cancel]', err)
    return ERR('CLOB_ERROR', `Errore cancellazione ordine: ${msg}`, 502)
  }
}
