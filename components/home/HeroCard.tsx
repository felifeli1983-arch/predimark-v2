'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'

const THEME_TOKEN: Record<string, string> = {
  sport: 'var(--color-cat-sport)',
  sports: 'var(--color-cat-sport)',
  politics: 'var(--color-cat-politics)',
  crypto: 'var(--color-cat-crypto)',
  culture: 'var(--color-cat-culture)',
  news: 'var(--color-cat-news)',
  geopolitics: 'var(--color-cat-geopolitics)',
  economy: 'var(--color-cat-economy)',
  business: 'var(--color-cat-economy)',
  tech: 'var(--color-cat-tech)',
  technology: 'var(--color-cat-tech)',
}

function pickAccent(tags: string[]): string {
  for (const tag of tags) {
    const t = tag.toLowerCase()
    for (const [hint, token] of Object.entries(THEME_TOKEN)) {
      if (t.includes(hint)) return token
    }
  }
  return 'var(--color-cta)'
}

interface Props {
  event: AuktoraEvent
  size?: 'big' | 'small'
}

export function HeroCard({ event, size = 'small' }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const accent = pickAccent(event.tags)
  const isBig = size === 'big'
  const market = event.markets[0]
  const yesPct = market ? Math.round(market.yesPrice * 100) : 50

  return (
    <Link
      href={`/event/${event.slug}`}
      className="hover-lift"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        height: isBig ? 240 : 200,
        borderRadius: 12,
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        background: `linear-gradient(135deg, ${accent} 0%, var(--color-bg-secondary) 90%)`,
        border: '1px solid var(--color-border-default)',
        cursor: 'pointer',
      }}
    >
      {!imgFailed && event.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.image}
          alt=""
          onError={() => setImgFailed(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.4,
            mixBlendMode: 'overlay',
          }}
        />
      )}
      {/* Overlay scuro per leggibilità testo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
        }}
      />
      <div style={{ position: 'relative', padding: '12px 16px 14px' }}>
        <h3
          style={{
            margin: 0,
            color: '#fff',
            fontSize: isBig ? 20 : 16,
            fontWeight: 700,
            lineHeight: 1.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.title}
        </h3>
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 13,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          {market && (
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
              Yes {yesPct}%
            </span>
          )}
          <span style={{ fontSize: 11, opacity: 0.7 }}>
            ${(event.totalVolume / 1_000_000).toFixed(1)}M Vol
          </span>
        </div>
      </div>
    </Link>
  )
}
