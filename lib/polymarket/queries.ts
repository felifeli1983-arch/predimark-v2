import { unstable_cache } from 'next/cache'
import { gammaGet } from './client'
import type { GammaEvent, GammaEventsParams, GammaMarket } from './types'

type ParamRecord = Record<string, string | number | boolean | undefined>

const LIST_EVENT_FIELDS = new Set<keyof GammaEvent>([
  'id',
  'title',
  'slug',
  'image',
  'icon',
  'startDate',
  'endDate',
  'active',
  'closed',
  'volume24hr',
  'volume',
  'liquidity',
  'commentCount',
  'tags',
  'markets',
  'series',
])

const LIST_MARKET_FIELDS = new Set<keyof GammaMarket>([
  'id',
  'conditionId',
  'questionID',
  'question',
  'slug',
  'outcomes',
  'outcomePrices',
  'volume',
  'liquidity',
  'startDate',
  'endDate',
  'active',
  'closed',
  'clobTokenIds',
  'enableOrderBook',
  'acceptingOrders',
  'orderPriceMinTickSize',
  'orderMinSize',
  'groupItemTitle',
  'resolutionSource',
])

/**
 * Proietta solo i campi che il mapper consuma — il payload Gamma raw è ~90KB
 * per evento (markets[].description duplicate, eventMetadata, clobRewards,
 * uma* fields). Senza questa proiezione anche 20 eventi superano il limit
 * 2MB di Next.js data cache, costringendo refetch ad ogni request.
 *
 * USA SOLO per liste — fetchEventBySlug/fetchEventById tornano payload pieno
 * perché la pagina evento mostra description + market metadata complete.
 */
function projectListEvents(events: GammaEvent[]): GammaEvent[] {
  return events.map((ev) => {
    const evRec = ev as unknown as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(evRec)) {
      if (LIST_EVENT_FIELDS.has(k as keyof GammaEvent)) out[k] = evRec[k]
    }
    if (Array.isArray(ev.markets)) {
      out.markets = ev.markets.map((m) => {
        const mRec = m as unknown as Record<string, unknown>
        const mOut: Record<string, unknown> = {}
        for (const k of Object.keys(mRec)) {
          if (LIST_MARKET_FIELDS.has(k as keyof GammaMarket)) mOut[k] = mRec[k]
        }
        return mOut as unknown as GammaMarket
      })
    }
    if (Array.isArray(ev.tags)) {
      out.tags = ev.tags.map((t) => ({ id: '', label: '', slug: t.slug }))
    }
    if (Array.isArray(ev.series)) {
      out.series = ev.series.map((s) => ({ id: '', slug: s.slug, label: '', image: '' }))
    }
    return out as unknown as GammaEvent
  })
}

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
 * include solo ~20 eventi mentre Gamma ne serve 500+ attivi.
 *
 * Doc "Fetching Markets" Polymarket: usare `offset` per pagination
 * server-side oltre il limit. Default offset=0 mantiene compat.
 */
/**
 * Featured events: la projection riduce ~10MB upstream → ~1.7MB cache-able.
 * Usiamo unstable_cache (in-memory + revalidate) invece del fetch cache di
 * Next perché il payload raw upstream supera il limit 2MB.
 */
export const fetchFeaturedEvents = unstable_cache(
  async (limit: number = 80, offset: number = 0): Promise<GammaEvent[]> => {
    const events = await gammaGet<GammaEvent[]>(
      '/events',
      {
        active: true,
        closed: false,
        order: 'volume24hr',
        ascending: false,
        limit,
        offset,
      },
      { noCache: true }
    )
    return projectListEvents(events)
  },
  ['gamma-featured-events'],
  { revalidate: 30 }
)

/**
 * Fetch eventi attivi di una specifica categoria (tag slug).
 * Doc Polymarket consiglia `tag_id` numerico ma `tag_slug` stringa
 * funziona ed è più human-readable per le nostre rotte `/?category=politics`.
 *
 * Ritorna fino a `limit` eventi attivi, ordinati per volume 24h.
 * Supporta `offset` per pagination server-side.
 */
export interface EventsByTagOpts {
  /** Default 100. */
  limit?: number
  /** Default 0. Pagination server-side. */
  offset?: number
  /**
   * Doc Polymarket "Fetching Markets": include events di tag correlati
   * (es. tag "Politics" → include anche "Trump", "Election" markets).
   * Più copertura ma meno preciso. Default false.
   */
  relatedTags?: boolean
  /**
   * Esclude un tag specifico dai risultati (es. tag_slug='sports' +
   * exclude='nfl' → tutti gli sport tranne NFL). Accetta tag_id
   * numerico o slug.
   */
  excludeTag?: string
}

const fetchEventsByTagInner = unstable_cache(
  async (
    tagSlug: string,
    limit: number,
    offset: number,
    relatedTags: boolean,
    excludeTag: string | undefined
  ): Promise<GammaEvent[]> => {
    const params: ParamRecord = {
      tag_slug: tagSlug,
      active: true,
      closed: false,
      order: 'volume24hr',
      ascending: false,
      limit,
      offset,
    }
    if (relatedTags) params.related_tags = true
    if (excludeTag) params.exclude_tag_id = excludeTag
    const events = await gammaGet<GammaEvent[]>('/events', params, { noCache: true })
    return projectListEvents(events)
  },
  ['gamma-events-by-tag'],
  { revalidate: 30 }
)

