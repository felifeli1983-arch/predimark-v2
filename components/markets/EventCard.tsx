'use client'

import Link from 'next/link'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'
import type { HeroBadge } from '@/components/home/HeroCard'
import { BinaryCard } from './cards/BinaryCard'
import { MultiOutcomeCard } from './cards/MultiOutcomeCard'
import { MultiStrikeCard } from './cards/MultiStrikeCard'
import { H2HCard } from './cards/H2HCard'
import { CryptoCard } from './cards/CryptoCard'

interface EventCardProps {
  event: AuktoraEvent
  onBookmark?: (eventId: string) => void
  /** Badge curato (es. "New market" / "Live now") posizionato top-left. */
  badge?: HeroBadge
}

/*
 * Altezza fissa standard per TUTTE le 5 variants.
 * header 80 + body 140 + footer 40 = 260.
 */
const CARD_HEIGHT = 260

const cardStyle: React.CSSProperties = {
  position: 'relative',
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

export function EventCard({ event, onBookmark, badge }: EventCardProps) {
  // Badge curato: NON overlay top-left (copriva avatar+title). Sostituito con
  // - bordo sinistro 3px colorato (segnale visivo non invasivo)
  // - micro-pill bottom-right sull'area vuota del footer
  const styleWithBadge: React.CSSProperties = badge
    ? { ...cardStyle, borderLeft: `3px solid ${badge.color}` }
    : cardStyle
  return (
    <Link href={`/event/${event.slug}`} style={styleWithBadge} className="hover-lift">
      {event.kind === 'binary' && <BinaryCard event={event} onBookmark={onBookmark} />}
      {event.kind === 'multi_outcome' && <MultiOutcomeCard event={event} onBookmark={onBookmark} />}
      {event.kind === 'multi_strike' && <MultiStrikeCard event={event} onBookmark={onBookmark} />}
      {event.kind === 'h2h_sport' && <H2HCard event={event} onBookmark={onBookmark} />}
      {event.kind === 'crypto_up_down' && <CryptoCard event={event} onBookmark={onBookmark} />}
      {badge && (
        <span
          aria-label={badge.label}
          title={badge.label}
          style={{
            position: 'absolute',
            bottom: 6,
            right: 8,
            zIndex: 3,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 7px',
            borderRadius: 'var(--radius-full)',
            background: badge.color,
            color: '#fff',
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            lineHeight: 1,
            pointerEvents: 'none',
          }}
        >
          {badge.live && (
            <span
              className="live-dot"
              style={{
                display: 'inline-block',
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: '#fff',
              }}
            />
          )}
          {badge.label}
        </span>
      )}
    </Link>
  )
}
