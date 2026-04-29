import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

interface UpdateBody {
  notify_email?: boolean
  notify_push?: boolean
  notify_telegram?: boolean
  default_period_filter?: string
  default_sort_leaderboard?: string
  default_chart_timeframe?: string
  show_demo_banner?: boolean
  profile_visible?: boolean
}

/**
 * GET /api/v1/users/me/preferences
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', auth.userId)
    .maybeSingle()

  if (error) {
    console.error('[preferences GET]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura preferences', 500)
  }

  // Return defaults if no record yet
  if (!data) {
    return NextResponse.json({
      notify_email: true,
      notify_push: true,
      notify_telegram: false,
      telegram_chat_id: null,
      telegram_premium: false,
      profile_visible: true,
      show_demo_banner: true,
    })
  }

  return NextResponse.json(data)
}

/**
 * PUT /api/v1/users/me/preferences
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  let body: UpdateBody
  try {
    body = (await request.json()) as UpdateBody
  } catch {
    return ERR('INVALID_BODY', 'JSON body non valido', 400)
  }

  const supabase = createAdminClient()
  // Upsert (insert if not exists)
  const { error } = await supabase
    .from('user_preferences')
    .upsert({ user_id: auth.userId, ...body, updated_at: new Date().toISOString() })

  if (error) {
    console.error('[preferences PUT]', error)
    return ERR('INTERNAL_ERROR', 'Errore update preferences', 500)
  }

  return NextResponse.json({ ok: true })
}
