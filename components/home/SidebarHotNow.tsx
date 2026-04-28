import { Flame } from 'lucide-react'

const HOT_TAGS = [
  'Elections 2028',
  'BTC',
  'NBA',
  'AI',
  'Champions League',
  'Bitcoin Halving',
  'NFL',
  'Crypto regulation',
]

export function SidebarHotNow() {
  return (
    <section
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Flame size={14} style={{ color: 'var(--color-hot)' }} />
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
          Hot Now
        </h3>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {HOT_TAGS.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: 'var(--font-xs)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-subtle)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            #{tag}
          </span>
        ))}
      </div>
    </section>
  )
}
