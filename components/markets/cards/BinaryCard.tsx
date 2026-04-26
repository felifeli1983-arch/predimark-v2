'use client'

import type { AuktoraEvent } from '@/lib/polymarket/mappers'
import { DonutChart } from '../charts/DonutChart'
import { EventCardHeader } from '../EventCardHeader'
import { EventCardFooter } from '../EventCardFooter'

interface BinaryCardProps {
  event: AuktoraEvent
  onBookmark?: (eventId: string) => void
  onAddToSlip?: (eventId: string, outcome: 'yes' | 'no') => void
}

export function BinaryCard({ event, onBookmark, onAddToSlip }: BinaryCardProps) {
  const market = event.markets[0]
  const yesPrice = market?.yesPrice ?? 0.5
  const noPrice = market?.noPrice ?? 1 - yesPrice
  const yesPct = Math.round(yesPrice * 100)
  const noPct = Math.round(noPrice * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <EventCardHeader
        title={event.title}
        image={event.image}
        tags={event.tags}
        onBookmark={onBookmark ? () => onBookmark(event.id) : undefined}
      />

      <div
        style={{
          padding: '8px 12px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <DonutChart probability={yesPrice} size={80} />

        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddToSlip?.(event.id, 'yes')
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
              onAddToSlip?.(event.id, 'no')
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

      <EventCardFooter
        volume={event.totalVolume}
        endDate={event.endDate}
        onAddToSlip={onAddToSlip ? () => onAddToSlip(event.id, 'yes') : undefined}
      />
    </div>
  )
}
