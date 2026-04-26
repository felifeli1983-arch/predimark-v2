import { fetchFeaturedEvents } from '@/lib/polymarket/queries'
import { mapGammaEvent } from '@/lib/polymarket/mappers'
import { NavTabs } from '@/components/home/NavTabs'
import { HeroZone } from '@/components/home/HeroZone'
import { MarketsSection } from '@/components/home/MarketsSection'
import { Sidebar } from '@/components/home/Sidebar'

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
    <div>
      <NavTabs />
      <div
        className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px]"
        style={{
          gap: 12,
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 0 24px',
        }}
      >
        <main style={{ minWidth: 0 }}>
          <HeroZone events={heroEvents} />
          <MarketsSection initialEvents={filtered} />
        </main>
        <div style={{ padding: '12px 16px 0 0' }}>
          <Sidebar />
        </div>
      </div>
    </div>
  )
}
