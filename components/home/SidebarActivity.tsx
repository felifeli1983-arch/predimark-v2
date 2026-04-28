'use client'

import { Activity } from 'lucide-react'
import { useLiveActivity } from '@/lib/ws/hooks/useLiveActivity'

function formatRelativeTime(iso: string): string {
  if (!iso) return ''
  const ts = new Date(iso).getTime()
  if (!Number.isFinite(ts)) return ''
  const diff = Date.now() - ts
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m`
  const hr = Math.floor(min / 60)
  return `${hr}h`
}

function shortAddress(addr: string): string {
  if (!addr) return 'Anon'
  if (addr.length < 12) return addr
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`
}

export function SidebarActivity() {
  const items = useLiveActivity({ limit: 5 })

  return (
    <section
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Activity size={14} style={{ color: 'var(--color-text-secondary)' }} />
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
          Activity
        </h3>
      </div>
      {items.length === 0 ? (
        <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
          In attesa di trade live…
        </p>
      ) : (
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {items.map((it, i) => (
            <li
              key={`${it.timestamp}-${i}`}
              style={{
                fontSize: 'var(--font-xs)',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 6,
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>
                  {shortAddress(it.user)}
                </strong>{' '}
                <span
                  style={{
                    color: it.side === 'BUY' ? 'var(--color-success)' : 'var(--color-danger)',
                  }}
                >
                  {it.side === 'BUY' ? '↗' : '↘'} ${Math.round(it.amount)}
                </span>{' '}
                {it.outcome}
              </span>
              <span style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
                {formatRelativeTime(it.timestamp)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
