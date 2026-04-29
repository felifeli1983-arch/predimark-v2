import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

interface Body {
  reason?: string
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
): Promise<NextResponse> {
  const result = await requireAdmin(request, ['super_admin', 'admin'])
  if ('error' in result) return result.error

  const { userId } = await context.params
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return ERR('INVALID_BODY', 'JSON invalid', 400)
  }
  if (!body.reason || body.reason.trim().length < 5) {
    return ERR('REASON_REQUIRED', 'reason richiesta (min 5 char)', 400)
  }

  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('users') as any)
    .update({
      is_suspended: true,
      suspended_at: new Date().toISOString(),
      suspended_reason: body.reason.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('[admin users suspend]', error)
    return ERR('INTERNAL_ERROR', 'Errore sospensione', 500)
  }

  return NextResponse.json({ ok: true })
}
