'use client'

import { useState } from 'react'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'
import type { HeroBadge } from './HeroCard'
import { MarketsFilters } from './MarketsFilters'
import { MarketsGrid } from './MarketsGrid'

interface Props {
  initialEvents: AuktoraEvent[]
  /** Eventi pinned in cima al grid (sopra il sort). */
  pinnedEvents?: AuktoraEvent[]
  /** Badge per i pinned, keyed per event.id. */
  badges?: Record<string, HeroBadge>
}

/**
 * Container client che ospita Filters + Grid: il layout state (grid/list)
 * vive qui, condiviso fra i due child.
 * Lasciato a livello di page.tsx (Server Component) come unico "use client" boundary.
 */
export function MarketsSection({ initialEvents, pinnedEvents, badges }: Props) {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  return (
    <>
      <MarketsFilters layout={layout} onLayoutChange={setLayout} />
      <MarketsGrid
        initialEvents={initialEvents}
        pinnedEvents={pinnedEvents}
        badges={badges}
        layout={layout}
      />
    </>
  )
}
