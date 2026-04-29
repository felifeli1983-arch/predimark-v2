import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

interface UpdateBody {
  copy_active?: boolean
  bankroll_pct?: number
  slippage_cap_bps?: number
  max_per_trade_usdc?: number
  notify_via_push?: boolean
  notify_via_telegram?: boolean
}

/**
 * PUT /api/v1/follows/[followId] — update copy trading config per follow specifico
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ followId: string }> }
): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const { followId } = await context.params

  let body: UpdateBody
  try {
    body = (await request.json()) as UpdateBody
  } catch {
    return ERR('INVALID_BODY', 'JSON body non valido', 400)
  }

  if (body.bankroll_pct !== undefined) {
    if (body.bankroll_pct < 1 || body.bankroll_pct > 100) {
      return ERR('INVALID_VALUE', 'bankroll_pct deve essere 1-100', 400)
    }
  }
  if (body.slippage_cap_bps !== undefined) {
    if (body.slippage_cap_bps < 50 || body.slippage_cap_bps > 1000) {
      return ERR('INVALID_VALUE', 'slippage_cap_bps deve essere 50-1000 (0.5%-10%)', 400)
    }
  }

  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('follows') as any)
    .update(body)
    .eq('id', followId)
    .eq('follower_user_id', auth.userId)

  if (error) {
    console.error('[follows PUT]', error)
    return ERR('INTERNAL_ERROR', 'Errore update follow', 500)
  }

  return NextResponse.json({ ok: true })
}

/**
 * DELETE /api/v1/follows/[followId]
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ followId: string }> }
): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const { followId } = await context.params
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('id', followId)
    .eq('follower_user_id', auth.userId)

  if (error) return ERR('INTERNAL_ERROR', error.message, 500)
  return NextResponse.json({ ok: true })
}
