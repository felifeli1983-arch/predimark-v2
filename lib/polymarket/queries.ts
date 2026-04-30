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

/**
 * Fetch eventi attivi di una specifica categoria (tag slug).
 * Usato dai filtri Crypto/Sport/Politics ecc — vanno dritti su Gamma con
 * `tag_slug=...` invece di filtrare client-side i 20 eventi della home.
 *
 * Ritorna fino a `limit` eventi attivi (default 100), ordinati per volume 24h.
 */
export async function fetchEventsByTag(
  tagSlug: string,
  limit: number = 100
): Promise<GammaEvent[]> {
  return gammaGet<GammaEvent[]>(
    '/events',
    {
      tag_slug: tagSlug,
      active: true,
      closed: false,
      order: 'volume24hr',
      ascending: false,
      limit,
    },
    { revalidate: 30 }
  )
}

/**
 * Fetch eventi LIVE (active=true, closed=false, end_date_min=NOW), ordinati per
 * scadenza (i più imminenti prima). Pesca attraverso TUTTE le categorie:
 * crypto round 5m/15m, sport in corso, politics, ecc.
 *
 * IMPORTANTE: il filtro `end_date_min=NOW` esclude rounds vecchi che Gamma
 * lascia con `active=true` ma scaduti settimane fa. Senza questo, la home
 * Live si riempiva di crypto round del 2025 che non sono live.
 */
export async function fetchLiveEvents(limit: number = 100): Promise<GammaEvent[]> {
  const nowIso = new Date().toISOString()
  return gammaGet<GammaEvent[]>(
    '/events',
    {
      active: true,
      closed: false,
      end_date_min: nowIso,
      order: 'endDate',
      ascending: true,
      limit,
    },
    { revalidate: 15 }
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
