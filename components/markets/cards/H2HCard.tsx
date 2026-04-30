'use client'

import { useRouter } from 'next/navigation'
import type { AuktoraEvent, AuktoraOutcome } from '@/lib/polymarket/mappers'
import { useLiveMidpoint } from '@/lib/ws/hooks/useLiveMidpoint'
import { EventCardHeader } from '../EventCardHeader'
import { EventCardFooter } from '../EventCardFooter'
import { StarToggle } from '../StarToggle'

interface Props {
  event: AuktoraEvent
  onBookmark?: (eventId: string) => void
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

export function H2HCard({ event, onBookmark }: Props) {
  const router = useRouter()
  const market = event.markets[0]
  // Live midpoint sull'asset Yes (= teamA outcome) → quando arriva un trade,
  // ricalcoliamo le probabilità di entrambi i team applicando il delta proporz.
  // Per H2H "outcome A vs B" in single market, midpoint del primo outcome
  // = prob A; prob B = 1 - prob A. Per market 3-way con draw è una
  // semplificazione (non perfetta), ma meglio di prob statiche.
  const { midpoint } = useLiveMidpoint(market?.clobTokenIds?.[0] ?? null)
  const baseOutcomes = market?.outcomes ?? []
  const outcomes: AuktoraOutcome[] = midpoint !== null && baseOutcomes.length === 2
    ? [
        { ...baseOutcomes[0]!, price: midpoint },
        { ...baseOutcomes[1]!, price: 1 - midpoint },
      ]
    : baseOutcomes
  const { teamA, teamB, draw } = resolveOutcomes(outcomes)

  const isLive = event.active && !event.closed
  const marketId = market?.id ?? ''

  function navigateToEvent(outcomeName: string) {
    if (!marketId) return
    router.push(`/event/${event.slug}?market=${marketId}&side=${encodeURIComponent(outcomeName)}`)
  }

  return (
    <div className="flex flex-col" style={{ flex: 1 }}>
      <EventCardHeader
        title={event.title}
        image={event.image}
        tags={event.tags}
        isLive={isLive}
        onBookmark={onBookmark ? () => onBookmark(event.id) : undefined}
        starSlot={
          marketId ? (
            <StarToggle
              payload={{
                polymarketMarketId: marketId,
                polymarketEventId: event.id,
                slug: event.slug,
                title: event.title,
                cardKind: event.kind,
                category: event.tags[0] ?? 'general',
                image: event.image,
                currentYesPrice: market?.yesPrice,
              }}
              marketLabel={event.title}
            />
          ) : undefined
        }
      />

      <div
        style={{
          padding: '8px 12px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          justifyContent: 'center',
        }}
      >
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
            onClick={teamA ? () => navigateToEvent(teamA.name) : undefined}
          />
          {draw && (
            <TeamButton outcome={draw} variant="muted" onClick={() => navigateToEvent(draw.name)} />
          )}
          <TeamButton
            outcome={teamB}
            onClick={teamB ? () => navigateToEvent(teamB.name) : undefined}
          />
        </div>
      </div>

      <EventCardFooter volume={event.totalVolume} endDate={event.endDate} />
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
          fontSize: 'var(--font-base)',
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
          fontSize: 'var(--font-sm)',
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

  const buttonClass = isMuted
    ? 'btn-trade btn-trade-team'
    : isFavorite
      ? 'btn-trade btn-trade-team-favorite'
      : 'btn-trade btn-trade-team'

  return (
    <button
      type="button"
      className={buttonClass}
      onClick={(e) => {
        if (!onClick) return
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      style={{
        flex: 1,
        padding: '8px 10px',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-sm)',
        fontWeight: 600,
        cursor: onClick ? 'pointer' : 'default',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {outcome.name}
    </button>
  )
}
