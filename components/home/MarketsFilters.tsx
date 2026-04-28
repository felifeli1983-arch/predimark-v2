'use client'

import { useEffect, useRef, useState } from 'react'
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

const RELATED_TAGS = [
  { slug: 'all', label: 'All' },
  { slug: 'trending', label: 'Trending' },
  { slug: 'breaking', label: 'Breaking' },
  { slug: 'politics', label: 'Politics' },
  { slug: 'crypto', label: 'Crypto' },
  { slug: 'nfl', label: 'NFL' },
  { slug: 'gpt-5', label: 'GPT-5' },
] as const

const SEARCH_DEBOUNCE_MS = 300

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
  const activeTag = searchParams.get('tag') ?? 'all'
  const initialQuery = searchParams.get('q') ?? ''
  const { animationsEnabled, setAnimationsEnabled } = useThemeStore()

  // Debounce locale per il search input
  const [queryInput, setQueryInput] = useState(initialQuery)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function setParam(key: string, value: string, defaultValue: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === defaultValue || !value) params.delete(key)
    else params.set(key, value)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  // Push debounced del search query
  useEffect(() => {
    if (queryInput === initialQuery) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (queryInput.trim()) params.set('q', queryInput.trim())
      else params.delete('q')
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    }, SEARCH_DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [queryInput, initialQuery, pathname, router, searchParams])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '12px 16px 0',
      }}
    >
      {/* PRIMA RIGA: titolo + filtri */}
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
            fontSize: 'var(--font-md)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            textTransform: 'capitalize',
          }}
        >
          {category === 'all' ? 'All markets' : category.replace(/-/g, ' ')}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button
            type="button"
            aria-label="Filtri avanzati"
            title="Filtri avanzati (in arrivo)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '4px 10px',
              fontSize: 'var(--font-sm)',
              cursor: 'pointer',
            }}
          >
            <SlidersHorizontal size={12} />
            Filters
          </button>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '4px 8px',
              minWidth: 180,
            }}
          >
            <Search size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
            <input
              type="search"
              placeholder="Search markets…"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-sm)',
                width: '100%',
                minWidth: 0,
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => setAnimationsEnabled(!animationsEnabled)}
            aria-label={animationsEnabled ? 'Disattiva animazioni' : 'Attiva animazioni'}
            title={animationsEnabled ? 'Animations: on' : 'Animations: off'}
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-subtle)',
              color: animationsEnabled ? 'var(--color-cta)' : 'var(--color-text-muted)',
              borderRadius: 'var(--radius-md)',
              padding: '4px 8px',
              fontSize: 'var(--font-sm)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {animationsEnabled ? <Zap size={12} /> : <ZapOff size={12} />}
          </button>

          <label style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
            Sort
          </label>
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value, 'volume24h')}
            style={{
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '4px 8px',
              fontSize: 'var(--font-sm)',
              cursor: 'pointer',
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div
            style={{
              display: 'flex',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 2,
            }}
          >
            <button
              type="button"
              onClick={() => onLayoutChange('grid')}
              aria-label="Grid layout"
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
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
                borderRadius: 'var(--radius-sm)',
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

      {/* SECONDA RIGA: sub-filtri Related (tag scrollabili) */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          paddingBottom: 4,
        }}
      >
        {RELATED_TAGS.map((tag) => {
          const isActive = activeTag === tag.slug
          return (
            <button
              key={tag.slug}
              type="button"
              onClick={() => setParam('tag', tag.slug, 'all')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-sm)',
                fontWeight: isActive ? 600 : 500,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                flexShrink: 0,
                background: isActive ? 'var(--color-cta-bg)' : 'transparent',
                color: isActive ? 'var(--color-cta)' : 'var(--color-text-muted)',
                border: isActive
                  ? '1px solid var(--color-cta)'
                  : '1px solid var(--color-border-subtle)',
                transition: 'background 150ms, color 150ms',
              }}
            >
              {tag.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
