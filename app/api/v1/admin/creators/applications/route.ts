import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/admin/creators/applications?status=pending|approved|rejected
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await requireAdmin(request, ['super_admin', 'admin', 'moderator'])
  if ('error' in result) return result.error

  const url = new URL(request.url)
  const status = url.searchParams.get('status') ?? 'pending'

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('creators')
    .select(
      'user_id, applied_at, application_status, bio_creator, twitter_handle, discord_handle, website_url, specialization, is_verified, verified_at, rejection_reason'
    )
    .eq('application_status', status)
    .order('applied_at', { ascending: true })

  if (error) {
    console.error('[admin creators applications]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura applications', 500)
  }

  return NextResponse.json({ items: data ?? [] })
}
