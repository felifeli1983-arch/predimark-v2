import { NextRequest, NextResponse } from 'next/server'
import { verifyPrivyToken } from '@/lib/privy/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Risolve l'utente autenticato a partire dall'header Authorization Bearer
 * (Privy JWT) e mappa al record `users.id` interno via `privy_did`.
 *
 * Ritorna `{ userId, privyDid }` se autenticato, altrimenti `{ error }` con
 * NextResponse pronta da restituire (401/403/500).
 *
 * Pattern usato: endpoint API la chiamano come prima azione e early-return
 * sull'error.
 */
export async function requireUserId(
  request: NextRequest
): Promise<{ userId: string; privyDid: string } | { error: NextResponse }> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      error: NextResponse.json(
        { error: { code: 'AUTH_MISSING', message: 'Authorization header mancante' } },
        { status: 401 }
      ),
    }
  }
  const token = authHeader.slice(7)

  let privyDid: string
  try {
    const verified = await verifyPrivyToken(token)
    privyDid = verified.privyDid
  } catch {
    return {
      error: NextResponse.json(
        { error: { code: 'AUTH_INVALID', message: 'JWT Privy non valido o scaduto' } },
        { status: 401 }
      ),
    }
  }

  const supabase = createAdminClient()

  // Self-healing: upsert minimo se user non esiste ancora (race condition con
  // syncUserToSupabase background, o primo login non ancora propagato).
  // Sempre ritorna l'id, niente più 403 USER_NOT_FOUND su prima interazione.
  const { data: user, error: upsertError } = await supabase
    .from('users')
    .upsert(
      { privy_did: privyDid, last_login_at: new Date().toISOString() },
      { onConflict: 'privy_did' }
    )
    .select('id')
    .single()

  if (upsertError || !user) {
    console.error('[requireUserId] upsert user fallito', upsertError)
    return {
      error: NextResponse.json(
        {
          error: {
            code: 'USER_UPSERT_FAILED',
            message: 'Errore sync utente — riprova',
          },
        },
        { status: 500 }
      ),
    }
  }

  return { userId: user.id, privyDid }
}
