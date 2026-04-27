import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import type { TablesInsert } from '@/lib/supabase/database.types'

export interface WatchlistItem {
  id: string
  polymarketMarketId: string
  polymarketEventId: string | null
  slug: string | null
  title: string
  image: string | null
  currentYesPrice: number | null
  notifyPriceChangePct: number | null
  notifySignal: boolean
  notifyResolution: boolean
  addedAt: string
}

/**
 * GET /api/v1/watchlist
 * Ritorna la watchlist dell'utente autenticato con metadata mercati.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('watchlist')
    .select(
      `
        id,
        notify_price_change_pct,
        notify_signal,
        notify_resolution,
        added_at,
        markets (
          id,
          polymarket_market_id,
          polymarket_event_id,
          slug,
          title,
          image_url,
          current_yes_price
        )
      `
    )
    .eq('user_id', auth.userId)
    .order('added_at', { ascending: false })

  if (error) {
    console.error('[watchlist GET]', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Errore lettura watchlist' } },
      { status: 500 }
    )
  }

  const items: WatchlistItem[] = (data ?? []).map((row) => ({
    id: row.id,
    polymarketMarketId: row.markets?.polymarket_market_id ?? '',
    polymarketEventId: row.markets?.polymarket_event_id ?? null,
    slug: row.markets?.slug ?? null,
    title: row.markets?.title ?? '',
    image: row.markets?.image_url ?? null,
    currentYesPrice: row.markets?.current_yes_price ?? null,
    notifyPriceChangePct: row.notify_price_change_pct,
    notifySignal: row.notify_signal ?? true,
    notifyResolution: row.notify_resolution ?? true,
    addedAt: row.added_at ?? new Date().toISOString(),
  }))

  return NextResponse.json({ items })
}

interface AddBody {
  polymarketMarketId: string
  polymarketEventId: string
  slug: string
  title: string
  cardKind: string
  category: string
  image?: string
  currentYesPrice?: number
  notifyPriceChangePct?: number
  notifySignal?: boolean
  notifyResolution?: boolean
}

/**
 * POST /api/v1/watchlist
 * Idempotent: aggiunge il market alla watchlist dell'utente.
 * Se markets row non esiste ancora, la upserta (admin client bypass RLS).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  let body: AddBody
  try {
    body = (await request.json()) as AddBody
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_BODY', message: 'JSON body non valido' } },
      { status: 400 }
    )
  }

  if (
    !body.polymarketMarketId ||
    !body.polymarketEventId ||
    !body.slug ||
    !body.title ||
    !body.cardKind ||
    !body.category
  ) {
    return NextResponse.json(
      {
        error: {
          code: 'MISSING_FIELD',
          message:
            'polymarketMarketId, polymarketEventId, slug, title, cardKind, category sono richiesti',
        },
      },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  // 1. Upsert markets idempotente (chiave unica polymarket_market_id)
  const marketUpsert: TablesInsert<'markets'> = {
    polymarket_market_id: body.polymarketMarketId,
    polymarket_event_id: body.polymarketEventId,
    slug: body.slug,
    title: body.title,
    card_kind: body.cardKind,
    category: body.category,
    image_url: body.image ?? null,
    current_yes_price: body.currentYesPrice ?? null,
    last_synced_at: new Date().toISOString(),
  }

  const { data: market, error: marketErr } = await supabase
    .from('markets')
    .upsert(marketUpsert, { onConflict: 'polymarket_market_id' })
    .select('id')
    .single()

  if (marketErr || !market) {
    console.error('[watchlist POST] upsert markets fallito', marketErr)
    return NextResponse.json(
      { error: { code: 'MARKET_UPSERT_FAILED', message: 'Errore sync mercato' } },
      { status: 500 }
    )
  }

  // 2. Insert watchlist (idempotent via UNIQUE user_id+market_id)
  const watchlistInsert: TablesInsert<'watchlist'> = {
    user_id: auth.userId,
    market_id: market.id,
    notify_price_change_pct: body.notifyPriceChangePct ?? null,
    notify_signal: body.notifySignal ?? true,
    notify_resolution: body.notifyResolution ?? true,
  }

  const { data: row, error: insErr } = await supabase
    .from('watchlist')
    .upsert(watchlistInsert, { onConflict: 'user_id,market_id' })
    .select('id')
    .single()

  if (insErr || !row) {
    console.error('[watchlist POST] insert watchlist fallito', insErr)
    return NextResponse.json(
      { error: { code: 'WATCHLIST_INSERT_FAILED', message: 'Errore aggiunta watchlist' } },
      { status: 500 }
    )
  }

  return NextResponse.json({ id: row.id }, { status: 201 })
}
