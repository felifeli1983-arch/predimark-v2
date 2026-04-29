import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await requireAdmin(request, ['super_admin', 'admin', 'moderator'])
  if ('error' in result) return result.error

  const url = new URL(request.url)
  const status = url.searchParams.get('status') ?? 'pending'

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('kyc_submissions')
    .select('id, user_id, status, submitted_at, reviewed_at, rejection_reason')
    .eq('status', status)
    .order('submitted_at', { ascending: true })
    .limit(100)

  if (error) {
    console.error('[admin kyc]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura KYC', 500)
  }
  return NextResponse.json({ items: data ?? [] })
}
