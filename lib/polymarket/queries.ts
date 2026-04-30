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

/**
 * Top eventi attivi ordinati per volume 24h. Storicamente filtrava
 * `featured=true` ma quel flag viene curato a mano da Polymarket e
 * include solo ~20 eventi mentre Gamma ne serve 500+ attivi. L'utente
 * vede 23 card totali (20 featured + 3 hero) → "elimina il blocco":
 * via il filtro featured, default limit alzato a 200 (con cap 500
 * server-side di Gamma).
 */
export async function fetchFeaturedEvents(limit: number = 200): Promise<GammaEvent[]> {
  return gammaGet<GammaEvent[]>(
    '/events',
    {
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

export type HeroPickKind = 'new' | 'live' | 'upcoming'

export interface HeroPick {
  event: GammaEvent
  kind: HeroPickKind
}

/**
 * Hero curation per la home — 3 eventi specifici aggiornati 1x/giorno:
 *  1. NEW → mercato più recente attivo (order startDate desc)
 *  2. LIVE → round BTC 5min più imminente (series 'btc-up-or-down-5m', endDate asc)
 *  3. UPCOMING → match sport con kickoff più vicino (tag sports, endDate asc)
 *
 * Ritorna fino a 3 eventi nell'ordine sopra. Se uno qualunque manca,
 * l'array è più corto — la HeroZone gestisce gracefully.
 *
 * Cache 1h (revalidate=3600) — bilancia "1x/giorno" con la necessità
 * di non lasciare round crypto scaduti in vetrina.
 */
export async function fetchHeroEvents(): Promise<HeroPick[]> {
  const nowIso = new Date().toISOString()
  const [newest, cryptoRounds, sport] = await Promise.all([
    gammaGet<GammaEvent[]>(
      '/events',
      {
        active: true,
        closed: false,
        order: 'startDate',
        ascending: false,
        end_date_min: nowIso,
        limit: 5,
      },
      { revalidate: 3600 }
    ).catch(() => [] as GammaEvent[]),
    gammaGet<GammaEvent[]>(
      '/events',
      {
        // IMPORTANTE: Gamma vuole snake_case `series_slug`. La camelCase
        // `seriesSlug` viene ignorata silenziosamente e ritorna eventi
        // sbagliati (es. multi-strike MicroStrategy invece del round BTC 5m).
        series_slug: 'btc-up-or-down-5m',
        active: true,
        closed: false,
        end_date_min: nowIso,
        order: 'endDate',
        ascending: true,
        limit: 1,
      },
      { revalidate: 30 }
    ).catch(() => [] as GammaEvent[]),
    gammaGet<GammaEvent[]>(
      '/events',
      {
        tag_slug: 'sports',
        active: true,
        closed: false,
        end_date_min: nowIso,
        order: 'endDate',
        ascending: true,
        limit: 5,
      },
      { revalidate: 3600 }
    ).catch(() => [] as GammaEvent[]),
  ])

  const out: HeroPick[] = []
  const seen = new Set<string>()
  const push = (ev: GammaEvent | undefined, kind: HeroPickKind) => {
    if (!ev || seen.has(ev.id)) return
    seen.add(ev.id)
    out.push({ event: ev, kind })
  }

  // 1. Newest: skippa eventi che si chiudono entro 24h (sono "soonest", non "newest")
  const oneDayMs = 24 * 60 * 60 * 1000
  const nowMs = Date.now()
  const newestPick = newest.find((ev) => {
    const end = ev.endDate ? Date.parse(ev.endDate) : NaN
    return !Number.isFinite(end) || end - nowMs > oneDayMs
  })
  push(newestPick ?? newest[0], 'new')

  // 2. Crypto BTC 5min round
  push(cryptoRounds[0], 'live')

  // 3. Sport soonest — primo che non sia già nel set
  const sportPick = sport.find((ev) => !seen.has(ev.id))
  push(sportPick ?? sport[0], 'upcoming')

  return out
}

/**
 * Fetch del PROSSIMO round attivo nella stessa serie crypto (es. quando
 * il round corrente è scaduto, recupera quello successivo).
 *
 * Filtri: `series_slug + active=true + closed=false + end_date_min=NOW`,
 * ordinati ASC per endDate. Il primo è il next.
 *
 * `cache: 'no-store'` perché chiamata client-side ad ogni 5s tick — non
 * vogliamo browser cache che ci ridia il round appena scaduto.
 */
export async function fetchNextRoundInSeries(
  seriesSlug: string
): Promise<GammaEvent | null> {
  const nowIso = new Date().toISOString()
  const url = new URL('/events', 'https://gamma-api.polymarket.com')
  url.searchParams.set('series_slug', seriesSlug)
  url.searchParams.set('active', 'true')
  url.searchParams.set('closed', 'false')
  url.searchParams.set('end_date_min', nowIso)
  url.searchParams.set('order', 'endDate')
  url.searchParams.set('ascending', 'true')
  url.searchParams.set('limit', '1')
  try {
    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as GammaEvent[]
    return Array.isArray(data) && data[0] ? data[0] : null
  } catch {
    return null
  }
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
    // Gamma vuole snake_case (`series_slug`), non camelCase.
    { series_slug: seriesSlug, limit, order: 'endDate', ascending: false },
    { revalidate: 60 }
  )
  return Array.isArray(events) ? events : []
}
