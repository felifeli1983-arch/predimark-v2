import { Suspense } from 'react'
import {
  fetchFeaturedEvents,
  fetchEventsByTag,
  fetchLiveEvents,
  fetchHeroEvents,
  type HeroPickKind,
} from '@/lib/polymarket/queries'
import { mapGammaEvent } from '@/lib/polymarket/mappers'
import { HeroZone } from '@/components/home/HeroZone'
import type { HeroBadge } from '@/components/home/HeroCard'
import { MarketsSection } from '@/components/home/MarketsSection'
import { Sidebar } from '@/components/home/Sidebar'
import { MobileSidebarRails } from '@/components/home/MobileSidebarRails'
import { NavTabs } from '@/components/home/NavTabs'
import { PageContainer } from '@/components/layout/PageContainer'

interface SearchParams {
  category?: string
  sort?: string
}

/**
 * Slug NavTabs che NON corrispondono a tag Gamma reali — fallback a featured.
 * I tag veri (politics/sports/crypto/esports/pop-culture/business/science/
 * geopolitics) vanno dritti su `/events?tag_slug=...`.
 */
const NON_TAG_SLUGS = new Set(['all', 'for-you', 'live', 'mentions', 'creators'])

/** Mapping kind hero → badge visivo (label + colore semantico). */
const HERO_BADGES: Record<HeroPickKind, HeroBadge> = {
  new: { label: 'New market', color: 'var(--color-success)' },
  live: { label: 'Live now', color: 'var(--color-danger)', live: true },
  upcoming: { label: 'Prossimo match', color: 'var(--color-warning)' },
}

async function fetchEventsForCategory(category: string | undefined) {
  if (!category || category === 'all' || category === 'for-you') {
    // Default: top 20 per volume 24h (featured)
    return fetchFeaturedEvents(20)
  }
  if (category === 'live') {
    // LIVE: 100 attivi attraverso TUTTE le categorie (no filtro featured →
    // include crypto round, sport in corso, ecc).
    return fetchLiveEvents(100)
  }
  if (NON_TAG_SLUGS.has(category)) {
    // mentions/creators → MA5+ feature, per ora mostra featured
    return fetchFeaturedEvents(20)
  }
  // Categoria reale → fetch dedicato per quel tag (fino a 100 eventi)
  return fetchEventsByTag(category, 100)
}

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const isDefault = !params.category || params.category === 'all' || params.category === 'for-you'

  // Hero curato (3 eventi: newest + crypto BTC 5m + sport soonest) solo
  // sulla view default. Lanciato in parallelo al feed principale.
  const [rawEvents, heroPicks] = await Promise.all([
    fetchEventsForCategory(params.category),
    isDefault ? fetchHeroEvents() : Promise.resolve([]),
  ])

  const heroEvents = heroPicks.map((p) => mapGammaEvent(p.event))
  const heroBadges: Record<string, HeroBadge> = Object.fromEntries(
    heroPicks.map((p) => [p.event.id, HERO_BADGES[p.kind]])
  )
  const heroIds = new Set(heroEvents.map((ev) => ev.id))
  // Escludi gli eventi già in hero dalla griglia per evitare duplicati visivi.
  const gridEvents = rawEvents.map(mapGammaEvent).filter((ev) => !heroIds.has(ev.id))

  return (
    <>
      <Suspense fallback={null}>
        <NavTabs />
      </Suspense>
      <PageContainer sidebar={<Sidebar />}>
        {heroEvents.length > 0 && <HeroZone events={heroEvents} badges={heroBadges} />}
        <MobileSidebarRails />
        <MarketsSection initialEvents={gridEvents} />
      </PageContainer>
    </>
  )
}
