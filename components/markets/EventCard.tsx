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
}

/*
 * Altezza fissa standard per TUTTE le 5 variants.
 * header 80 + body 140 + footer 40 = 260.
 */
const CARD_HEIGHT = 260

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: CARD_HEIGHT,
  background: 'var(--color-bg-secondary)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
  textDecoration: 'none',
  color: 'inherit',
  transition: 'border-color 150ms, box-shadow 150ms',
  cursor: 'pointer',
}

export function EventCard({ event, onBookmark }: EventCardProps) {
  return (
    <Link href={`/event/${event.slug}`} style={cardStyle} className="hover-lift">
      {event.kind === 'binary' && <BinaryCard event={event} onBookmark={onBookmark} />}
      {event.kind === 'multi_outcome' && <MultiOutcomeCard event={event} onBookmark={onBookmark} />}
      {event.kind === 'multi_strike' && <MultiStrikeCard event={event} onBookmark={onBookmark} />}
      {event.kind === 'h2h_sport' && <H2HCard event={event} onBookmark={onBookmark} />}
      {event.kind === 'crypto_up_down' && <CryptoCard event={event} onBookmark={onBookmark} />}
    </Link>
  )
}
