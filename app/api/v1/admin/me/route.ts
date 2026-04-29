import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'

/**
 * GET /api/v1/admin/me
 * Ritorna admin context o 404. Usato da /app/admin/layout per gating UI.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await requireAdmin(request)
  if ('error' in result) return result.error
  return NextResponse.json({
    role: result.admin.role,
    user_id: result.admin.userId,
  })
}
