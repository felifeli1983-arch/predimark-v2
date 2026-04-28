'use client'

import { useRouter } from 'next/navigation'
import type { AuktoraEvent, AuktoraMarket } from '@/lib/polymarket/mappers'
import { EventCardHeader } from '../EventCardHeader'
import { EventCardFooter } from '../EventCardFooter'
import { StarToggle } from '../StarToggle'

const TOP_N = 3

interface Props {
  event: AuktoraEvent
  onBookmark?: (eventId: string) => void
}

/**
 * Label da mostrare nella riga outcome:
 * usa groupItemTitle (es. "Finland") se presente, altrimenti
 * fallback a market.question per retrocompatibilità.
 */
function outcomeLabel(market: AuktoraMarket): string {
  return market.groupItemTitle || market.question
}

export function MultiOutcomeCard({ event, onBookmark }: Props) {
  const router = useRouter()
  const sorted = [...event.markets].sort((a, b) => b.yesPrice - a.yesPrice)
  const top = sorted.slice(0, TOP_N)
  const remaining = sorted.length - top.length

  function navigateToEvent(marketId: string, side: 'yes' | 'no') {
    router.push(`/event/${event.slug}?market=${marketId}&side=${side}`)
  }

  return (
    <div className="flex flex-col" style={{ flex: 1 }}>
      <EventCardHeader
        title={event.title}
        image={event.image}
        tags={event.tags}
        onBookmark={onBookmark ? () => onBookmark(event.id) : undefined}
      />

      <div style={{ padding: '4px 12px 8px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {top.map((m) => (
          <OutcomeRow
            key={m.id}
            market={m}
            event={event}
            onYesClick={() => navigateToEvent(m.id, 'yes')}
            onNoClick={() => navigateToEvent(m.id, 'no')}
          />
        ))}
        {remaining > 0 && (
          <div
            style={{
              padding: '6px 0 2px',
              textAlign: 'center',
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            + {remaining} altri →
          </div>
        )}
      </div>

      <EventCardFooter volume={event.totalVolume} endDate={event.endDate} />
    </div>
  )
}

interface RowProps {
  market: AuktoraMarket
  event: AuktoraEvent
  onYesClick: () => void
  onNoClick: () => void
}

function OutcomeRow({ market, event, onYesClick, onNoClick }: RowProps) {
  const pct = Math.round(market.yesPrice * 100)
  const label = outcomeLabel(market)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 0',
      }}
    >
      <StarToggle
        payload={{
          polymarketMarketId: market.id,
          polymarketEventId: event.id,
          slug: event.slug,
          title: `${event.title} — ${label}`,
          cardKind: event.kind,
          category: event.tags[0] ?? 'general',
          image: event.image,
          currentYesPrice: market.yesPrice,
        }}
        marketLabel={label}
        size={12}
      />
      <span
        style={{
          flex: 1,
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-secondary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 'var(--font-sm)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          minWidth: 30,
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          flexShrink: 0,
        }}
      >
        {pct}%
      </span>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <MiniBtn label="Sì" variant="yes" onClick={onYesClick} />
        <MiniBtn label="No" variant="no" onClick={onNoClick} />
      </div>
    </div>
  )
}

function MiniBtn({
  label,
  variant,
  onClick,
}: {
  label: string
  variant: 'yes' | 'no'
  onClick: () => void
}) {
  const isYes = variant === 'yes'
  return (
    <button
      type="button"
      className={`btn-trade ${isYes ? 'btn-trade-yes' : 'btn-trade-no'}`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      style={{
        padding: '3px 8px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--font-xs)',
        fontWeight: 700,
        letterSpacing: '0.04em',
      }}
    >
      {label}
    </button>
  )
}
