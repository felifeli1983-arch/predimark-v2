import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

interface DecideBody {
  decision: 'approve' | 'reject'
  reason?: string
}

/**
 * POST /api/v1/admin/creators/[creatorId]/decide
 * Body: { decision: 'approve'|'reject', reason? }
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ creatorId: string }> }
): Promise<NextResponse> {
  const result = await requireAdmin(request, ['super_admin', 'admin'])
  if ('error' in result) return result.error

  const { creatorId } = await context.params
  let body: DecideBody
  try {
    body = (await request.json()) as DecideBody
  } catch {
    return ERR('INVALID_BODY', 'JSON body non valido', 400)
  }

  if (body.decision !== 'approve' && body.decision !== 'reject') {
    return ERR('INVALID_DECISION', 'decision deve essere approve|reject', 400)
  }
  if (body.decision === 'reject' && (!body.reason || body.reason.trim().length < 5)) {
    return ERR('REASON_REQUIRED', 'Reason richiesta per reject (min 5 caratteri)', 400)
  }

  const supabase = createAdminClient()
  const update =
    body.decision === 'approve'
      ? {
          application_status: 'approved',
          is_verified: true,
          verified_at: new Date().toISOString(),
          is_public: true,
          reviewed_at: new Date().toISOString(),
          reviewed_by: result.admin.userId,
        }
      : {
          application_status: 'rejected',
          is_verified: false,
          rejection_reason: body.reason!.trim(),
          reviewed_at: new Date().toISOString(),
          reviewed_by: result.admin.userId,
        }

  const { error } = await supabase.from('creators').update(update).eq('user_id', creatorId)

  if (error) {
    console.error('[admin creators decide]', error)
    return ERR('INTERNAL_ERROR', 'Errore update application', 500)
  }

  return NextResponse.json({ ok: true, decision: body.decision })
}
