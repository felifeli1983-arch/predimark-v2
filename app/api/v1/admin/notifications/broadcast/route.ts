import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

interface BroadcastBody {
  title?: string
  body?: string
  audience?: 'all' | 'active_7d' | 'verified_creators'
  type?: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const result = await requireAdmin(request, ['super_admin', 'admin'])
  if ('error' in result) return result.error

  let bodyData: BroadcastBody
  try {
    bodyData = (await request.json()) as BroadcastBody
  } catch {
    return ERR('INVALID_BODY', 'JSON invalid', 400)
  }

  if (!bodyData.title || !bodyData.body) {
    return ERR('MISSING_FIELDS', 'title + body richiesti', 400)
  }

  const supabase = createAdminClient()

  let userIds: string[] = []
  if (bodyData.audience === 'verified_creators') {
    const { data } = await supabase
      .from('creators')
      .select('user_id')
      .eq('is_verified', true)
      .eq('is_suspended', false)
    userIds = (data ?? []).map((c) => c.user_id).filter(Boolean) as string[]
  } else if (bodyData.audience === 'active_7d') {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
    const { data } = await supabase
      .from('users')
      .select('id')
      .gte('last_login_at', sevenDaysAgo)
      .limit(10000)
    userIds = (data ?? []).map((u) => u.id).filter(Boolean) as string[]
  } else {
    const { data } = await supabase.from('users').select('id').limit(50000)
    userIds = (data ?? []).map((u) => u.id).filter(Boolean) as string[]
  }

  if (userIds.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'No users in audience' })
  }

  const notifications = userIds.map((uid) => ({
    user_id: uid,
    title: bodyData.title!,
    body: bodyData.body!,
    type: bodyData.type ?? 'announcement',
    priority: 'normal',
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('notifications') as any).insert(notifications)
  if (error) {
    console.error('[admin broadcast]', error)
    return ERR('INTERNAL_ERROR', 'Errore insert notifications', 500)
  }

  return NextResponse.json({ ok: true, sent: userIds.length })
}
