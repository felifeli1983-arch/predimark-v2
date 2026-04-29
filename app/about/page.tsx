export const metadata = { title: 'About' }

export default function AboutPage() {
  return (
    <article
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        lineHeight: 1.6,
        color: 'var(--color-text-secondary)',
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: 'var(--font-2xl)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
        }}
      >
        About Auktora
      </h1>
      <p>
        Auktora è un aggregator Polymarket che aggiunge segnali AI, copy trading e community
        tooling. Custody on-chain, fee trasparenti, niente intermediari.
      </p>
      <h2
        style={{
          margin: 0,
          fontSize: 'var(--font-lg)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
        }}
      >
        Mission
      </h2>
      <p>
        Rendere il prediction market accessibile a chiunque tramite UX semplice (Apple Pay deposit,
        embedded wallet via Privy) e tooling avanzato per power user (signal AI, copy trading,
        analytics).
      </p>
      <h2
        style={{
          margin: 0,
          fontSize: 'var(--font-lg)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
        }}
      >
        Come funziona
      </h2>
      <ul>
        <li>I mercati live sono presi da Polymarket via Gamma API</li>
        <li>I trade vanno on-chain via CLOB V2 (Polygon)</li>
        <li>Custody resta sempre sul wallet utente — Auktora non tocca fondi</li>
        <li>Builder fee: 0% Y1 (acquisition), 30bps Y2 post-KYC</li>
      </ul>
      <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
        Powered by Polymarket. Auktora segue le restrizioni geografiche compliance — vedi{' '}
        <a href="/legal" style={{ color: 'var(--color-cta)' }}>
          Legal
        </a>
        .
      </p>
    </article>
  )
}
