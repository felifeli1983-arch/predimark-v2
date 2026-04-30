import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const TX_HASH_RE = /^0x[a-fA-F0-9]{64}$/

interface Body {
  txHash?: string
}

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * POST /api/v1/users/me/positions/[id]/redeemed
 *
 * Marca una position come redenta on-chain. Chiamata dal client dopo
 * che `useRedeem` ha confermato il tx receipt. Salva tx_hash + timestamp
 * in DB così la `RedeemSection` non mostra più il bottone Claim per
 * questa posizione (sostituisce il workaround localStorage).
 *
 * Body: `{ txHash: '0x...' }` (66 chars). Il server valida ownership.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const { id: positionId } = await context.params
  if (!positionId) return ERR('VALIDATION', 'positionId mancante', 400)

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return ERR('VALIDATION', 'JSON body non valido', 400)
  }

  const txHash = body.txHash?.trim()
  if (!txHash || !TX_HASH_RE.test(txHash)) {
    return ERR('VALIDATION', 'txHash deve essere 0x + 64 hex chars', 400)
  }

  const supabase = createAdminClient()

  // Verifica ownership prima di update.
  const { data: position, error: fetchErr } = await supabase
    .from('positions')
    .select('id, user_id, is_open, is_demo, redeemed_at')
    .eq('id', positionId)
    .single()

  if (fetchErr || !position) {
    return ERR('NOT_FOUND', 'Position non trovata', 404)
  }
  if (position.user_id !== auth.userId) {
    return ERR('FORBIDDEN', 'Non sei owner di questa position', 403)
  }
  if (position.is_demo) {
    return ERR('VALIDATION', 'Position DEMO non ha redeem on-chain', 400)
  }
  if (position.is_open) {
    return ERR('VALIDATION', 'Position ancora aperta, niente da redimere', 400)
  }
  if (position.redeemed_at) {
    return NextResponse.json({ ok: true, alreadyRedeemed: true })
  }

  const { error: updErr } = await supabase
    .from('positions')
    .update({
      redeemed_at: new Date().toISOString(),
      redeem_tx_hash: txHash,
      updated_at: new Date().toISOString(),
    })
    .eq('id', positionId)
    .eq('user_id', auth.userId)

  if (updErr) {
    console.error('[positions redeemed]', updErr)
    return ERR('INTERNAL_ERROR', 'Errore aggiornamento DB', 500)
  }

  return NextResponse.json({ ok: true })
}
