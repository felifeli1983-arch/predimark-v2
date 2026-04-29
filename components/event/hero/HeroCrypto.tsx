'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Coins, Clock } from 'lucide-react'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'
import { useLiveMidpoint } from '@/lib/ws/hooks/useLiveMidpoint'
import { useCountdown } from '@/lib/hooks/useCountdown'
import { LiveBadge, EventActions, formatLong } from './HeroCommon'

interface Props {
  event: AuktoraEvent
}

export function HeroCrypto({ event }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const initial = event.title?.[0]?.toUpperCase() ?? '?'
  const isLive = event.active && !event.closed
  const market = event.markets[0]
  const yesTokenId = market?.clobTokenIds?.[0] ?? null
  const { midpoint, change } = useLiveMidpoint(yesTokenId)
  const countdown = useCountdown(event.endDate)
  const imgSrc = event.icon || event.image

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
          borderRadius: 'var(--radius-full)',
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
        {!imgFailed && imgSrc ? (
          <Image
            src={imgSrc}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {isLive && <LiveBadge />}
            <span
              style={{
                padding: '2px var(--space-2)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-xs)',
                fontWeight: 600,
                color: 'var(--color-cta)',
                background: 'var(--color-bg-tertiary)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Coins size={11} /> Crypto
            </span>
          </div>
          <EventActions event={event} />
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 'var(--font-lg)',
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
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}
        >
          {midpoint !== null ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
              <strong
                style={{
                  fontSize: 'var(--font-xl)',
                  fontWeight: 800,
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                {(midpoint * 100).toFixed(1)}¢
              </strong>
              {change !== null && (
                <span
                  style={{
                    fontSize: 'var(--font-sm)',
                    fontWeight: 600,
                    color: change >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                  }}
                >
                  {change >= 0 ? '+' : ''}
                  {change.toFixed(2)}%
                </span>
              )}
            </div>
          ) : yesTokenId ? (
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
              Connessione WebSocket…
            </span>
          ) : null}

          {!countdown.expired && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 'var(--font-sm)',
                color: 'var(--color-text-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <Clock size={12} /> {countdown.display}
            </span>
          )}

          <span
            style={{
              fontSize: 'var(--font-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            ·
          </span>
          <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
            Closes {formatLong(event.endDate)}
          </span>
        </div>
      </div>
    </header>
  )
}
