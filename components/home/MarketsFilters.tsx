'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { LayoutGrid, List } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'volume24h', label: 'Volume 24h' },
  { value: 'newest', label: 'Newest' },
  { value: 'closing-soon', label: 'Closing soon' },
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

  function setSort(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'volume24h') params.delete('sort')
    else params.set('sort', value)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 16px 0',
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Sort by</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
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
  )
}