export async function fetchEventsByTag(
  tagSlug: string,
  limitOrOpts: number | EventsByTagOpts = 100,
  offsetArg: number = 0
): Promise<GammaEvent[]> {
  const opts: EventsByTagOpts =
    typeof limitOrOpts === 'number' ? { limit: limitOrOpts, offset: offsetArg } : limitOrOpts
  return fetchEventsByTagInner(
    tagSlug,
    opts.limit ?? 100,
    opts.offset ?? 0,
    opts.relatedTags ?? false,
    opts.excludeTag
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
export const fetchLiveEvents = unstable_cache(
  async (limit: number = 80): Promise<GammaEvent[]> => {
    const nowIso = new Date().toISOString()
    const events = await gammaGet<GammaEvent[]>(
      '/events',
      {
        active: true,
        closed: false,
        end_date_min: nowIso,
        order: 'endDate',
        ascending: true,
        limit,
      },
      { noCache: true }
    )
    return projectListEvents(events)
  },
  ['gamma-live-events'],
  { revalidate: 15 }
)

export const searchEvents = unstable_cache(
  async (query: string, limit: number = 20): Promise<GammaEvent[]> => {
    const events = await gammaGet<GammaEvent[]>(
      '/events',
      { search: query, active: true, limit },
      { noCache: true }
    )
    return projectListEvents(events)
  },
  ['gamma-search-events'],
  { revalidate: 15 }
)

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
export async function fetchNextRoundInSeries(seriesSlug: string): Promise<GammaEvent | null> {
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

// ============================================================
//  Gamma /markets — standalone single-market endpoints
// ============================================================

/**
 * Fetch standalone markets list (singolo binary market = 1 entry,
 * indipendente dall'event grouping). Usato quando serve un market
 * specifico per condizione/slug senza il wrapper event.
 */
export async function fetchMarkets(params?: {
  active?: boolean
  closed?: boolean
  limit?: number
  order?: string
  ascending?: boolean
}): Promise<GammaMarket[]> {
  return gammaGet<GammaMarket[]>(
    '/markets',
    params
      ? {
          ...(params.active !== undefined && { active: params.active }),
          ...(params.closed !== undefined && { closed: params.closed }),
          ...(params.limit !== undefined && { limit: params.limit }),
          ...(params.order && { order: params.order }),
          ...(params.ascending !== undefined && { ascending: params.ascending }),
        }
      : undefined,
    { revalidate: 30 }
  )
}

/** Singolo market by id (Polymarket internal id, NON conditionId). */
export async function fetchMarketById(id: string): Promise<GammaMarket | null> {
  try {
    return await gammaGet<GammaMarket>(`/markets/${encodeURIComponent(id)}`, undefined, {
      revalidate: 60,
    })
  } catch {
    return null
  }
}

// ============================================================
//  Gamma /public-search — cross-entity search (events+markets+profiles)
// ============================================================

export interface PublicSearchProfile {
  proxyWallet: string
  name: string
  pseudonym: string
  bio: string
  profileImage: string
  verified: boolean
}

export interface PublicSearchResult {
  events: GammaEvent[]
  /** Profiles top traders (presenti se la query matcha un username). */
  profiles?: PublicSearchProfile[]
  pagination?: {
    hasMore: boolean
  }
}

/**
 * Cross-entity search: events + profili user. Più potente di
 * `/events?search=` perché ritorna anche profili creator/holder.
 */
export async function publicSearch(
  query: string,
  limitPerType: number = 10
): Promise<PublicSearchResult> {
  if (!query.trim()) return { events: [] }
  return gammaGet<PublicSearchResult>(
    '/public-search',
    { q: query.trim(), limit_per_type: limitPerType },
    { revalidate: 15 }
  )
}

// ============================================================
//  Gamma /tags + /series + /sports + /teams — metadata
// ============================================================

export interface GammaTag {
  id: string
  label: string
  slug: string
  forceShow?: boolean
}

/** Lista tag rankati per popolarità — usabile per chips dinamici. */
export async function fetchTags(limit: number = 50): Promise<GammaTag[]> {
  const data = await gammaGet<GammaTag[]>('/tags', { limit }, { revalidate: 600 })
  return Array.isArray(data) ? data : []
}

export interface GammaSeriesItem {
  id: string
  slug: string
  ticker: string
  title: string
  /** "single" | "weekly" | "monthly" etc. */
  seriesType: string
  recurrence: string
  image?: string
  icon?: string
}

/** Lista series (gruppi ricorrenti come btc-up-or-down-5m). */
export async function fetchSeries(params?: {
  recurrence?: string
  limit?: number
}): Promise<GammaSeriesItem[]> {
  const data = await gammaGet<GammaSeriesItem[]>(
    '/series',
    params
      ? {
          ...(params.recurrence && { recurrence: params.recurrence }),
          ...(params.limit !== undefined && { limit: params.limit }),
        }
      : { limit: 50 },
    { revalidate: 600 }
  )
  return Array.isArray(data) ? data : []
}

export interface GammaSport {
  id: number
  sport: string
  image: string
  resolution: string
  ordering: string
  /** Comma-separated tag IDs. */
  tags: string
}

/** Sports metadata — leghe sportive supportate da Polymarket. */
export async function fetchSports(): Promise<GammaSport[]> {
  const data = await gammaGet<GammaSport[]>('/sports', undefined, { revalidate: 3600 })
  return Array.isArray(data) ? data : []
}

export interface GammaTeam {
  id: string
  name: string
  shortName?: string
  league: string
  logo?: string
}

/** Lista team per una specifica lega (es. NFL, NBA, Premier League). */
export async function fetchTeams(league: string, limit: number = 100): Promise<GammaTeam[]> {
  const data = await gammaGet<GammaTeam[]>('/teams', { league, limit }, { revalidate: 3600 })
  return Array.isArray(data) ? data : []
}
