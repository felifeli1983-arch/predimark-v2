import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await requireAdmin(request, ['super_admin', 'admin'])
  if ('error' in result) return result.error

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id, role, added_at, last_login_at, mfa_enabled')
    .order('added_at', { ascending: true })

  if (error) {
    console.error('[admin team]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura team', 500)
  }
  return NextResponse.json({ items: data ?? [] })
}
