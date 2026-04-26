'use client'

import type { AuktoraEvent, AuktoraMarket } from '@/lib/polymarket/mappers'
import { EventCardHeader } from '../EventCardHeader'
import { EventCardFooter } from '../EventCardFooter'

const TOP_N = 3

interface Props {
  event: AuktoraEvent
  onBookmark?: (eventId: string) => void
  onAddToSlip?: (eventId: string, outcomeId: string) => void
}

const MONTH_RX = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i
const ISO_RX = /\b(19|20)\d{2}-\d{2}(-\d{2})?\b/
const YEAR_RX = /\b(19|20)\d{2}\b/

/** Heuristic: true se la label sembra una data (variante 2b) */
function looksLikeDate(label: string): boolean {
  if (!label) return false
  return MONTH_RX.test(label) || ISO_RX.test(label) || YEAR_RX.test(label)
}

export function MultiOutcomeCard({ event, onBookmark, onAddToSlip }: Props) {
  const sorted = [...event.markets].sort((a, b) => b.yesPrice - a.yesPrice)
  const top = sorted.slice(0, TOP_N)
  const remaining = sorted.length - top.length

  // Variante 2b se la maggioranza dei top sembra date → nascondi endDate nel footer
  const dateLike = top.filter((m) => looksLikeDate(m.question)).length
  const isDateOutcomes = top.length > 0 && dateLike >= Math.ceil(top.length / 2)

  return (
    <div className="flex flex-col" style={{ flex: 1 }}>
      <EventCardHeader
        title={event.title}
        image={event.image}
        tags={event.tags}
        onBookmark={onBookmark ? () => onBookmark(event.id) : undefined}
      />

      <div style={{ padding: '4px 12px 8px', flex: 1 }}>
        {top.map((m) => (
          <OutcomeRow
            key={m.id}
            market={m}
            withYesNo={isDateOutcomes}
            onYesClick={onAddToSlip ? () => onAddToSlip(event.id, `${m.id}:yes`) : undefined}
            onNoClick={onAddToSlip ? () => onAddToSlip(event.id, `${m.id}:no`) : undefined}
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
        showEndDate={!isDateOutcomes}
        onAddToSlip={onAddToSlip && top[0] ? () => onAddToSlip(event.id, top[0]!.id) : undefined}
      />
    </div>
  )
}

interface RowProps {
  market: AuktoraMarket
  withYesNo: boolean
  onYesClick?: () => void
  onNoClick?: () => void
}

function OutcomeRow({ market, withYesNo, onYesClick, onNoClick }: RowProps) {
  const pct = Math.round(market.yesPrice * 100)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 0',
      }}
    >
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
        {market.question}
      </span>
      <div
        style={{
          width: 70,
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
            background: 'var(--color-cta)',
          }}
        />
      </div>
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
      {withYesNo && (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <MiniBtn label="Sì" variant="yes" onClick={onYesClick} />
          <MiniBtn label="No" variant="no" onClick={onNoClick} />
        </div>
      )}
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
  onClick?: () => void
}) {
  const isYes = variant === 'yes'
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
