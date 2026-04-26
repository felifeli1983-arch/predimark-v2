import { Newspaper } from 'lucide-react'

const PLACEHOLDER = [
  { title: 'Market awaits Fed decision', delta: '+4%' },
  { title: 'BTC hits new local high', delta: '+15%' },
  { title: 'NBA playoffs: Lakers favored', delta: '+1%' },
]

export function SidebarNews() {
  return (
    <section
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 10,
        padding: '12px 14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Newspaper size={14} style={{ color: 'var(--color-info)' }} />
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
          Latest News
        </h3>
      </div>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {PLACEHOLDER.map((item, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 8,
              alignItems: 'baseline',
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: 'var(--color-text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              {i + 1}. {item.title}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: item.delta.startsWith('+') ? 'var(--color-success)' : 'var(--color-danger)',
                fontVariantNumeric: 'tabular-nums',
                flexShrink: 0,
              }}
            >
              {item.delta}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
