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
  const { data: user, error: lookupError } = await supabase
    .from('users')
    .select('id')
    .eq('privy_did', privyDid)
    .single()

  if (lookupError || !user) {
    return {
      error: NextResponse.json(
        {
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Utente non registrato. Chiama POST /api/v1/auth/session prima.',
          },
        },
        { status: 403 }
      ),
    }
  }

  return { userId: user.id, privyDid }
}
