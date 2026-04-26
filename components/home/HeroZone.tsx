'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'
import { HeroCard } from './HeroCard'

interface Props {
  events: AuktoraEvent[]
}

/**
 * Hero zone (Doc 4 wireframe sezione "Hero zone desktop 60% sx + 40% dx"):
 * - Desktop: 1 hero big a sx + 2 hero small impilate a dx
 * - Mobile: stack verticale
 * - Pagination dots + frecce per ruotare il "set" di 3 hero
 */
export function HeroZone({ events }: Props) {
  const [pageIndex, setPageIndex] = useState(0)
  if (events.length === 0) return null

  // Suddividi in pagine da 3 hero (1 big + 2 small)
  const PAGE_SIZE = 3
  const totalPages = Math.max(1, Math.ceil(events.length / PAGE_SIZE))
  const safePageIndex = Math.min(pageIndex, totalPages - 1)
  const start = safePageIndex * PAGE_SIZE
  const slice = events.slice(start, start + PAGE_SIZE)
  const big = slice[0]
  const smalls = slice.slice(1, 3)

  return (
    <div style={{ padding: '12px 16px 4px', position: 'relative' }}>
      <div className="grid grid-cols-1 md:grid-cols-[60%_40%]" style={{ gap: 12 }}>
        {big && <HeroCard event={big} size="big" />}
        {smalls.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {smalls.map((event) => (
              <HeroCard key={event.id} event={event} size="small" />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
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
            onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
            disabled={safePageIndex === 0}
            aria-label="Hero precedente"
            style={{
              background: 'none',
              border: 'none',
              color:
                safePageIndex === 0 ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
              cursor: safePageIndex === 0 ? 'not-allowed' : 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Vai a pagina ${i + 1}`}
              onClick={() => setPageIndex(i)}
              style={{
                width: i === safePageIndex ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background:
                  i === safePageIndex
                    ? 'var(--color-text-secondary)'
                    : 'var(--color-border-default)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 200ms, background 200ms',
              }}
            />
          ))}
          <button
            type="button"
            onClick={() => setPageIndex((i) => Math.min(totalPages - 1, i + 1))}
            disabled={safePageIndex === totalPages - 1}
            aria-label="Hero successivo"
            style={{
              background: 'none',
              border: 'none',
              color:
                safePageIndex === totalPages - 1
                  ? 'var(--color-text-muted)'
                  : 'var(--color-text-secondary)',
              cursor: safePageIndex === totalPages - 1 ? 'not-allowed' : 'pointer',
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
