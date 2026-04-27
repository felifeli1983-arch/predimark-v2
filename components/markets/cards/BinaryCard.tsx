'use client'

import { useRouter } from 'next/navigation'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'
import { DonutChart } from '../charts/DonutChart'
import { EventCardHeader } from '../EventCardHeader'
import { EventCardFooter } from '../EventCardFooter'
import { StarToggle, watchlistStubToggle } from '../StarToggle'

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
              isFavorite={false}
              onToggle={() => watchlistStubToggle(market.id)}
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
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              navigateToEvent('yes')
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              background: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              border: '1px solid var(--color-success)',
            }}
          >
            Yes {yesPct}%
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              navigateToEvent('no')
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              border: '1px solid var(--color-danger)',
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
