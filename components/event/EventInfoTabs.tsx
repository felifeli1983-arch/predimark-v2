'use client'

import { useState } from 'react'
import { SidebarActivity } from '@/components/home/SidebarActivity'

type TabId = 'comments' | 'news' | 'holders' | 'activity'

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'comments', label: 'Comments' },
  { id: 'news', label: 'News' },
  { id: 'holders', label: 'Holders' },
  { id: 'activity', label: 'Activity' },
]

export function EventInfoTabs() {
  const [active, setActive] = useState<TabId>('comments')

  return (
    <section
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: 4,
          padding: '8px 8px 0',
          borderBottom: '1px solid var(--color-border-subtle)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {TABS.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px 8px 0 0',
                background: isActive ? 'var(--color-bg-tertiary)' : 'transparent',
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--color-cta)' : '2px solid transparent',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div style={{ padding: 16, minHeight: 140 }}>
        {active === 'comments' && <Placeholder text="Commenti in arrivo" />}
        {active === 'news' && <Placeholder text="News in arrivo" />}
        {active === 'holders' && <Placeholder text="Top holder in arrivo" />}
        {active === 'activity' && <SidebarActivity />}
      </div>
    </section>
  )
}

function Placeholder({ text }: { text: string }) {
  return (
    <p
      style={{
        margin: 0,
        color: 'var(--color-text-muted)',
        fontSize: 13,
        textAlign: 'center',
        padding: '32px 16px',
      }}
    >
      {text}
    </p>
  )
}
