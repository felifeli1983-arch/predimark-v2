'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { AuktoraEvent, AuktoraOutcome } from '@/lib/polymarket/mappers'
import { LiveBadge, EventActions, formatLong } from './HeroCommon'
import { OpenInterestBadge } from '../OpenInterestBadge'

interface Props {
  event: AuktoraEvent
}

const DRAW_HINTS = ['draw', 'tie', 'pareggio']

function isDrawOutcome(name: string): boolean {
  if (!name) return false
  const n = name.toLowerCase()
  return DRAW_HINTS.some((h) => n.includes(h))
}

function resolveTeams(outcomes: AuktoraOutcome[]): {
  teamA: AuktoraOutcome | undefined
  teamB: AuktoraOutcome | undefined
} {
  if (outcomes.length === 0) return { teamA: undefined, teamB: undefined }
  const drawIdx = outcomes.findIndex((o) => isDrawOutcome(o.name))
  if (drawIdx === -1) return { teamA: outcomes[0], teamB: outcomes[1] }
  const teams = outcomes.filter((_, i) => i !== drawIdx)
  return { teamA: teams[0], teamB: teams[1] }
}

export function HeroH2H({ event }: Props) {
  const isLive = event.active && !event.closed
  const market = event.markets[0]
  const outcomes = market?.outcomes ?? []
  const { teamA, teamB } = resolveTeams(outcomes)

  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            flexWrap: 'wrap',
          }}
        >
          {isLive && <LiveBadge />}
          {event.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              style={{
                padding: '2px var(--space-2)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-xs)',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                background: 'var(--color-bg-tertiary)',
                textTransform: 'capitalize',
                letterSpacing: '0.04em',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <EventActions event={event} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 'var(--space-3)',
          alignItems: 'center',
        }}
      >
        <TeamBlock team={teamA} eventImage={event.image} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-1)',
          }}
        >
          <span
            style={{
              fontSize: 'var(--font-xs)',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            VS
          </span>
          <span style={{ fontSize: 'var(--font-2xl)', color: 'var(--color-text-secondary)' }}>
            – : –
          </span>
          <span
            style={{
              fontSize: 9,
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              lineHeight: 1.3,
            }}
          >
            score live in MA6
          </span>
        </div>
        <TeamBlock team={teamB} eventImage={event.image} alignRight />
      </div>

      <h1
        style={{
          margin: 0,
          fontSize: 'var(--font-md)',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          lineHeight: 1.4,
          wordBreak: 'break-word',
          textAlign: 'center',
        }}
      >
        {event.title}
      </h1>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-3)',
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-muted)',
          flexWrap: 'wrap',
        }}
      >
        <span>
          <strong style={{ color: 'var(--color-text-secondary)' }}>
            ${(event.totalVolume / 1_000_000).toFixed(1)}M
          </strong>{' '}
          Vol
        </span>
        <span>·</span>
        <OpenInterestBadge conditionId={event.markets[0]?.conditionId} />
        <span>·</span>
        <span>Closes {formatLong(event.endDate)}</span>
      </div>
    </header>
  )
}

function TeamBlock({
  team,
  eventImage,
  alignRight,
}: {
  team: AuktoraOutcome | undefined
  eventImage: string
  alignRight?: boolean
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const name = team?.name ?? '—'
  const initial = name[0]?.toUpperCase() ?? '?'
  const probability = team?.price != null ? Math.round(team.price * 100) : null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: alignRight ? 'flex-end' : 'flex-start',
        gap: 'var(--space-1)',
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          background: 'var(--color-bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-secondary)',
          fontWeight: 700,
          fontSize: 'var(--font-lg)',
        }}
      >
        {!imgFailed && eventImage ? (
          <Image
            src={eventImage}
            alt={name}
            width={56}
            height={56}
            onError={() => setImgFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          initial
        )}
      </div>
      <strong
        style={{
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-primary)',
          textAlign: alignRight ? 'right' : 'left',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
        }}
      >
        {name}
      </strong>
      {probability !== null && (
        <span
          style={{
            fontSize: 'var(--font-xs)',
            fontWeight: 700,
            color: 'var(--color-cta)',
            letterSpacing: '0.04em',
          }}
        >
          {probability}%
        </span>
      )}
    </div>
  )
}
