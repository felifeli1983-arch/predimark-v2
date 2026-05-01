import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { loadUserApiCreds } from '@/lib/polymarket/auth'
import {
  getPolymarketNotifications,
  dropPolymarketNotifications,
} from '@/lib/polymarket/order-post'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/users/me/polymarket/notifications
 *
 * Notifiche eventi Polymarket per l'utente loggato (cancellation/fill/
 * market_resolved). Doc L2 Methods → getNotifications. Auto-purge 48h.
 *
 * Used by NotificationBell in header per polling 60s.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const supabase = createAdminClient()
  const creds = await loadUserApiCreds(supabase, auth.userId)
  if (!creds) {
    // Non onboarded → no notifications, ma ritorniamo 200 per non
    // rompere la UI (NotificationBell mostra zero).
    return NextResponse.json({ items: [] })
  }

  const items = await getPolymarketNotifications({
    key: creds.apiKey,
    secret: creds.secret,
    passphrase: creds.passphrase,
  })
  return NextResponse.json({ items })
}

/**
 * DELETE /api/v1/users/me/polymarket/notifications
 * Body: { ids: string[] }
 *
 * Marca notifiche come dismissed (Doc L2 Methods → dropNotifications).
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  let body: { ids?: unknown }
  try {
    body = (await request.json()) as { ids?: unknown }
  } catch {
    return ERR('VALIDATION', 'Body JSON invalido', 400)
  }
  if (!Array.isArray(body.ids) || body.ids.some((x) => typeof x !== 'string')) {
    return ERR('VALIDATION', 'ids deve essere array di string', 400)
  }
  const ids = body.ids as string[]
  if (ids.length === 0) return NextResponse.json({ ok: true })

  const supabase = createAdminClient()
  const creds = await loadUserApiCreds(supabase, auth.userId)
  if (!creds) return ERR('NOT_ONBOARDED', 'Utente non collegato a Polymarket', 400)

  try {
    await dropPolymarketNotifications(
      { key: creds.apiKey, secret: creds.secret, passphrase: creds.passphrase },
      ids
    )
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Errore CLOB'
    console.error('[polymarket notifications]', err)
    return ERR('CLOB_ERROR', `Errore drop: ${msg}`, 502)
  }
}
