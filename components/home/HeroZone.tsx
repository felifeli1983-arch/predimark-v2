'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'
import { HeroCard } from './HeroCard'

interface Props {
  events: AuktoraEvent[]
}

const MAX_DOTS = 5

/**
 * Hero zone (Doc 4 wireframe sezione "Hero zone desktop / mobile"):
 * - Desktop: Hero Big a sx (60%) ruota fra tutti gli events via activeIndex,
 *   2 hero piccole a dx (40%) mostrano i 2 events successivi.
 * - Mobile: carousel singolo scrollabile orizzontalmente con scroll-snap.
 *   IntersectionObserver sincronizza i pagination dots.
 * - Dots + frecce in basso (entrambi i layout).
 */
export function HeroZone({ events }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  // Mobile carousel: ref a ogni slide per IntersectionObserver
  const slideRefs = useRef<(HTMLLIElement | null)[]>([])
  const total = events.length

  useEffect(() => {
    if (total === 0) return
    const slides = slideRefs.current.filter(Boolean) as HTMLLIElement[]
    if (slides.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = Number(entry.target.getAttribute('data-index'))
            if (Number.isFinite(idx)) setActiveIndex(idx)
          }
        })
      },
      { threshold: [0.6] }
    )
    slides.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [total])

  if (total === 0) return null

  const safeIndex = ((activeIndex % total) + total) % total
  const big = events[safeIndex]
  const small1 = events[(safeIndex + 1) % total]
  const small2 = events[(safeIndex + 2) % total]
  const visibleCount = Math.min(MAX_DOTS, total)
  const visibleDots = Math.max(0, Math.min(MAX_DOTS, total))

  function goTo(i: number) {
    const next = ((i % total) + total) % total
    setActiveIndex(next)
    // Su mobile, scrolla anche il carousel alla slide corrispondente
    const slide = slideRefs.current[next]
    if (slide) slide.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }

  return (
    <div style={{ padding: '12px 16px 4px', position: 'relative' }}>
      {/* DESKTOP — grid 60% / 40% */}
      <div className="hidden md:grid md:grid-cols-[60%_40%]" style={{ gap: 12 }}>
        {big && <HeroCard event={big} size="big" />}
        {(small1 || small2) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {small1 && small1.id !== big?.id && <HeroCard event={small1} size="small" />}
            {small2 && small2.id !== big?.id && small2.id !== small1?.id && (
              <HeroCard event={small2} size="small" />
            )}
          </div>
        )}
      </div>

      {/* MOBILE — carousel scroll-snap */}
      <ul
        className="flex md:hidden"
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          gap: 12,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {events.map((ev, i) => (
          <li
            key={ev.id}
            data-index={i}
            ref={(el) => {
              slideRefs.current[i] = el
            }}
            style={{
              flexShrink: 0,
              width: '100%',
              scrollSnapAlign: 'start',
            }}
          >
            <HeroCard event={ev} size="big" />
          </li>
        ))}
      </ul>

      {/* DOTS + frecce — visibili su entrambi i layout */}
      {visibleDots > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '10px 0 4px',
          }}
        >
          <button
            type="button"
            onClick={() => goTo(safeIndex - 1)}
            aria-label="Hero precedente"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: visibleCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Vai a hero ${i + 1}`}
              onClick={() => goTo(i)}
              style={{
                width: i === safeIndex ? 18 : 6,
                height: 6,
                borderRadius: 'var(--radius-sm)',
                background:
                  i === safeIndex ? 'var(--color-text-secondary)' : 'var(--color-border-default)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 200ms, background 200ms',
              }}
            />
          ))}
          <button
            type="button"
            onClick={() => goTo(safeIndex + 1)}
            aria-label="Hero successivo"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
