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
  return (
    <Link href={`/event/${event.slug}`} style={cardStyle} className="hover-lift">
      {/* Stripe colorato 1px full-height in absolute, z-index 5 sopra
          all'image (z-index 1 in EventCardHeader). Era box-shadow inset
          ma veniva coperto dall'image flush top-left. */}
      {badge && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1,
            height: '100%',
            background: badge.color,
            zIndex: 5,
            pointerEvents: 'none',
          }}
        />
      )}
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
