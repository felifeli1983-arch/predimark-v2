'use client'

import type { AuktoraEvent, AuktoraOutcome } from '@/lib/polymarket/mappers'
import { EventCardHeader } from '../EventCardHeader'
import { EventCardFooter } from '../EventCardFooter'

interface Props {
  event: AuktoraEvent
  onBookmark?: (eventId: string) => void
  onAddToSlip?: (eventId: string, outcomeId: string) => void
}

const DRAW_HINTS = ['draw', 'tie', 'pareggio']

function isDrawOutcome(name: string): boolean {
  if (!name) return false
  const n = name.toLowerCase()
  return DRAW_HINTS.some((h) => n.includes(h))
}

interface ResolvedOutcomes {
  teamA: AuktoraOutcome | undefined
  teamB: AuktoraOutcome | undefined
  draw: AuktoraOutcome | undefined
}

/**
 * Risolve i 2 (o 3) outcome in teamA / teamB / draw.
 * Se uno dei nomi contiene "draw"/"tie"/"pareggio" → diventa il Draw,
 * gli altri due sono i team.
 */
function resolveOutcomes(outcomes: AuktoraOutcome[]): ResolvedOutcomes {
  if (outcomes.length === 0) return { teamA: undefined, teamB: undefined, draw: undefined }

  const drawIdx = outcomes.findIndex((o) => isDrawOutcome(o.name))
  if (drawIdx === -1) {
    return { teamA: outcomes[0], teamB: outcomes[1], draw: undefined }
  }

  const draw = outcomes[drawIdx]
  const teams = outcomes.filter((_, i) => i !== drawIdx)
  return { teamA: teams[0], teamB: teams[1], draw }
}

export function H2HCard({ event, onBookmark, onAddToSlip }: Props) {
  const market = event.markets[0]
  const outcomes = market?.outcomes ?? []
  const { teamA, teamB, draw } = resolveOutcomes(outcomes)

  const isLive = event.active && !event.closed
  const marketId = market?.id ?? ''

  return (
    <div className="flex flex-col">
      <EventCardHeader
        title={event.title}
        image={event.image}
        tags={event.tags}
        isLive={isLive}
        onBookmark={onBookmark ? () => onBookmark(event.id) : undefined}
      />

      <div style={{ padding: '8px 12px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Riga nomi + percentuali */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <TeamLabel outcome={teamA} align="left" />
          {draw && <TeamLabel outcome={draw} align="center" muted />}
          <TeamLabel outcome={teamB} align="right" />
        </div>

        {/* Riga bottoni */}
        <div style={{ display: 'flex', gap: 6 }}>
          <TeamButton
            outcome={teamA}
            onClick={onAddToSlip && teamA ? () => onAddToSlip(event.id, marketId) : undefined}
          />
          {draw && (
            <TeamButton
              outcome={draw}
              variant="muted"
              onClick={onAddToSlip ? () => onAddToSlip(event.id, marketId) : undefined}
            />
          )}
          <TeamButton
            outcome={teamB}
            onClick={onAddToSlip && teamB ? () => onAddToSlip(event.id, marketId) : undefined}
          />
        </div>
      </div>

      <EventCardFooter
        volume={event.totalVolume}
        endDate={event.endDate}
        onAddToSlip={onAddToSlip ? () => onAddToSlip(event.id, marketId) : undefined}
      />
    </div>
  )
}

function TeamLabel({
  outcome,
  align,
  muted,
}: {
  outcome: AuktoraOutcome | undefined
  align: 'left' | 'center' | 'right'
  muted?: boolean
}) {
  if (!outcome) return <div style={{ flex: 1 }} />
  const pct = Math.round(outcome.price * 100)
  const isFavorite = outcome.price > 0.5
  const nameColor = muted
    ? 'var(--color-text-muted)'
    : isFavorite
      ? 'var(--color-text-primary)'
      : 'var(--color-text-secondary)'
  const pctColor = muted
    ? 'var(--color-text-muted)'
    : isFavorite
      ? 'var(--color-success)'
      : 'var(--color-text-muted)'

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: isFavorite ? 600 : 500,
          color: nameColor,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
        }}
      >
        {outcome.name}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: pctColor,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {pct}%
      </span>
    </div>
  )
}

function TeamButton({
  outcome,
  onClick,
  variant,
}: {
  outcome: AuktoraOutcome | undefined
  onClick?: () => void
  variant?: 'muted'
}) {
  if (!outcome) return <div style={{ flex: 1 }} />
  const isFavorite = outcome.price > 0.5
  const isMuted = variant === 'muted'

  const bg = isMuted
    ? 'var(--color-bg-tertiary)'
    : isFavorite
      ? 'var(--color-success-bg)'
      : 'var(--color-bg-tertiary)'
  const fg = isMuted
    ? 'var(--color-text-secondary)'
    : isFavorite
      ? 'var(--color-success)'
      : 'var(--color-text-primary)'
  const border = isMuted
    ? 'var(--color-border-default)'
    : isFavorite
      ? 'var(--color-success)'
      : 'var(--color-border-default)'

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
        flex: 1,
        padding: '8px 10px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        cursor: onClick ? 'pointer' : 'default',
        background: bg,
        color: fg,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {outcome.name}
    </button>
  )
}
