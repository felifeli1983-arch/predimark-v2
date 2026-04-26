'use client'

import type { AuktoraEvent, AuktoraMarket } from '@/lib/polymarket/mappers'
import { EventCardHeader } from '../EventCardHeader'
import { EventCardFooter } from '../EventCardFooter'

const TOP_N = 4

interface Props {
  event: AuktoraEvent
  onBookmark?: (eventId: string) => void
  onAddToSlip?: (eventId: string, outcomeId: string) => void
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

export function MultiStrikeCard({ event, onBookmark, onAddToSlip }: Props) {
  const sorted = [...event.markets].sort(compareStrikes)
  const top = sorted.slice(0, TOP_N)
  const remaining = sorted.length - top.length

  // Soglia "corrente": la più alta con prob > 50%
  const currentIndex = top.findIndex((m) => m.yesPrice > 0.5)

  return (
    <div className="flex flex-col" style={{ flex: 1 }}>
      <EventCardHeader
        title={event.title}
        image={event.image}
        tags={event.tags}
        onBookmark={onBookmark ? () => onBookmark(event.id) : undefined}
      />

      <div style={{ padding: '4px 12px 8px', flex: 1 }}>
        {top.map((m, i) => (
          <StrikeRow
            key={m.id}
            market={m}
            highlighted={i === currentIndex}
            onClick={onAddToSlip ? () => onAddToSlip(event.id, m.id) : undefined}
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

      <EventCardFooter
        volume={event.totalVolume}
        endDate={event.endDate}
        showEndDate={false}
        onAddToSlip={onAddToSlip && top[0] ? () => onAddToSlip(event.id, top[0]!.id) : undefined}
      />
    </div>
  )
}

function StrikeRow({
  market,
  highlighted,
  onClick,
}: {
  market: AuktoraMarket
  highlighted: boolean
  onClick?: () => void
}) {
  const pct = Math.round(market.yesPrice * 100)
  const isInteractive = Boolean(onClick)
  const labelColor = highlighted ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
  const barColor = highlighted ? 'var(--color-success)' : 'var(--color-cta)'

  return (
    <button
      type="button"
      onClick={(e) => {
        if (!onClick) return
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 0',
        background: 'none',
        border: 'none',
        cursor: isInteractive ? 'pointer' : 'default',
        textAlign: 'left',
      }}
    >
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
      <div
        style={{
          width: 80,
          height: 4,
          background: 'var(--color-bg-tertiary)',
          borderRadius: 2,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: barColor,
          }}
        />
      </div>
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
    </button>
  )
}
