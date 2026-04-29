import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/leaderboard/mode
 * Pubblico — ritorna se leaderboard è in unified mode (1 tab) o separated (2 tab).
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('feature_flags')
    .select('enabled')
    .eq('key', 'leaderboard_unified_mode')
    .maybeSingle()

  if (error) {
    console.error('[leaderboard/mode]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura mode', 500)
  }

  return NextResponse.json({ unified: data?.enabled ?? false })
}
