export const metadata = { title: 'Pricing' }

const TIERS = [
  {
    name: 'Free',
    price: '€0',
    description: 'Per cominciare',
    features: [
      '✅ Trading REAL su Polymarket',
      '✅ Markets unlimited',
      '✅ Signal AI in BETA gratis',
      '✅ Watchlist + notifiche push',
      '✅ Demo mode con $10k virtuali',
    ],
    cta: 'Inizia ora',
    highlight: false,
  },
  {
    name: 'Auktora Pro',
    price: '€9.99/mese',
    description: 'Per power user',
    features: [
      '✅ Tutto di Free',
      '⭐ Signal AI premium (post track record validato)',
      '⭐ Copy trading auto-execute',
      '⭐ Analytics avanzate + calibration curve',
      '⭐ Telegram premium (alert prioritari)',
      '⭐ Position size suggestion AI',
    ],
    cta: 'Coming soon (post-MA8)',
    highlight: true,
  },
]

export default function PricingPage() {
  return (
    <div
      style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <header style={{ textAlign: 'center' }}>
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--font-2xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          Pricing
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Trading gratis. Premium opzionale dopo validation Signal AI.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        {TIERS.map((t) => (
          <div
            key={t.name}
            style={{
              padding: 'var(--space-4)',
              background: 'var(--color-bg-secondary)',
              border: t.highlight
                ? '2px solid var(--color-cta)'
                : '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 'var(--font-xl)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}
            >
              {t.name}
            </h2>
            <strong
              style={{
                fontSize: 'var(--font-3xl)',
                fontWeight: 800,
                color: t.highlight ? 'var(--color-cta)' : 'var(--color-text-primary)',
              }}
            >
              {t.price}
            </strong>
            <p style={{ margin: 0, fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
              {t.description}
            </p>
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
              {t.features.map((f) => (
                <li
                  key={f}
                  style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}
                >
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={t.highlight}
              style={{
                marginTop: 'auto',
                padding: 'var(--space-2) var(--space-4)',
                background: t.highlight ? 'var(--color-bg-tertiary)' : 'var(--color-cta)',
                color: t.highlight ? 'var(--color-text-muted)' : '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-md)',
                fontWeight: 700,
                cursor: t.highlight ? 'not-allowed' : 'pointer',
              }}
            >
              {t.cta}
            </button>
          </div>
        ))}
      </div>

      <p
        style={{
          textAlign: 'center',
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          maxWidth: 480,
          margin: '0 auto',
          lineHeight: 1.5,
        }}
      >
        Le fee builder Polymarket sono 0 bps Y1 (matchare Betmoar). Y2 = 30 bps post-KYC builder
        profile. Copy trading: 1% builder fee con 30% al Creator opt-in.
      </p>
    </div>
  )
}
