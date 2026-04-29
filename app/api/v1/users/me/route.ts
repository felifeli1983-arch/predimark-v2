import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

interface UpdateBody {
  display_name?: string
  bio?: string
  language?: string
  theme?: string
}

/**
 * GET /api/v1/users/me — current user profile
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('users')
    .select(
      'id, email, username, display_name, bio, avatar_url, language, theme, country_code, created_at, last_login_at'
    )
    .eq('id', auth.userId)
    .maybeSingle()

  if (error) {
    console.error('[users/me GET]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura profilo', 500)
  }
  if (!data) return ERR('NOT_FOUND', 'User non trovato', 404)

  return NextResponse.json(data)
}

/**
 * PUT /api/v1/users/me — update profile (display_name, bio, language, theme)
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

  const update: Record<string, string> = {}
  if (body.display_name !== undefined) {
    if (body.display_name.length > 40) return ERR('INVALID_NAME', 'display_name max 40 char', 400)
    update.display_name = body.display_name
  }
  if (body.bio !== undefined) {
    if (body.bio.length > 500) return ERR('INVALID_BIO', 'bio max 500 char', 400)
    update.bio = body.bio
  }
  if (body.language !== undefined) {
    if (!['en', 'it', 'es', 'pt', 'fr'].includes(body.language)) {
      return ERR('INVALID_LANG', 'language deve essere en|it|es|pt|fr', 400)
    }
    update.language = body.language
  }
  if (body.theme !== undefined) {
    if (!['dark', 'light'].includes(body.theme)) {
      return ERR('INVALID_THEME', 'theme deve essere dark|light', 400)
    }
    update.theme = body.theme
  }

  if (Object.keys(update).length === 0) {
    return ERR('NO_UPDATES', 'Nessun campo da aggiornare', 400)
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('users')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(update as any)
    .eq('id', auth.userId)

  if (error) {
    console.error('[users/me PUT]', error)
    return ERR('INTERNAL_ERROR', 'Errore update profilo', 500)
  }

  return NextResponse.json({ ok: true })
}
