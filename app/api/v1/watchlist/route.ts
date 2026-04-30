import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveOrUpsertMarket } from '@/lib/markets/upsert'
import { listWatchlist, addToWatchlist } from '@/lib/watchlist/queries'

export interface WatchlistItem {
  id: string
  polymarketMarketId: string
  polymarketEventId: string | null
  slug: string | null
  title: string
  image: string | null
  currentYesPrice: number | null
  /** Yes token id (clob_token_ids[0]) per subscription live midpoint via WS. */
  tokenId: string | null
  notifyPriceChangePct: number | null
  notifySignal: boolean
  notifyResolution: boolean
  addedAt: string
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

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/** GET /api/v1/watchlist — lista watchlist user con metadata mercati. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const result = await listWatchlist(createAdminClient(), auth.userId)
  if ('error' in result) {
    console.error('[watchlist GET]', result.error)
    return ERR('INTERNAL_ERROR', 'Errore lettura watchlist', 500)
  }
  return NextResponse.json({ items: result })
}

/** POST /api/v1/watchlist — idempotent: upsert markets + insert watchlist row. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  let body: AddBody
  try {
    body = (await request.json()) as AddBody
  } catch {
    return ERR('INVALID_BODY', 'JSON body non valido', 400)
  }

  if (
    !body.polymarketMarketId ||
    !body.polymarketEventId ||
    !body.slug ||
    !body.title ||
    !body.cardKind ||
    !body.category
  ) {
    return ERR(
      'MISSING_FIELD',
      'polymarketMarketId, polymarketEventId, slug, title, cardKind, category sono richiesti',
      400
    )
  }

  const supabase = createAdminClient()

  const market = await resolveOrUpsertMarket(supabase, body)
  if ('error' in market) {
    console.error('[watchlist POST] markets', market.error)
    return ERR('MARKET_UPSERT_FAILED', 'Errore sync mercato', 500)
  }

  const inserted = await addToWatchlist(supabase, {
    userId: auth.userId,
    marketId: market.id,
    notifyPriceChangePct: body.notifyPriceChangePct,
    notifySignal: body.notifySignal,
    notifyResolution: body.notifyResolution,
  })
  if ('error' in inserted) {
    console.error('[watchlist POST] insert', inserted.error)
    return ERR('WATCHLIST_INSERT_FAILED', 'Errore aggiunta watchlist', 500)
  }

  return NextResponse.json({ id: inserted.id }, { status: 201 })
}
