import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchUserActivity } from '@/lib/polymarket/data-api'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/users/me/onchain-history?limit=50
 *
 * Trade history on-chain dell'utente direttamente da Polymarket Data API
 * (pubblico, no auth Polymarket richiesta — solo l'address utente).
 *
 * Differenza da /trades (DB Auktora): include TUTTI i trade fatti
 * dall'utente sul Polymarket native UI, non solo quelli passati per
 * Auktora. Utile per chi importa account Polymarket esistente.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const url = new URL(request.url)
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') ?? 50)))

  // Ricava wallet address dell'utente da DB users.privy_did (l'address
  // EOA è nei wallet Privy linkati, ma noi salviamo polymarket_funder_address
  // direttamente al momento dell'onboarding Polymarket).
  const supabase = createAdminClient()
  const { data: user, error } = await supabase
    .from('users')
    .select('polymarket_funder_address')
    .eq('id', auth.userId)
    .single()

  if (error || !user?.polymarket_funder_address) {
    return ERR(
      'NO_FUNDER',
      'Wallet Polymarket non collegato — completa l\'onboarding prima',
      400
    )
  }

  try {
    const trades = await fetchUserActivity(user.polymarket_funder_address, limit)
    return NextResponse.json({
      items: trades,
      meta: { count: trades.length, address: user.polymarket_funder_address },
    })
  } catch (err) {
    console.error('[onchain-history]', err)
    return ERR('UPSTREAM_ERROR', 'Errore fetch trades on-chain Polymarket', 502)
  }
}
