'use client'

import { Wallet } from 'lucide-react'

interface Props {
  /**
   * - 'deposit-cta': utente loggato senza depositi → CTA Deposit prominente
   * - 'active': utente con saldo → mostra Total / Cash / P&L
   *
   * In MA5 i dati reali verranno collegati a Supabase.
   */
  mode?: 'deposit-cta' | 'active'
}

export function SidebarPortfolio({ mode = 'deposit-cta' }: Props) {
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

      {mode === 'deposit-cta' ? (
        <>
          <p
            style={{
              margin: '0 0 10px',
              fontSize: 12,
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
            }}
          >
            Deposit some cash to start betting.
          </p>
          <button
            type="button"
            style={{
              width: '100%',
              padding: '7px 12px',
              borderRadius: 7,
              background: 'var(--color-cta)',
              color: '#fff',
              border: 'none',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Deposit →
          </button>
        </>
      ) : (
        <>
          <Row label="Total" value="$0.00" />
          <Row label="Cash" value="$0.00" />
          <Row label="P&L 24h" value="—" muted />
        </>
      )}
    </section>
  )
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{label}</span>
      <strong
        style={{
          fontSize: 13,
          color: muted ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </strong>
    </div>
  )
}
