'use client'

import { useState } from 'react'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'
import { EventActivity } from './EventActivity'

type TabId = 'activity' | 'comments' | 'news' | 'holders'

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'activity', label: 'Activity' },
  { id: 'comments', label: 'Comments' },
  { id: 'news', label: 'News' },
  { id: 'holders', label: 'Holders' },
]

interface Props {
  event: AuktoraEvent
}

export function EventInfoTabs({ event }: Props) {
  const [active, setActive] = useState<TabId>('activity')
  const conditionId = event.markets[0]?.conditionId ?? ''

  return (
    <section
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
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
                fontSize: 'var(--font-base)',
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
        {active === 'activity' && <EventActivity conditionId={conditionId} />}
        {active === 'comments' && (
          <Placeholder text="Feed commenti — integrazione provider Polymarket Comments in MA6." />
        )}
        {active === 'news' && (
          <Placeholder text="News aggregator — feed dedicato in MA6 (Decrypt, Coindesk, Reuters per categoria)." />
        )}
        {active === 'holders' && (
          <Placeholder text="Top holders — query positions on-chain per outcome, in MA6." />
        )}
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
        fontSize: 'var(--font-sm)',
        textAlign: 'center',
        padding: '32px 16px',
        lineHeight: 1.5,
      }}
    >
      {text}
    </p>
  )
}
