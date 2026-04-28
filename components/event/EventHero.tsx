'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Flame, Bookmark, Share2, Code2 } from 'lucide-react'
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

function LiveBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        padding: '2px var(--space-2)',
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-danger-bg)',
        color: 'var(--color-danger)',
        fontSize: 'var(--font-xs)',
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

function EventActions({ event }: { event: AuktoraEvent }) {
  const [bookmarked, setBookmarked] = useState(false)
  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: event.title, url })
      } else {
        await navigator.clipboard?.writeText(url)
      }
    } catch {
      /* utente ha cancellato share o clipboard non disponibile */
    }
  }
  function handleEmbed() {
    const code = `<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/event/${event.slug}" width="600" height="500" frameborder="0"></iframe>`
    try {
      navigator.clipboard?.writeText(code)
    } catch {
      /* clipboard non disponibile */
    }
  }
  return (
    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
      <ActionIcon label="Embed" onClick={handleEmbed} icon={<Code2 size={14} />} />
      <ActionIcon label="Condividi" onClick={handleShare} icon={<Share2 size={14} />} />
      <ActionIcon
        label={bookmarked ? 'Rimuovi bookmark' : 'Salva'}
        onClick={() => setBookmarked((v) => !v)}
        icon={
          <Bookmark
            size={14}
            fill={bookmarked ? 'var(--color-warning)' : 'none'}
            stroke={bookmarked ? 'var(--color-warning)' : 'currentColor'}
          />
        }
      />
    </div>
  )
}

function ActionIcon({
  label,
  onClick,
  icon,
}: {
  label: string
  onClick: () => void
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        background: 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--color-text-muted)',
        cursor: 'pointer',
      }}
    >
      {icon}
    </button>
  )
}
