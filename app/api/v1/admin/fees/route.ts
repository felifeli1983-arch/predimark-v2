import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

const FEE_KEYS = [
  'builder_fee_default_bps',
  'copy_trading_builder_fee_bps',
  'copy_trading_creator_share_bps',
  'copy_trading_external_share_bps',
  'copy_trading_min_payout_usd',
] as const

interface FeesResponse {
  builder_fee_default_bps: number
  copy_trading_builder_fee_bps: number
  copy_trading_creator_share_bps: number
  copy_trading_external_share_bps: number
  copy_trading_min_payout_usd: number
  updated_at: string | null
  updated_by: string | null
}

interface UpdateBody {
  builder_fee_default_bps?: number
  copy_trading_builder_fee_bps?: number
  copy_trading_creator_share_bps?: number
  copy_trading_min_payout_usd?: number
  reason?: string
}

/**
 * GET /api/v1/admin/fees — current fee config from app_settings
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await requireAdmin(request, ['super_admin', 'admin', 'moderator', 'viewer'])
  if ('error' in result) return result.error

  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('app_settings' as any) as any)
    .select('key, value, updated_at, updated_by')
    .in('key', [...FEE_KEYS])

  if (error) {
    console.error('[admin fees GET]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura fees', 500)
  }

  type SettingRow = {
    key: string
    value: unknown
    updated_at: string | null
    updated_by: string | null
  }
  const rows = (data as SettingRow[] | null) ?? []
  const map = new Map<
    string,
    { value: unknown; updated_at: string | null; updated_by: string | null }
  >()
  for (const row of rows) {
    map.set(row.key, { value: row.value, updated_at: row.updated_at, updated_by: row.updated_by })
  }

  const get = (key: (typeof FEE_KEYS)[number]) => Number(map.get(key)?.value ?? 0)
  const lastUpdate = rows.reduce<{ updated_at: string | null; updated_by: string | null }>(
    (latest, row) => {
      if (!row.updated_at) return latest
      if (!latest.updated_at || row.updated_at > latest.updated_at) {
        return { updated_at: row.updated_at, updated_by: row.updated_by }
      }
      return latest
    },
    { updated_at: null, updated_by: null }
  )

  const response: FeesResponse = {
    builder_fee_default_bps: get('builder_fee_default_bps'),
    copy_trading_builder_fee_bps: get('copy_trading_builder_fee_bps'),
    copy_trading_creator_share_bps: get('copy_trading_creator_share_bps'),
    copy_trading_external_share_bps: get('copy_trading_external_share_bps'),
    copy_trading_min_payout_usd: get('copy_trading_min_payout_usd'),
    updated_at: lastUpdate.updated_at,
    updated_by: lastUpdate.updated_by,
  }
  return NextResponse.json(response)
}

/**
 * PUT /api/v1/admin/fees — update fee config (super_admin + admin only)
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const result = await requireAdmin(request, ['super_admin', 'admin'])
  if ('error' in result) return result.error

  let body: UpdateBody
  try {
    body = (await request.json()) as UpdateBody
  } catch {
    return ERR('INVALID_BODY', 'JSON body non valido', 400)
  }

  if (!body.reason || body.reason.trim().length < 5) {
    return ERR('REASON_REQUIRED', 'Reason note richiesta (min 5 caratteri) per audit log', 400)
  }

  const supabase = createAdminClient()
  const updates: Array<{ key: string; value: number }> = []

  if (body.builder_fee_default_bps !== undefined) {
    if (body.builder_fee_default_bps < 0 || body.builder_fee_default_bps > 200) {
      return ERR('INVALID_VALUE', 'builder_fee_default_bps deve essere 0-200', 400)
    }
    updates.push({ key: 'builder_fee_default_bps', value: body.builder_fee_default_bps })
  }
  if (body.copy_trading_builder_fee_bps !== undefined) {
    if (body.copy_trading_builder_fee_bps < 0 || body.copy_trading_builder_fee_bps > 200) {
      return ERR('INVALID_VALUE', 'copy_trading_builder_fee_bps deve essere 0-200', 400)
    }
    updates.push({
      key: 'copy_trading_builder_fee_bps',
      value: body.copy_trading_builder_fee_bps,
    })
  }
  if (body.copy_trading_creator_share_bps !== undefined) {
    if (body.copy_trading_creator_share_bps < 0 || body.copy_trading_creator_share_bps > 5000) {
      return ERR('INVALID_VALUE', 'copy_trading_creator_share_bps deve essere 0-5000 (= 50%)', 400)
    }
    updates.push({
      key: 'copy_trading_creator_share_bps',
      value: body.copy_trading_creator_share_bps,
    })
  }
  if (body.copy_trading_min_payout_usd !== undefined) {
    if (body.copy_trading_min_payout_usd < 0) {
      return ERR('INVALID_VALUE', 'copy_trading_min_payout_usd >= 0', 400)
    }
    updates.push({ key: 'copy_trading_min_payout_usd', value: body.copy_trading_min_payout_usd })
  }

  if (updates.length === 0) {
    return ERR('NO_UPDATES', 'Nessun valore da aggiornare', 400)
  }

  for (const u of updates) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('app_settings' as any) as any)
      .update({
        value: u.value,
        updated_at: new Date().toISOString(),
        updated_by: result.admin.userId,
      })
      .eq('key', u.key)
    if (error) {
      console.error('[admin fees PUT]', u.key, error)
      return ERR('INTERNAL_ERROR', `Errore update ${u.key}`, 500)
    }
  }

  return NextResponse.json({ ok: true, updated: updates.length, reason: body.reason })
}
