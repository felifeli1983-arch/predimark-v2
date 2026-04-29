import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

interface UpdateBody {
  key?: string
  enabled?: boolean
  rollout_percentage?: number
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await requireAdmin(request, ['super_admin', 'admin', 'moderator', 'viewer'])
  if ('error' in result) return result.error

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('feature_flags')
    .select('key, description, enabled, rollout_percentage, updated_at')
    .order('key', { ascending: true })

  if (error) {
    console.error('[admin feature-flags GET]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura feature_flags', 500)
  }
  return NextResponse.json({ items: data ?? [] })
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const result = await requireAdmin(request, ['super_admin', 'admin'])
  if ('error' in result) return result.error

  let body: UpdateBody
  try {
    body = (await request.json()) as UpdateBody
  } catch {
    return ERR('INVALID_BODY', 'JSON invalid', 400)
  }
  if (!body.key) return ERR('MISSING_KEY', 'key richiesto', 400)

  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('feature_flags') as any)
    .update({
      enabled: body.enabled,
      rollout_percentage: body.rollout_percentage,
      updated_by: result.admin.userId,
      updated_at: new Date().toISOString(),
    })
    .eq('key', body.key)

  if (error) {
    console.error('[admin feature-flags PUT]', error)
    return ERR('INTERNAL_ERROR', 'Errore update', 500)
  }
  return NextResponse.json({ ok: true })
}
