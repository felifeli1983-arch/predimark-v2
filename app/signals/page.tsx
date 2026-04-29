import { SignalsView } from '@/components/signals/SignalsView'

export const metadata = {
  title: 'Signal AI',
  description: 'Raccomandazioni AI gratuite su mercati Polymarket sottovalutati',
}

export default function SignalsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 'var(--space-3)' }}>
      <header>
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--font-2xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          Signal AI
          <span
            style={{
              marginLeft: 8,
              fontSize: 'var(--font-xs)',
              padding: '2px 8px',
              background: 'color-mix(in srgb, var(--color-warning) 16%, transparent)',
              color: 'var(--color-warning)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              letterSpacing: '0.06em',
              verticalAlign: 'middle',
            }}
          >
            BETA · GRATIS
          </span>
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5,
          }}
        >
          Raccomandazioni gratuite su mercati Polymarket dove il prezzo diverge dalla nostra
          predizione modello. Auktora Pro (€9.99/mese) attivato dopo validation track record (6+
          mesi, win rate &gt;55%).
        </p>
      </header>
      <SignalsView />
    </div>
  )
}
