'use client'

import { useRouter } from 'next/navigation'
import type { AuktoraEvent, AuktoraMarket } from '@/lib/polymarket/mappers'
import { EventCardHeader } from '../EventCardHeader'
import { EventCardFooter } from '../EventCardFooter'
import { StarToggle, watchlistStubToggle } from '../StarToggle'

const TOP_N = 4

interface Props {
  event: AuktoraEvent
  onBookmark?: (eventId: string) => void
}

const STRIKE_RX = /\$?([\d,]+(?:\.\d+)?)\s*([kKmMbB])?/

/** Estrae il valore numerico della soglia da una label tipo "Bitcoin ≥ $130,000" / "100k" / "$1.5M" */
function extractStrike(label: string): number | null {
  if (!label) return null
  const m = label.match(STRIKE_RX)
  if (!m || !m[1]) return null
  const num = parseFloat(m[1].replace(/,/g, ''))
  if (!Number.isFinite(num)) return null
  const suffix = m[2]?.toLowerCase()
  if (suffix === 'k') return num * 1_000
  if (suffix === 'm') return num * 1_000_000
  if (suffix === 'b') return num * 1_000_000_000
  return num
}

/** Sort: per strike desc; se uno strike è null, fondo lista */
function compareStrikes(a: AuktoraMarket, b: AuktoraMarket): number {
  const sa = extractStrike(a.question)
  const sb = extractStrike(b.question)
  if (sa === null && sb === null) return 0
  if (sa === null) return 1
  if (sb === null) return -1
  return sb - sa
}

export function MultiStrikeCard({ event, onBookmark }: Props) {
  const router = useRouter()
  const sorted = [...event.markets].sort(compareStrikes)
  const top = sorted.slice(0, TOP_N)
  const remaining = sorted.length - top.length

  // Soglia "corrente": la più alta con prob > 50%
  const currentIndex = top.findIndex((m) => m.yesPrice > 0.5)

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
        {top.map((m, i) => (
          <StrikeRow
            key={m.id}
            market={m}
            highlighted={i === currentIndex}
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
  highlighted: boolean
  onYesClick: () => void
  onNoClick: () => void
}

function StrikeRow({ market, highlighted, onYesClick, onNoClick }: RowProps) {
  const pct = Math.round(market.yesPrice * 100)
  const labelColor = highlighted ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'

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
        marketLabel={market.question}
        size={12}
      />
      <span
        style={{
          flex: 1,
          fontSize: 12,
          color: labelColor,
          fontWeight: highlighted ? 600 : 400,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
        }}
      >
        {market.question}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          minWidth: 32,
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          flexShrink: 0,
        }}
      >
        {pct}%
      </span>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <SideBtn label="Sì" variant="yes" onClick={onYesClick} />
        <SideBtn label="No" variant="no" onClick={onNoClick} />
      </div>
    </div>
  )
}

function SideBtn({
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
        borderRadius: 5,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.04em',
      }}
    >
      {label}
    </button>
  )
}
