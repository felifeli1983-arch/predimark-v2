import { gammaGet } from './client'
import type { GammaEvent, GammaEventsParams } from './types'

type ParamRecord = Record<string, string | number | boolean | undefined>

export async function fetchEvents(params?: GammaEventsParams): Promise<GammaEvent[]> {
  return gammaGet<GammaEvent[]>('/events', params ? ({ ...params } as ParamRecord) : undefined, {
    revalidate: 30,
  })
}

export async function fetchEventBySlug(slug: string): Promise<GammaEvent | null> {
  const events = await gammaGet<GammaEvent[]>('/events', { slug, limit: 1 }, { revalidate: 60 })
  return events[0] ?? null
}

export async function fetchEventById(id: string): Promise<GammaEvent | null> {
  const events = await gammaGet<GammaEvent[]>('/events', { id, limit: 1 }, { revalidate: 60 })
  return events[0] ?? null
}

export async function fetchFeaturedEvents(limit: number = 10): Promise<GammaEvent[]> {
  return gammaGet<GammaEvent[]>(
    '/events',
    {
      featured: true,
      active: true,
      order: 'volume24hr',
      ascending: false,
      limit,
    },
    { revalidate: 30 }
  )
}

export async function searchEvents(query: string, limit: number = 20): Promise<GammaEvent[]> {
  return gammaGet<GammaEvent[]>(
    '/events',
    { search: query, active: true, limit },
    { revalidate: 15 }
  )
}

/**
 * Fetch round della stessa serie crypto (es. tutti i round 'btc-up-or-down-5m').
 * Ordinati per endDate decrescente (più recenti prima).
 * Usato da CryptoRoundNav per mostrare pallini esito dei round storici.
 */
export async function fetchRelatedRounds(
  seriesSlug: string,
  limit: number = 15
): Promise<GammaEvent[]> {
  const events = await gammaGet<GammaEvent[]>(
    '/events',
    { seriesSlug, limit, order: 'endDate', ascending: false },
    { revalidate: 60 }
  )
  return Array.isArray(events) ? events : []
}
