'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { LayoutGrid, List, Search, SlidersHorizontal, Zap, ZapOff } from 'lucide-react'
import { useThemeStore } from '@/lib/stores/themeStore'

const SORT_OPTIONS = [
  { value: 'volume24h', label: 'Volume 24h' },
  { value: 'newest', label: 'Newest' },
  { value: 'closing-soon', label: 'Closing soon' },
  { value: 'trending', label: 'Trending' },
  { value: 'edge', label: 'Edge highest' },
] as const

interface Props {
  layout: 'grid' | 'list'
  onLayoutChange: (l: 'grid' | 'list') => void
}

export function MarketsFilters({ layout, onLayoutChange }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const sort = searchParams.get('sort') ?? 'volume24h'
  const category = searchParams.get('category') ?? 'all'
  const queryStr = searchParams.get('q') ?? ''
  const { animationsEnabled, setAnimationsEnabled } = useThemeStore()

  function setParam(key: string, value: string, defaultValue: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === defaultValue || !value) params.delete(key)
    else params.set(key, value)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '12px 16px 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            textTransform: 'capitalize',
          }}
        >
          {category === 'all' ? 'All markets' : category.replace(/-/g, ' ')}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Filters drawer button (stub) */}
          <button
            type="button"
            aria-label="Filtri avanzati"
            title="Filtri avanzati (in arrivo)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-text-secondary)',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <SlidersHorizontal size={12} />
            Filters
          </button>

          {/* Search markets — input mini */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 6,
              padding: '4px 8px',
              minWidth: 180,
            }}
          >
            <Search size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
            <input
              type="search"
              placeholder="Search markets…"
              defaultValue={queryStr}
              onChange={(e) => setParam('q', e.target.value, '')}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--color-text-primary)',
                fontSize: 12,
                width: '100%',
                minWidth: 0,
              }}
            />
          </div>

          {/* Animations toggle */}
          <button
            type="button"
            onClick={() => setAnimationsEnabled(!animationsEnabled)}
            aria-label={animationsEnabled ? 'Disattiva animazioni' : 'Attiva animazioni'}
            title={animationsEnabled ? 'Animations: on' : 'Animations: off'}
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-default)',
              color: animationsEnabled ? 'var(--color-cta)' : 'var(--color-text-muted)',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 12,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {animationsEnabled ? <Zap size={12} /> : <ZapOff size={12} />}
          </button>

          {/* Sort */}
          <label style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Sort</label>
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value, 'volume24h')}
            style={{
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Layout toggle */}
          <div
            style={{
              display: 'flex',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 6,
              padding: 2,
            }}
          >
            <button
              type="button"
              onClick={() => onLayoutChange('grid')}
              aria-label="Grid layout"
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                background: layout === 'grid' ? 'var(--color-bg-tertiary)' : 'transparent',
                border: 'none',
                color: layout === 'grid' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              onClick={() => onLayoutChange('list')}
              aria-label="List layout"
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                background: layout === 'list' ? 'var(--color-bg-tertiary)' : 'transparent',
                border: 'none',
                color: layout === 'list' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
