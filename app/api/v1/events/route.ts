import { NextRequest, NextResponse } from 'next/server'
import { fetchFeaturedEvents, fetchEventsByTag } from '@/lib/polymarket/queries'
import { mapGammaEvent } from '@/lib/polymarket/mappers'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

const NON_TAG_SLUGS = new Set(['all', 'for-you', 'live', 'mentions', 'creators'])

/**
 * GET /api/v1/events?category=politics&limit=100&offset=200
 *
 * Wrapper API server-side per fetch eventi paginati. Usato da
 * MarketsGrid client-side per "load more" oltre i 200 eventi
 * iniziali caricati a SSR.
 *
 * Doc "Fetching Markets" Polymarket: pagination via `offset` +
 * `limit` (default Gamma serve fino a 500/page).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)
  const category = url.searchParams.get('category') ?? undefined
  const limit = Math.min(500, Math.max(1, Number(url.searchParams.get('limit') ?? 100)))
  const offset = Math.max(0, Number(url.searchParams.get('offset') ?? 0))

  try {
    let raw
    if (!category || NON_TAG_SLUGS.has(category)) {
      raw = await fetchFeaturedEvents(limit, offset)
    } else {
      raw = await fetchEventsByTag(category, limit, offset)
    }
    const items = raw.map(mapGammaEvent)
    return NextResponse.json({
      items,
      meta: { limit, offset, count: items.length },
    })
  } catch (err) {
    console.error('[events list]', err)
    return ERR('UPSTREAM_ERROR', 'Errore fetch events da Gamma', 502)
  }
}
