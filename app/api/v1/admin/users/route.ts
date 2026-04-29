import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

const DEFAULT_PER_PAGE = 50
const MAX_PER_PAGE = 200

/**
 * GET /api/v1/admin/users?search=&status=&per_page=50&page=1
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await requireAdmin(request, ['super_admin', 'admin', 'moderator'])
  if ('error' in result) return result.error

  const url = new URL(request.url)
  const search = url.searchParams.get('search')?.trim() ?? ''
  const status = url.searchParams.get('status') ?? ''
  const pageRaw = Number(url.searchParams.get('page'))
  const perPageRaw = Number(url.searchParams.get('per_page'))
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1
  const perPage =
    Number.isFinite(perPageRaw) && perPageRaw > 0
      ? Math.min(Math.floor(perPageRaw), MAX_PER_PAGE)
      : DEFAULT_PER_PAGE
  const offset = (page - 1) * perPage

  const supabase = createAdminClient()

  try {
    let q = supabase
      .from('users')
      .select(
        'id, email, username, display_name, privy_did, last_login_at, created_at, is_suspended, deleted_at, country_code',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1)

    if (search) {
      q = q.or(`email.ilike.%${search}%,username.ilike.%${search}%`)
    }
    if (status === 'banned') q = q.not('deleted_at', 'is', null)
    else if (status === 'suspended') q = q.eq('is_suspended', true)
    else if (status === 'active') q = q.is('deleted_at', null).eq('is_suspended', false)

    const { data, error, count } = await q
    if (error) throw error

    return NextResponse.json({
      items: data ?? [],
      meta: { total: count ?? 0, page, perPage, hasMore: (count ?? 0) > offset + perPage },
    })
  } catch (err) {
    console.error('[admin users GET]', err)
    return ERR('INTERNAL_ERROR', 'Errore lettura utenti', 500)
  }
}
