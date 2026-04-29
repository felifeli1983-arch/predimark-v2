import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/users/me/notifications?unread_only=true&limit=50
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const url = new URL(request.url)
  const unreadOnly = url.searchParams.get('unread_only') === 'true'
  const limitRaw = Number(url.searchParams.get('limit'))
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(Math.floor(limitRaw), 100) : 50

  const supabase = createAdminClient()
  let q = supabase
    .from('notifications')
    .select('id, title, body, type, priority, is_read, read_at, created_at, cta_label, cta_url')
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (unreadOnly) q = q.eq('is_read', false)

  const { data, error } = await q
  if (error) {
    console.error('[notifications GET]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura notifiche', 500)
  }

  return NextResponse.json({ items: data ?? [] })
}

/**
 * PUT /api/v1/users/me/notifications — body { id?: string, mark_all_read?: boolean }
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const body = (await request.json().catch(() => null)) as {
    id?: string
    mark_all_read?: boolean
  } | null

  if (!body) return ERR('INVALID_BODY', 'JSON body non valido', 400)

  const supabase = createAdminClient()
  const update = { is_read: true, read_at: new Date().toISOString() }

  if (body.mark_all_read) {
    const { error } = await supabase
      .from('notifications')
      .update(update)
      .eq('user_id', auth.userId)
      .eq('is_read', false)
    if (error) return ERR('INTERNAL_ERROR', error.message, 500)
  } else if (body.id) {
    const { error } = await supabase
      .from('notifications')
      .update(update)
      .eq('id', body.id)
      .eq('user_id', auth.userId)
    if (error) return ERR('INTERNAL_ERROR', error.message, 500)
  } else {
    return ERR('MISSING_PARAM', 'id o mark_all_read richiesto', 400)
  }

  return NextResponse.json({ ok: true })
}
