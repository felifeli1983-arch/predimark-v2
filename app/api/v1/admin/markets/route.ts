import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await requireAdmin(request, ['super_admin', 'admin', 'moderator', 'viewer'])
  if ('error' in result) return result.error

  const url = new URL(request.url)
  const limit = Number(url.searchParams.get('limit')) || 50

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('markets')
    .select(
      'id, title, slug, category, volume_total, volume_24h, is_active, is_featured, is_hidden, resolves_at, resolved_at'
    )
    .order('volume_24h', { ascending: false, nullsFirst: false })
    .limit(Math.min(limit, 500))

  if (error) {
    console.error('[admin markets]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura markets', 500)
  }
  return NextResponse.json({ items: data ?? [] })
}
