'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'
import type { HeroBadge } from '@/components/home/HeroCard'
import { EventCard } from '@/components/markets/EventCard'

interface Props {
  initialEvents: AuktoraEvent[]
  /**
   * Eventi "curati" sempre fissi in cima al grid, nell'ordine fornito,
   * non riordinati dal sort. Hidden quando l'utente filtra per search/tag
   * (così il search funziona davvero).
   */
  pinnedEvents?: AuktoraEvent[]
  /** Badge per gli eventi pinned (es. "New market" / "Live now"), keyed per id. */
  badges?: Record<string, HeroBadge>
  /** Pagina iniziale visibile, default 20 */
  pageSize?: number
  /** Layout grid (default 'grid') | 'list' */
  layout?: 'grid' | 'list'
}

type SortKey = 'volume24h' | 'newest' | 'closing-soon'

function sortEvents(events: AuktoraEvent[], sort: SortKey): AuktoraEvent[] {
  const arr = [...events]
  if (sort === 'newest') {
    arr.sort((a, b) => b.endDate.getTime() - a.endDate.getTime())
  } else if (sort === 'closing-soon') {
    arr.sort((a, b) => a.endDate.getTime() - b.endDate.getTime())
  } else {
    arr.sort((a, b) => b.volume24hr - a.volume24hr)
  }
  return arr
}

export function MarketsGrid({
  initialEvents,
  pinnedEvents = [],
  badges,
  pageSize = 20,
  layout = 'grid',
}: Props) {
  const searchParams = useSearchParams()
  const sort = (searchParams.get('sort') as SortKey) ?? 'volume24h'
  const q = searchParams.get('q')?.toLowerCase().trim() ?? ''
  const activeTag = searchParams.get('tag') ?? 'all'
  const [visible, setVisible] = useState(pageSize)

  const filtered = useMemo(() => {
    if (!q && activeTag === 'all') return initialEvents
    const tagLower = activeTag.toLowerCase()
    return initialEvents.filter((ev) => {
      const matchQ = !q || ev.title.toLowerCase().includes(q)
      const matchTag =
        activeTag === 'all' || ev.tags.some((t) => t.toLowerCase().includes(tagLower))
      return matchQ && matchTag
    })
  }, [initialEvents, q, activeTag])

  const sorted = useMemo(() => sortEvents(filtered, sort), [filtered, sort])
  const visibleEvents = sorted.slice(0, visible)
  const hasMore = visible < sorted.length

  // Pinned visibili solo quando l'utente NON sta filtrando — search/tag
  // attivi nascondono i pinned così le query mostrano risultati onesti.
  const showPinned = !q && activeTag === 'all' && pinnedEvents.length > 0
  const totalCount = (showPinned ? pinnedEvents.length : 0) + sorted.length

  // Grid: 3 colonne desktop, 2 tablet (sm), 1 mobile.
  // 'list': 1 colonna su tutti i breakpoint.
  const gridClass =
    layout === 'list' ? 'grid grid-cols-1' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <section style={{ flex: 1, minWidth: 0 }}>
      {totalCount === 0 ? (
        <div
          style={{
            padding: '40px 16px',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-base)',
          }}
        >
          {q || activeTag !== 'all'
            ? 'No markets match the current filters.'
            : 'Nessun mercato trovato per questa categoria.'}
        </div>
      ) : (
        <>
          <div className={gridClass} style={{ gap: 12, padding: '12px 16px' }}>
            {showPinned &&
              pinnedEvents.map((event) => (
                <EventCard key={`pinned-${event.id}`} event={event} badge={badges?.[event.id]} />
              ))}
            {visibleEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 16px 24px' }}>
              <button
                type="button"
                onClick={() => setVisible((v) => v + pageSize)}
                style={{
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 18px',
                  fontSize: 'var(--font-base)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Carica altri ({sorted.length - visible})
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
