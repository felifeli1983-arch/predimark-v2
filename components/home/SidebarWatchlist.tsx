import { Star } from 'lucide-react'

export function SidebarWatchlist() {
  return (
    <section
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 10,
        padding: '12px 14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Star size={14} style={{ color: 'var(--color-warning)' }} />
        <h3
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Watchlist
        </h3>
      </div>
      <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
        Click the star on any market to add it. La tua watchlist apparirà qui.
      </p>
    </section>
  )
}
