'use client'

import { useRouter } from 'next/navigation'
import type { AuktoraEvent, AuktoraMarket } from '@/lib/polymarket/mappers'
import { EventCardHeader } from '../EventCardHeader'
import { EventCardFooter } from '../EventCardFooter'
import { StarToggle, watchlistStubToggle } from '../StarToggle'

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
            onYesClick={() => navigateToEvent(m.id, 'yes')}
            onNoClick={() => navigateToEvent(m.id, 'no')}
          />
        ))}
        {remaining > 0 && (
          <div
            style={{
              padding: '6px 0 2px',
              textAlign: 'center',
              fontSize: 11,
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
  onYesClick: () => void
  onNoClick: () => void
}

function OutcomeRow({ market, onYesClick, onNoClick }: RowProps) {
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
        isFavorite={false}
        onToggle={() => watchlistStubToggle(market.id)}
        marketLabel={label}
        size={12}
      />
      <span
        style={{
          flex: 1,
          fontSize: 12,
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
          fontSize: 12,
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
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      style={{
        padding: '3px 8px',
        borderRadius: 5,
        fontSize: 10,
        fontWeight: 700,
        cursor: 'pointer',
        background: isYes ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
        color: isYes ? 'var(--color-success)' : 'var(--color-danger)',
        border: `1px solid ${isYes ? 'var(--color-success)' : 'var(--color-danger)'}`,
        letterSpacing: '0.04em',
      }}
    >
      {label}
    </button>
  )
}
