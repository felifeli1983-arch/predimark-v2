import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/creators/[creatorId]
 * Profile pubblico Creator. Mostra solo Creator verified + is_public.
 * NB: usiamo user_id (UUID) come identifier — più semplice di "username" custom.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ creatorId: string }> }
): Promise<NextResponse> {
  const { creatorId } = await context.params
  if (!creatorId) {
    return ERR('MISSING_ID', 'creatorId richiesto', 400)
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('creators')
    .select(
      'user_id, score, tier, followers_count, copiers_active, total_earnings, bio_creator, website_url, twitter_handle, discord_handle, specialization, show_positions, show_history, anonymize_amounts, verified_at, is_verified, is_public, is_suspended'
    )
    .eq('user_id', creatorId)
    .maybeSingle()

  if (error) {
    console.error('[creator GET]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura creator', 500)
  }
  if (!data || !data.is_verified || data.is_suspended || !data.is_public) {
    return ERR('NOT_FOUND', 'Creator non trovato o non pubblico', 404)
  }

  return NextResponse.json(data)
}
