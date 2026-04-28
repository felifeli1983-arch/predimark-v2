'use client'

import { useRouter } from 'next/navigation'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'
import { DonutChart } from '../charts/DonutChart'
import { EventCardHeader } from '../EventCardHeader'
import { EventCardFooter } from '../EventCardFooter'
import { StarToggle } from '../StarToggle'

interface BinaryCardProps {
  event: AuktoraEvent
  onBookmark?: (eventId: string) => void
}

export function BinaryCard({ event, onBookmark }: BinaryCardProps) {
  const router = useRouter()
  const market = event.markets[0]
  const yesPrice = market?.yesPrice ?? 0.5
  const noPrice = market?.noPrice ?? 1 - yesPrice
  const yesPct = Math.round(yesPrice * 100)
  const noPct = Math.round(noPrice * 100)

  function navigateToEvent(side: 'yes' | 'no') {
    if (!market) return
    router.push(`/event/${event.slug}?market=${market.id}&side=${side}`)
  }

  return (
    <div className="flex flex-col" style={{ flex: 1 }}>
      <EventCardHeader
        title={event.title}
        image={event.image}
        tags={event.tags}
        onBookmark={onBookmark ? () => onBookmark(event.id) : undefined}
        starSlot={
          market ? (
            <StarToggle
              payload={{
                polymarketMarketId: market.id,
                polymarketEventId: event.id,
                slug: event.slug,
                title: event.title,
                cardKind: event.kind,
                category: event.tags[0] ?? 'general',
                image: event.image,
                currentYesPrice: market.yesPrice,
              }}
              marketLabel={event.title}
            />
          ) : undefined
        }
      />

      <div
        style={{
          padding: '8px 12px 12px',
          alignItems: 'center',
          gap: 8,
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          justifyContent: 'center',
        }}
        className="flex flex-col"
      >
        <DonutChart probability={yesPrice} size={70} />

        <div className="flex w-full" style={{ gap: 8 }}>
          <button
            type="button"
            className="btn-trade btn-trade-yes"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              navigateToEvent('yes')
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-base)',
              fontWeight: 600,
            }}
          >
            Yes {yesPct}%
          </button>
          <button
            type="button"
            className="btn-trade btn-trade-no"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              navigateToEvent('no')
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-base)',
              fontWeight: 600,
            }}
          >
            No {noPct}%
          </button>
        </div>
      </div>

      <EventCardFooter volume={event.totalVolume} endDate={event.endDate} />
    </div>
  )
}
