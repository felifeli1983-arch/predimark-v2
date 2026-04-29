import { Suspense } from 'react'
import { fetchFeaturedEvents } from '@/lib/polymarket/queries'
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

function filterByCategory(
  events: ReturnType<typeof mapGammaEvent>[],
  category: string | undefined
) {
  if (!category || category === 'all' || category === 'for-you') return events
  if (category === 'live') return events.filter((e) => e.active && !e.closed)
  return events.filter((e) => e.tags.some((t) => t.toLowerCase().includes(category.toLowerCase())))
}

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const rawEvents = await fetchFeaturedEvents(40)
  const all = rawEvents.map(mapGammaEvent)
  const heroEvents = all.slice(0, 3)
  const remaining = all.slice(3)
  const filtered = filterByCategory(remaining, params.category)

  return (
    <>
      <Suspense fallback={null}>
        <NavTabs />
      </Suspense>
      <PageContainer sidebar={<Sidebar />}>
        <HeroZone events={heroEvents} />
        <MobileSidebarRails />
        <MarketsSection initialEvents={filtered} />
      </PageContainer>
    </>
  )
}
