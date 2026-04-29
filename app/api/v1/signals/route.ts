import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/signals?status=active&min_edge=5&limit=50
 * Pubblico — no auth.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)
  const status = url.searchParams.get('status') ?? 'active'
  const minEdge = Number(url.searchParams.get('min_edge')) || 0
  const limitRaw = Number(url.searchParams.get('limit'))
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(Math.floor(limitRaw), 100) : 50

  const supabase = createAdminClient()
  let q = supabase
    .from('signals')
    .select(
      'id, market_id, algorithm_name, direction, edge_pct, confidence_pct, predicted_probability, current_market_price, valid_from, valid_until, status, was_correct, realized_edge_pct, created_at'
    )
    .order('edge_pct', { ascending: false })
    .limit(limit)

  if (status === 'active') {
    const now = new Date().toISOString()
    q = q.eq('status', 'active').gt('valid_until', now)
  } else if (status === 'resolved') {
    q = q.eq('status', 'resolved')
  }
  if (minEdge > 0) q = q.gte('edge_pct', minEdge)

  const { data, error } = await q
  if (error) {
    console.error('[signals GET]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura signals', 500)
  }

  return NextResponse.json({ items: data ?? [] })
}
