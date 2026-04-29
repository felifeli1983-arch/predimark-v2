import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/admin/audit-log?actor=&action=&from=&to=&limit=100
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await requireAdmin(request, ['super_admin', 'admin', 'moderator', 'viewer'])
  if ('error' in result) return result.error

  const url = new URL(request.url)
  const limitRaw = Number(url.searchParams.get('limit'))
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(Math.floor(limitRaw), 500) : 100

  const supabase = createAdminClient()

  // Query parent partitioned table — Postgres routes to correct partition
  let q = supabase
    .from('audit_log')
    .select(
      'id, created_at, actor_user_id, action_type, target_type, target_id, before_value, after_value, reason_note'
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  const actor = url.searchParams.get('actor')
  const action = url.searchParams.get('action')
  if (actor) q = q.eq('actor_user_id', actor)
  if (action) q = q.eq('action_type', action)

  const { data, error } = await q
  if (error) {
    console.error('[admin audit-log]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura audit log', 500)
  }

  return NextResponse.json({ items: data ?? [] })
}
