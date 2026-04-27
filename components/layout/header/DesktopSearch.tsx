'use client'

import { Search } from 'lucide-react'

export function DesktopSearch() {
  return (
    <div
      className="hidden md:flex"
      style={{
        flex: 1,
        minWidth: 0,
        maxWidth: 'var(--layout-sidebar-width)',
        marginLeft: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-default)',
          borderRadius: '8px',
          padding: '6px 12px',
          cursor: 'text',
        }}
      >
        <Search size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Search markets…</span>
      </div>
    </div>
  )
}
