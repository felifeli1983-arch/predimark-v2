import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await requireAdmin(request, ['super_admin', 'admin'])
  if ('error' in result) return result.error

  const url = new URL(request.url)
  const status = url.searchParams.get('status') ?? 'pending'

  const supabase = createAdminClient()
  let q = supabase
    .from('creator_payouts')
    .select(
      'id, creator_id, period_start, period_end, total_volume_copied, total_builder_fee, payout_amount, status, paid_at, payment_tx_hash'
    )
    .order('period_end', { ascending: false })
    .limit(200)
  if (status !== 'all') q = q.eq('status', status)

  const { data, error } = await q
  if (error) {
    console.error('[admin payouts]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura payouts', 500)
  }
  return NextResponse.json({ items: data ?? [] })
}
