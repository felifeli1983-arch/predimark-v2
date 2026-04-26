'use client'

import { Wallet } from 'lucide-react'

/**
 * Stub: in MA5 leggerà i dati reali del portfolio utente da Supabase.
 * Per ora mostra valori placeholder $0.00.
 */
export function SidebarPortfolio() {
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
        <Wallet size={14} style={{ color: 'var(--color-cta)' }} />
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
          Portfolio
        </h3>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Total</span>
        <strong
          style={{
            fontSize: 13,
            color: 'var(--color-text-primary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          $0.00
        </strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Cash</span>
        <strong
          style={{
            fontSize: 13,
            color: 'var(--color-text-primary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          $0.00
        </strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>P&amp;L 24h</span>
        <strong
          style={{
            fontSize: 13,
            color: 'var(--color-text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          —
        </strong>
      </div>
    </section>
  )
}
