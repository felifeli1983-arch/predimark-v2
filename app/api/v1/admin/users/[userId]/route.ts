import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
): Promise<NextResponse> {
  const result = await requireAdmin(request, ['super_admin', 'admin', 'moderator'])
  if ('error' in result) return result.error

  const { userId } = await context.params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('users')
    .select(
      'id, email, username, display_name, bio, privy_did, country_code, language, is_suspended, suspended_at, suspended_reason, deleted_at, onboarding_completed, created_at, updated_at, last_login_at'
    )
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('[admin users/[id] GET]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura user', 500)
  }
  if (!data) return ERR('NOT_FOUND', 'User non trovato', 404)

  return NextResponse.json(data)
}
