import { Suspense } from 'react'
import { fetchFeaturedEvents, fetchEventsByTag, fetchLiveEvents } from '@/lib/polymarket/queries'
import { mapGammaEvent } from '@/lib/polymarket/mappers'
import { HeroZone } from '@/components/home/HeroZone'
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
  const rawEvents = await fetchEventsForCategory(params.category)
  const all = rawEvents.map(mapGammaEvent)

  // Hero solo nella view default (no category → top 3 featured)
  const isDefault = !params.category || params.category === 'all' || params.category === 'for-you'
  const heroEvents = isDefault ? all.slice(0, 3) : []
  const gridEvents = isDefault ? all.slice(3) : all

  return (
    <>
      <Suspense fallback={null}>
        <NavTabs />
      </Suspense>
      <PageContainer sidebar={<Sidebar />}>
        {heroEvents.length > 0 && <HeroZone events={heroEvents} />}
        <MobileSidebarRails />
        <MarketsSection initialEvents={gridEvents} />
      </PageContainer>
    </>
  )
}
