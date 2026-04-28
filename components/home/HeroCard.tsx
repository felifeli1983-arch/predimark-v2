'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
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

const CTA_BY_TAG: Record<string, string> = {
  sport: 'Games',
  sports: 'Games',
  politics: 'Dashboard',
  crypto: 'Markets',
  culture: 'Markets',
  news: 'Markets',
  geopolitics: 'Dashboard',
  economy: 'Markets',
  business: 'Markets',
  tech: 'Markets',
}

function pickAccent(tags: string[]): { color: string; cta: string } {
  for (const tag of tags) {
    const t = tag.toLowerCase()
    for (const [hint, token] of Object.entries(THEME_TOKEN)) {
      if (t.includes(hint)) return { color: token, cta: CTA_BY_TAG[hint] ?? 'Markets' }
    }
  }
  return { color: 'var(--color-cta)', cta: 'Markets' }
}

interface Props {
  event: AuktoraEvent
  size?: 'big' | 'small'
}

export function HeroCard({ event, size = 'small' }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const { color: accent, cta } = pickAccent(event.tags)
  const isBig = size === 'big'
  const market = event.markets[0]
  const yesPct = market ? Math.round(market.yesPrice * 100) : 50
  const subtitle = market?.question && market.question !== event.title ? market.question : null

  return (
    <Link
      href={`/event/${event.slug}`}
      className="hover-lift"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        height: isBig ? 320 : 152,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        background: `linear-gradient(135deg, ${accent} 0%, var(--color-bg-secondary) 90%)`,
        border: '1px solid var(--color-border-subtle)',
        cursor: 'pointer',
      }}
    >
      {!imgFailed && event.image && (
        <Image
          src={event.image}
          alt=""
          fill
          priority={isBig}
          sizes={isBig ? '(max-width: 1024px) 100vw, 60vw' : '(max-width: 1024px) 100vw, 40vw'}
          onError={() => setImgFailed(true)}
          style={{
            objectFit: 'cover',
            opacity: 0.45,
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
            'linear-gradient(0deg, var(--color-hero-overlay-strong) 0%, var(--color-hero-overlay-soft) 55%, transparent 100%)',
        }}
      />
      <div style={{ position: 'relative', padding: isBig ? '20px 22px' : '12px 14px' }}>
        <h3
          style={{
            margin: 0,
            color: 'var(--color-text-on-image)',
            fontSize: isBig ? 26 : 15,
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            display: '-webkit-box',
            WebkitLineClamp: isBig ? 2 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.title}
        </h3>
        {isBig && subtitle && (
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 'var(--font-base)',
              fontWeight: 400,
              color: 'var(--color-text-on-image-muted)',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {subtitle}
          </p>
        )}
        <div
          style={{
            marginTop: isBig ? 14 : 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {market && (
              <span
                style={{
                  fontSize: isBig ? 14 : 12,
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 700,
                  color: 'var(--color-text-on-image)',
                }}
              >
                Yes {yesPct}%
              </span>
            )}
            <span style={{ fontSize: isBig ? 12 : 10, color: 'var(--color-text-on-image-faint)' }}>
              ${(event.totalVolume / 1_000_000).toFixed(1)}M Vol
            </span>
          </div>
          {isBig && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 'var(--font-sm)',
                fontWeight: 600,
                color: 'var(--color-text-on-image)',
                background: 'var(--color-hero-cta-bg)',
                backdropFilter: 'blur(4px)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {cta}
              <ArrowRight size={12} />
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
