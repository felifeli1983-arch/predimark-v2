import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { loadUserApiCreds } from '@/lib/polymarket/auth'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/users/me/clob-credentials
 *
 * Ritorna le L2 API creds dell'utente loggato (decifrate dal DB) per
 * permettere al browser di aprire una connessione WebSocket User Channel
 * direttamente verso Polymarket (Doc WebSocket User Channel).
 *
 * SECURITY:
 *  - Auth richiesta (Privy JWT)
 *  - Ritornate solo le creds dell'utente che fa la request (non altre)
 *  - Le creds restano in memoria browser per la sessione, no localStorage
 *  - Trade-off accettato: pattern dApp standard. Se browser compromesso
 *    (es. extension malevola), creds rubabili — ma sono dell'utente
 *    stesso che le usa, non del builder admin
 *
 * NON usare questo endpoint per builder analytics — quello server-side
 * via /api/v1/admin/builder/trades.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const supabase = createAdminClient()
  const creds = await loadUserApiCreds(supabase, auth.userId)
  if (!creds) {
    return ERR(
      'NOT_ONBOARDED',
      'Utente non ha completato onboarding Polymarket — apri /me/wallet',
      412
    )
  }

  return NextResponse.json({
    apiKey: creds.apiKey,
    secret: creds.secret,
    passphrase: creds.passphrase,
  })
}
