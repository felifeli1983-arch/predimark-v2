'use client'

import { useState } from 'react'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'
import { MarketsFilters } from './MarketsFilters'
import { MarketsGrid } from './MarketsGrid'

interface Props {
  initialEvents: AuktoraEvent[]
}

/**
 * Container client che ospita Filters + Grid: il layout state (grid/list)
 * vive qui, condiviso fra i due child.
 * Lasciato a livello di page.tsx (Server Component) come unico "use client" boundary.
 */
export function MarketsSection({ initialEvents }: Props) {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  return (
    <>
      <MarketsFilters layout={layout} onLayoutChange={setLayout} />
      <MarketsGrid initialEvents={initialEvents} layout={layout} />
    </>
  )
}
