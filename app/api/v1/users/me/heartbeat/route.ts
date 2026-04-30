import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { loadUserApiCreds } from '@/lib/polymarket/auth'
import { postHeartbeat } from '@/lib/polymarket/order-post'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * POST /api/v1/users/me/heartbeat
 *
 * Doc Polymarket Orders Overview: "If a valid heartbeat is not received
 * within 10 seconds, all of your open orders will be cancelled."
 *
 * Body: `{ heartbeatId?: string }` — null/undefined per la prima call.
 * Response: `{ heartbeatId: string }` — da passare al next ping.
 *
 * Auth: user JWT + L2 API creds dal DB. Il client deve pingare ogni
 * 5s mentre ha open orders attivi (limit GTC/GTD).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const supabase = createAdminClient()
  const creds = await loadUserApiCreds(supabase, auth.userId)
  if (!creds) {
    return ERR('NOT_ONBOARDED', 'Utente non collegato a Polymarket', 400)
  }

  let body: { heartbeatId?: string } = {}
  try {
    body = (await request.json()) as { heartbeatId?: string }
  } catch {
    /* prima call senza body è valida */
  }

  try {
    const result = await postHeartbeat(
      { key: creds.apiKey, secret: creds.secret, passphrase: creds.passphrase },
      body.heartbeatId
    )
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Errore CLOB'
    // CLOB ritorna 400 se heartbeatId invalido — passiamo gracefully
    // così client può retry con il nuovo id.
    return ERR('HEARTBEAT_INVALID', msg, 400)
  }
}
