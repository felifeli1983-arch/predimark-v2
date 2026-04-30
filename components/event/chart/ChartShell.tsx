'use client'

/** Shared building blocks per i chart event-page (sprint 3.5.5). */

export type Period = '1h' | '6h' | '1d' | '7d' | 'all'

export const PERIOD_OPTIONS: ReadonlyArray<{ value: Period; label: string }> = [
  { value: '1h', label: '1H' },
  { value: '6h', label: '6H' },
  { value: '1d', label: '1G' },
  { value: '7d', label: '7G' },
  { value: 'all', label: 'MAX' },
]

export interface PricePoint {
  timestamp: string
  yes_price: number
  no_price: number
}

export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      {children}
    </div>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        margin: 0,
        fontSize: 'var(--font-sm)',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </h3>
  )
}

export function CenteredBox({
  children,
  height = 320,
}: {
  children: React.ReactNode
  height?: number
}) {
  return (
    <div
      style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-1)',
      }}
    >
      {children}
    </div>
  )
}

export function PeriodTabs({
  period,
  onChange,
}: {
  period: Period
  onChange: (p: Period) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            padding: '4px 8px',
            background: period === opt.value ? 'var(--color-cta)' : 'var(--color-bg-tertiary)',
            color: period === opt.value ? '#fff' : 'var(--color-text-muted)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 9,
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
