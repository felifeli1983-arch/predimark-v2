'use client'

interface EventCardFooterProps {
  volume: number
  endDate: Date | null
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

export function EventCardFooter({ volume, endDate, showEndDate = true }: EventCardFooterProps) {
  const dateLabel = endDate && showEndDate ? formatEndDate(endDate) : ''

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '10px 12px',
        borderTop: '1px solid var(--color-border-subtle)',
        marginTop: 'auto', // spinge il footer SEMPRE in fondo nella card flex-col
        flexShrink: 0,
      }}
    >
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 'var(--font-xs)',
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
    </div>
  )
}
