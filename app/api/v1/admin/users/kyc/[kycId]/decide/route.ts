import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

interface Body {
  action?: 'approve' | 'reject'
  reason?: string
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ kycId: string }> }
): Promise<NextResponse> {
  const result = await requireAdmin(request, ['super_admin', 'admin', 'moderator'])
  if ('error' in result) return result.error

  const { kycId } = await context.params
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return ERR('INVALID_BODY', 'JSON invalid', 400)
  }
  if (body.action !== 'approve' && body.action !== 'reject') {
    return ERR('INVALID_ACTION', 'action deve essere approve|reject', 400)
  }
  if (body.action === 'reject' && (!body.reason || body.reason.trim().length < 5)) {
    return ERR('REASON_REQUIRED', 'Reason richiesta per reject (min 5 char)', 400)
  }

  const supabase = createAdminClient()
  const update =
    body.action === 'approve'
      ? {
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: result.admin.userId,
        }
      : {
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: result.admin.userId,
          rejection_reason: body.reason!.trim(),
        }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('kyc_submissions') as any).update(update).eq('id', kycId)

  if (error) {
    console.error('[admin kyc decide]', error)
    return ERR('INTERNAL_ERROR', 'Errore decide KYC', 500)
  }

  return NextResponse.json({ ok: true, action: body.action })
}
