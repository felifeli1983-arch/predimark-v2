import { Zap } from 'lucide-react'

export function SidebarSignals() {
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
        <Zap size={14} style={{ color: 'var(--color-cta)' }} />
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
          Signals
        </h3>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-muted)',
          lineHeight: 1.5,
        }}
      >
        I segnali generati da Auktora arriveranno qui. Disponibili dopo MA4 (Trading Core).
      </p>
    </section>
  )
}
