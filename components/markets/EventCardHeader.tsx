'use client'

import Image from 'next/image'
import { Bookmark, Flame } from 'lucide-react'
import { useState, type ReactNode } from 'react'

interface EventCardHeaderProps {
  title: string
  image: string
  tags: string[]
  isLive?: boolean
  isHot?: boolean
  isNew?: boolean
  isBookmarked?: boolean
  onBookmark?: () => void
  /** Slot opzionale per lo StarToggle (Polymarket-style) — appare in alto-destra accanto al bookmark */
  starSlot?: ReactNode
}

export function EventCardHeader({
  title,
  image,
  tags,
  isLive,
  isHot,
  isNew,
  isBookmarked,
  onBookmark,
  starSlot,
}: EventCardHeaderProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const initial = title?.[0]?.toUpperCase() ?? '?'
  const visibleTags = tags.slice(0, 2)

  return (
    <div
      style={{
        /* Altezza fissa: tutte le card hanno body che parte dalla stessa Y.
         * 80 = padding 12 top/bottom + slot 56 (titolo 2 righe + gap + tags). */
        height: 80,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Avatar/Image */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
          background: 'var(--color-bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-secondary)',
          fontWeight: 700,
          fontSize: 'var(--font-lg)',
        }}
      >
        {!imgFailed && image ? (
          <Image
            src={image}
            alt=""
            width={40}
            height={40}
            onError={() => setImgFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          initial
        )}
      </div>

      {/* Title + tags (categoria) — slot allineato a stessa Y in tutte le card */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          height: '100%',
        }}
      >
        <h3
          className="line-clamp-2"
          style={{
            margin: 0,
            fontSize: 'var(--font-md)',
            fontWeight: 600,
            lineHeight: 1.3,
            color: 'var(--color-text-primary)',
            wordBreak: 'break-word',
            overflow: 'hidden',
          }}
        >
          {title}
        </h3>
        {visibleTags.length > 0 && (
          <p
            style={{
              margin: 0,
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexShrink: 0,
            }}
          >
            {visibleTags.join(' · ')}
          </p>
        )}
      </div>

      {/* Badges + bookmark */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
        }}
      >
        {isLive && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 6px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              fontSize: 'var(--font-xs)',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            <span
              className="live-dot"
              style={{
                display: 'inline-block',
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: 'var(--color-danger)',
              }}
            />
            LIVE
          </span>
        )}
        {isHot && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              padding: '2px 6px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-hot)',
              fontSize: 'var(--font-xs)',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            <Flame size={10} />
            HOT
          </span>
        )}
        {isNew && (
          <span
            style={{
              padding: '2px 6px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-cta)',
              background: 'var(--color-cta-bg)',
              fontSize: 'var(--font-xs)',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            NEW
          </span>
        )}
        {starSlot}
        {onBookmark && (
          <button
            type="button"
            aria-label={isBookmarked ? 'Rimuovi dai preferiti' : 'Salva'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onBookmark()
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 4,
              cursor: 'pointer',
              color: isBookmarked ? 'var(--color-cta)' : 'var(--color-text-tertiary)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Bookmark size={16} fill={isBookmarked ? 'var(--color-cta)' : 'none'} />
          </button>
        )}
      </div>
    </div>
  )
}
