'use client'

import Link from 'next/link'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'
import { BinaryCard } from './cards/BinaryCard'

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

function PlaceholderCard({ label }: { label: string }) {
  return (
    <div
      style={{
        height: 160,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-tertiary)',
        color: 'var(--color-text-muted)',
        fontSize: 13,
        fontStyle: 'italic',
      }}
    >
      {label}
    </div>
  )
}

export function EventCard({ event, onBookmark, onAddToSlip }: EventCardProps) {
  const adapter = onAddToSlip
    ? (eventId: string, outcome: 'yes' | 'no') => onAddToSlip(eventId, outcome)
    : undefined

  return (
    <Link href={`/event/${event.slug}`} style={cardStyle} className="hover-lift">
      {event.kind === 'binary' && (
        <BinaryCard event={event} onBookmark={onBookmark} onAddToSlip={adapter} />
      )}
      {event.kind === 'multi_outcome' && <PlaceholderCard label="Multi outcome — coming soon" />}
      {event.kind === 'multi_strike' && <PlaceholderCard label="Multi strike — coming soon" />}
      {event.kind === 'h2h_sport' && <PlaceholderCard label="H2H Sport — coming soon" />}
      {event.kind === 'crypto_up_down' && <PlaceholderCard label="Crypto — coming soon" />}
    </Link>
  )
}
