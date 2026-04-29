import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

interface ApplyBody {
  display_name?: string
  bio?: string
  twitter_handle?: string
  discord_handle?: string
  website_url?: string
  specialization?: string[]
}

const MAX_BIO = 500
const MAX_SPEC = 5

/**
 * POST /api/v1/creators/apply
 * Body: { display_name, bio?, twitter_handle?, discord_handle?, website_url?, specialization? }
 * Crea record `creators` con application_status='pending'. Verifica auto via cron job
 * o admin manuale (vedi MA5.2 /admin/creators/applications).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  let body: ApplyBody
  try {
    body = (await request.json()) as ApplyBody
  } catch {
    return ERR('INVALID_BODY', 'JSON body non valido', 400)
  }

  const display_name = body.display_name?.trim()
  if (!display_name || display_name.length < 3 || display_name.length > 40) {
    return ERR('INVALID_NAME', 'display_name 3-40 caratteri', 400)
  }
  if (body.bio && body.bio.length > MAX_BIO) {
    return ERR('INVALID_BIO', `bio max ${MAX_BIO} caratteri`, 400)
  }
  if (body.specialization && body.specialization.length > MAX_SPEC) {
    return ERR('INVALID_SPEC', `max ${MAX_SPEC} specialization`, 400)
  }

  const supabase = createAdminClient()

  // Check già esistente
  const { data: existing } = await supabase
    .from('creators')
    .select('user_id, application_status')
    .eq('user_id', auth.userId)
    .maybeSingle()

  if (existing) {
    return ERR(
      'ALREADY_APPLIED',
      `Application già esistente (status: ${existing.application_status})`,
      409
    )
  }

  const { error } = await supabase.from('creators').insert({
    user_id: auth.userId,
    application_status: 'pending',
    bio_creator: body.bio ?? null,
    twitter_handle: body.twitter_handle ?? null,
    discord_handle: body.discord_handle ?? null,
    website_url: body.website_url ?? null,
    specialization: body.specialization ?? null,
    is_verified: false,
    is_public: false,
  })

  if (error) {
    console.error('[creators apply POST]', error)
    return ERR('INTERNAL_ERROR', 'Errore creazione application', 500)
  }

  return NextResponse.json({ ok: true, status: 'pending' }, { status: 201 })
}

/**
 * GET /api/v1/creators/apply
 * Status application del current user (per UI mostrare pending/verified/rejected/none).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('creators')
    .select('application_status, is_verified, verified_at, rejection_reason')
    .eq('user_id', auth.userId)
    .maybeSingle()

  if (error) {
    console.error('[creators apply GET]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura status', 500)
  }

  if (!data) {
    return NextResponse.json({ status: 'none' })
  }

  return NextResponse.json({
    status: data.application_status,
    is_verified: data.is_verified,
    verified_at: data.verified_at,
    rejection_reason: data.rejection_reason,
  })
}
