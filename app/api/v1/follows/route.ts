import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

interface FollowBody {
  creator_id?: string
  external_id?: string
  notify_via_push?: boolean
  notify_via_telegram?: boolean
}

/**
 * GET /api/v1/follows
 * Lista follow del current user (creators + externals).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('follows')
    .select(
      'id, followed_creator_id, followed_external_id, created_at, notify_new_position, notify_position_closed, notify_via_push, notify_via_telegram'
    )
    .eq('follower_user_id', auth.userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[follows GET]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura follows', 500)
  }

  return NextResponse.json({ items: data ?? [] })
}

/**
 * POST /api/v1/follows
 * Body: { creator_id?: UUID, external_id?: UUID, notify_via_push?, notify_via_telegram? }
 * Toggle: se relazione esiste, la elimina (unfollow). Altrimenti la crea (follow).
 * Esattamente uno tra creator_id e external_id deve essere fornito.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  let body: FollowBody
  try {
    body = (await request.json()) as FollowBody
  } catch {
    return ERR('INVALID_BODY', 'JSON body non valido', 400)
  }

  const hasCreator = Boolean(body.creator_id)
  const hasExternal = Boolean(body.external_id)
  if (hasCreator === hasExternal) {
    return ERR('INVALID_TARGET', 'Fornire esattamente uno tra creator_id o external_id', 400)
  }

  const supabase = createAdminClient()
  const targetField = hasCreator ? 'followed_creator_id' : 'followed_external_id'
  const targetValue = hasCreator ? body.creator_id! : body.external_id!

  // Check esistente
  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_user_id', auth.userId)
    .eq(targetField, targetValue)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from('follows').delete().eq('id', existing.id)
    if (error) {
      console.error('[follows DELETE]', error)
      return ERR('INTERNAL_ERROR', 'Errore unfollow', 500)
    }
    return NextResponse.json({ following: false })
  }

  const { error } = await supabase.from('follows').insert({
    follower_user_id: auth.userId,
    followed_creator_id: hasCreator ? targetValue : null,
    followed_external_id: hasExternal ? targetValue : null,
    notify_via_push: body.notify_via_push ?? true,
    notify_via_telegram: body.notify_via_telegram ?? false,
  })

  if (error) {
    console.error('[follows POST]', error)
    return ERR('INTERNAL_ERROR', 'Errore follow', 500)
  }

  return NextResponse.json({ following: true }, { status: 201 })
}
