import { NextRequest, NextResponse } from 'next/server'
import { fetchRelatedRounds } from '@/lib/polymarket/queries'
import { mapGammaEvent } from '@/lib/polymarket/mappers'

export const revalidate = 60

interface RoundItem {
  slug: string
  endDate: string
  resolution: 'yes' | 'no' | 'active' | 'pending'
}

function resolveRound(
  market: ReturnType<typeof mapGammaEvent>['markets'][number] | undefined
): RoundItem['resolution'] {
  if (!market) return 'pending'
  if (market.active && !market.closed) return 'active'
  if (!market.closed) return 'pending'
  if (market.yesPrice >= 0.99) return 'yes'
  if (market.noPrice >= 0.99) return 'no'
  return 'pending'
}

/**
 * GET /api/v1/crypto/rounds?seriesSlug=btc-up-or-down-5m&limit=15
 *
 * Ritorna round storici della stessa serie con esito (yes/no/active/pending).
 * Usato da CryptoRoundNav client-side per mostrare pallini colorati.
 * Cache ISR: 60s.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)
  const seriesSlug = url.searchParams.get('seriesSlug')
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '15', 10), 30)

  if (!seriesSlug) {
    return NextResponse.json({ error: 'seriesSlug richiesto' }, { status: 400 })
  }

  const events = await fetchRelatedRounds(seriesSlug, limit)
  const items: RoundItem[] = events.map((raw) => {
    const mapped = mapGammaEvent(raw)
    return {
      slug: raw.slug,
      endDate: raw.endDate,
      resolution: resolveRound(mapped.markets[0]),
    }
  })

  return NextResponse.json({ items })
}
