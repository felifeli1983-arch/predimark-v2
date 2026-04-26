'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'
import { EventCard } from '@/components/markets/EventCard'

interface Props {
  initialEvents: AuktoraEvent[]
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

export function MarketsGrid({ initialEvents, pageSize = 20, layout = 'grid' }: Props) {
  const searchParams = useSearchParams()
  const sort = (searchParams.get('sort') as SortKey) ?? 'volume24h'
  const [visible, setVisible] = useState(pageSize)

  const sorted = useMemo(() => sortEvents(initialEvents, sort), [initialEvents, sort])
  const visibleEvents = sorted.slice(0, visible)
  const hasMore = visible < sorted.length

  // Grid: 3 colonne desktop, 2 tablet (sm), 1 mobile.
  // 'list': 1 colonna su tutti i breakpoint.
  const gridClass =
    layout === 'list' ? 'grid grid-cols-1' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <section style={{ flex: 1, minWidth: 0 }}>
      {sorted.length === 0 ? (
        <div
          style={{
            padding: '40px 16px',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 13,
          }}
        >
          Nessun mercato trovato per questa categoria.
        </div>
      ) : (
        <>
          <div className={gridClass} style={{ gap: 12, padding: '12px 16px' }}>
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
                  borderRadius: 8,
                  padding: '8px 18px',
                  fontSize: 13,
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
