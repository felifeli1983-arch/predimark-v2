'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Flame } from 'lucide-react'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'

interface Props {
  event: AuktoraEvent
}

export function EventHero({ event }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const initial = event.title?.[0]?.toUpperCase() ?? '?'
  const isLive = event.active && !event.closed
  const visibleTags = event.tags.slice(0, 3)

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        padding: '16px',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 12,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          flexShrink: 0,
          borderRadius: 12,
          overflow: 'hidden',
          background: 'var(--color-bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-secondary)',
          fontWeight: 700,
          fontSize: 24,
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

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {isLive && <LiveBadge />}
          {visibleTags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: '2px 8px',
                borderRadius: 999,
                fontSize: 10,
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

        <h1
          style={{
            margin: 0,
            fontSize: 22,
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
            gap: 12,
            fontSize: 12,
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

function LiveBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 999,
        background: 'var(--color-danger-bg)',
        color: 'var(--color-danger)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.05em',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: 'var(--color-danger)',
          display: 'inline-block',
        }}
      />
      LIVE
    </span>
  )
}

function formatLong(date: Date): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
