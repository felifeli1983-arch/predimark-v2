'use client'

import type { AuktoraEvent } from '@/lib/polymarket/mappers'
import { SentimentCard } from './SentimentCard'
import { RelatedMarkets } from './RelatedMarkets'

interface Props {
  event: AuktoraEvent
  layout: 'sidebar' | 'inline'
}

/**
 * Sprint "Make Event Page Real" — sidebar evento con Sentiment reale
 * + Mercati correlati live da Gamma. Sostituisce gli stub MA5.
 *
 * Il Trade Widget è montato direttamente da `EventPageShell`:
 *  - desktop ≥lg: come slot sidebar di `<PageContainer>`
 *  - mobile <lg: come bottom sheet (visibility da `useTradeWidget.isOpen`)
 *
 * Quando layout='inline' (mobile dentro main column) mostra Sentiment+Related.
 */
export function EventSidebarStub({ event, layout }: Props) {
  const primaryTag = event.tags[0] ?? ''
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        paddingBottom: layout === 'sidebar' ? 24 : 0,
      }}
    >
      <SentimentCard event={event} />
      {primaryTag && <RelatedMarkets primaryTag={primaryTag} excludeId={event.id} />}
    </div>
  )
}
