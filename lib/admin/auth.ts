import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'viewer'

/**
 * Hierarchy: super_admin > admin > moderator > viewer.
 * Higher roles inherit lower role permissions.
 */
const ROLE_LEVEL: Record<AdminRole, number> = {
  super_admin: 4,
  admin: 3,
  moderator: 2,
  viewer: 1,
}

interface AdminContext {
  userId: string
  privyDid: string
  role: AdminRole
}

/**
 * Server-side guard: verifica che user sia admin con role minimo richiesto.
 * Pattern: admin route handlers chiamano `await requireAdmin(request, ['admin', 'super_admin'])`.
 *
 * Ritorna `{ admin }` o `{ error: NextResponse }` per early-return.
 */
export async function requireAdmin(
  request: NextRequest,
  allowedRoles: AdminRole[] = ['super_admin', 'admin', 'moderator', 'viewer']
): Promise<{ admin: AdminContext } | { error: NextResponse }> {
  const auth = await requireUserId(request)
  if ('error' in auth) return { error: auth.error }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', auth.userId)
    .maybeSingle()

  if (error) {
    console.error('[requireAdmin]', error)
    return {
      error: NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Errore lettura admin role' } },
        { status: 500 }
      ),
    }
  }

  if (!data) {
    // Don't leak existence of admin panel — 404 instead of 403
    return {
      error: NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Not found' } },
        { status: 404 }
      ),
    }
  }

  const role = data.role as AdminRole
  const minRequired = Math.min(...allowedRoles.map((r) => ROLE_LEVEL[r]))
  if (ROLE_LEVEL[role] < minRequired) {
    return {
      error: NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Permission denied per questa azione admin' } },
        { status: 403 }
      ),
    }
  }

  // Touch last_login_at (best-effort, no error propagation)
  void supabase
    .from('admin_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('user_id', auth.userId)

  return { admin: { userId: auth.userId, privyDid: auth.privyDid, role } }
}

/**
 * Helper per Server Components: ritorna admin context o null se non admin.
 * Usato in /app/admin/* layout per gating route-level.
 */
export async function getCurrentAdmin(): Promise<AdminContext | null> {
  // Per ora non implementabile senza un Privy session check server-side completo.
  // I /app/admin/* pages verificheranno via fetch lato client a un endpoint interno.
  return null
}
