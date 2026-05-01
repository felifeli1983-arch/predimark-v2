import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { loadUserApiCreds } from '@/lib/polymarket/auth'
import { cancelAllOrders } from '@/lib/polymarket/order-post'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * DELETE /api/v1/trades/orders/all
 *
 * Cancella TUTTI gli open orders dell'utente (across markets). Doc
 * "Cancel Order" → cancelAll(). Idempotente, no-op se l'utente non
 * ha ordini live.
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const supabase = createAdminClient()
  const creds = await loadUserApiCreds(supabase, auth.userId)
  if (!creds) return ERR('NOT_ONBOARDED', 'Utente non collegato a Polymarket', 400)

  try {
    await cancelAllOrders({
      key: creds.apiKey,
      secret: creds.secret,
      passphrase: creds.passphrase,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Errore CLOB'
    console.error('[orders/cancel-all]', err)
    return ERR('CLOB_ERROR', `Errore cancellazione: ${msg}`, 502)
  }
}
