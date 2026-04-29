'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Flame } from 'lucide-react'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'
import { LiveBadge, EventActions, formatLong } from './HeroCommon'

interface Props {
  event: AuktoraEvent
}

export function HeroDefault({ event }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const initial = event.title?.[0]?.toUpperCase() ?? '?'
  const isLive = event.active && !event.closed
  const visibleTags = event.tags.slice(0, 3)

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-4)',
        padding: 'var(--space-4)',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          flexShrink: 0,
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: 'var(--color-bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-secondary)',
          fontWeight: 700,
          fontSize: 'var(--font-xl)',
        }}
      >
        {!imgFailed && event.image ? (
          <Image
            src={event.image}
            alt=""
            width={64}
            height={64}
            onError={() => setImgFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          initial
        )}
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
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
            {visibleTags.map((tag) => (
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

        <h1
          style={{
            margin: 0,
            fontSize: 'var(--font-xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            lineHeight: 1.25,
            wordBreak: 'break-word',
          }}
        >
          {event.title}
        </h1>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Flame size={11} />
            {event.commentCount} commenti
          </span>
          <span>·</span>
          <span>Closes {formatLong(event.endDate)}</span>
        </div>
      </div>
    </header>
  )
}
