'use client'

import { Plus } from 'lucide-react'

interface EventCardFooterProps {
  volume: number
  endDate: Date | null
  onAddToSlip?: () => void
  showEndDate?: boolean
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000

export function formatVolume(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '$0'
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${Math.round(n)}`
}

export function formatEndDate(date: Date): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''
  const now = Date.now()
  const diff = date.getTime() - now
  // Past markets: don't surface a misleading "Closes <past-date>" — caller hides the row.
  if (diff < -ONE_DAY_MS) return ''
  if (diff < ONE_DAY_MS && diff > -ONE_DAY_MS) return 'Today'
  if (diff >= ONE_DAY_MS && diff < 2 * ONE_DAY_MS) return 'Tomorrow'
  if (diff > 0 && diff < 7 * ONE_DAY_MS) {
    const days = Math.ceil(diff / ONE_DAY_MS)
    return `in ${days} days`
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function EventCardFooter({
  volume,
  endDate,
  onAddToSlip,
  showEndDate = true,
}: EventCardFooterProps) {
  const dateLabel = endDate && showEndDate ? formatEndDate(endDate) : ''

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderTop: '1px solid var(--color-border-subtle)',
        gap: 12,
        marginTop: 'auto', // spinge il footer SEMPRE in fondo nella card flex-col
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: 'var(--color-text-muted)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <strong style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
          {formatVolume(volume)}
        </strong>{' '}
        Vol
        {dateLabel ? ` · Closes ${dateLabel}` : ''}
      </span>

      {onAddToSlip && (
        <button
          type="button"
          aria-label="Aggiungi a Slip"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onAddToSlip()
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-secondary)',
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Plus size={11} />
          Slip
        </button>
      )}
    </div>
  )
}
