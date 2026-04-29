'use client'

import { useState } from 'react'
import { Bookmark, Share2, Code2 } from 'lucide-react'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'

export function LiveBadge() {
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

export function formatLong(date: Date): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function EventActions({ event }: { event: AuktoraEvent }) {
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
