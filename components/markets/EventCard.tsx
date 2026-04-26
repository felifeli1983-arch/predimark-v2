'use client'

import Link from 'next/link'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'
import { BinaryCard } from './cards/BinaryCard'
import { MultiOutcomeCard } from './cards/MultiOutcomeCard'
import { MultiStrikeCard } from './cards/MultiStrikeCard'
import { H2HCard } from './cards/H2HCard'
import { CryptoCard } from './cards/CryptoCard'

interface EventCardProps {
  event: AuktoraEvent
  onBookmark?: (eventId: string) => void
  onAddToSlip?: (eventId: string, outcome: string) => void
}

const cardStyle: React.CSSProperties = {
  display: 'block',
  background: 'var(--color-bg-secondary)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 12,
  overflow: 'hidden',
  textDecoration: 'none',
  color: 'inherit',
  transition: 'border-color 150ms, box-shadow 150ms',
  cursor: 'pointer',
}

export function EventCard({ event, onBookmark, onAddToSlip }: EventCardProps) {
  const binaryAdapter = onAddToSlip
    ? (eventId: string, outcome: 'yes' | 'no') => onAddToSlip(eventId, outcome)
    : undefined

  return (
    <Link href={`/event/${event.slug}`} style={cardStyle} className="hover-lift">
      {event.kind === 'binary' && (
        <BinaryCard event={event} onBookmark={onBookmark} onAddToSlip={binaryAdapter} />
      )}
      {event.kind === 'multi_outcome' && (
        <MultiOutcomeCard event={event} onBookmark={onBookmark} onAddToSlip={onAddToSlip} />
      )}
      {event.kind === 'multi_strike' && (
        <MultiStrikeCard event={event} onBookmark={onBookmark} onAddToSlip={onAddToSlip} />
      )}
      {event.kind === 'h2h_sport' && (
        <H2HCard event={event} onBookmark={onBookmark} onAddToSlip={onAddToSlip} />
      )}
      {event.kind === 'crypto_up_down' && (
        <CryptoCard event={event} onBookmark={onBookmark} onAddToSlip={onAddToSlip} />
      )}
    </Link>
  )
}
