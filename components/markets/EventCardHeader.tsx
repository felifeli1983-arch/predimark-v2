'use client'

import { Bookmark, Flame } from 'lucide-react'
import { useState } from 'react'

interface EventCardHeaderProps {
  title: string
  /** Descrizione/contesto del mercato — riempie le righe non usate dal titolo. */
  subtitle?: string | null
  image: string
  tags: string[]
  isLive?: boolean
  isHot?: boolean
  isNew?: boolean
  isBookmarked?: boolean
  onBookmark?: () => void
}

export function EventCardHeader({
  title,
  subtitle,
  image,
  tags,
  isLive,
  isHot,
  isNew,
  isBookmarked,
  onBookmark,
}: EventCardHeaderProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const initial = title?.[0]?.toUpperCase() ?? '?'
  const visibleTags = tags.slice(0, 2)
  const hasSubtitle = Boolean(subtitle && subtitle.trim() && subtitle !== title)

  return (
    <div
      style={{
        /* Altezza fissa header: body delle 5 variants parte dalla stessa Y.
         * 110 = padding 12 + slot 86 (titolo+sub combinati = 4 righe @14/12px + tags + gaps). */
        height: 110,
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
          fontSize: 16,
        }}
      >
        {!imgFailed && image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            onError={() => setImgFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          initial
        )}
      </div>

      {/* Title + subtitle + tags
       * Layout: title (1-2 righe naturali) → subtitle (flex:1, line-clamp-3
       * riempie spazio residuo, troncato se eccede) → tags fissi in fondo.
       * Comportamento: titolo 1 riga → subtitle può espandersi a 3 righe;
       * titolo 2 righe → subtitle resta a 1-2 righe per non sforare l'header. */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          height: '100%',
        }}
      >
        <h3
          className="line-clamp-2"
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.3,
            color: 'var(--color-text-primary)',
            wordBreak: 'break-word',
            overflow: 'hidden',
          }}
        >
          {title}
        </h3>
        {hasSubtitle && (
          <p
            className="line-clamp-3"
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 400,
              lineHeight: 1.4,
              color: 'var(--color-text-secondary)',
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              wordBreak: 'break-word',
            }}
          >
            {subtitle}
          </p>
        )}
        {visibleTags.length > 0 && (
          <p
            style={{
              margin: '2px 0 0',
              fontSize: 11,
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
              borderRadius: 999,
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              fontSize: 10,
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
              borderRadius: 999,
              color: 'var(--color-hot)',
              fontSize: 10,
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
              borderRadius: 999,
              color: 'var(--color-cta)',
              background: 'var(--color-cta-bg)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            NEW
          </span>
        )}
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
