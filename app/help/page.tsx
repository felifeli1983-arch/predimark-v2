export const metadata = { title: 'Help' }

const FAQS = [
  {
    q: 'Come funziona il trading REAL?',
    a: 'Auktora si connette a Polymarket CLOB V2 via il tuo wallet (Privy embedded o esterno). I trade vanno on-chain Polygon. Custody resta tuo, Auktora non tocca i fondi.',
  },
  {
    q: 'Quali sono le fee?',
    a: 'Trading: 0 bps Y1 (acquisition phase, gratuito). Copy trading: 1% builder fee, di cui 30% va al Creator copiato (se opt-in). Withdraw: solo gas fee on-chain (~$0.02 su Polygon).',
  },
  {
    q: 'Da dove posso usare Auktora?',
    a: 'Auktora segue le restrizioni di Polymarket (33 paesi/regioni bloccati). Vedi /legal per la lista completa. UAE, Asia (escluso SG), LATAM, Turchia sono OK.',
  },
  {
    q: 'Cosa è il modalità DEMO?',
    a: 'DEMO ti dà $10k virtuali per fare trade simulati con prezzi live Polymarket. Zero rischio, perfetto per imparare. Toggle REAL/DEMO è in header.',
  },
  {
    q: 'Come deposito?',
    a: 'Click "Deposit" in header → modal Privy con 3 opzioni: Apple Pay/Card via MoonPay, transfer da wallet, o ricevi USDC al tuo address. Polygon network.',
  },
  {
    q: 'Posso usare il mio account Polymarket esistente?',
    a: 'Sì! Click "Collega il tuo account Polymarket" nel signup. Stesse posizioni, stesso storico, zero migrazione.',
  },
  {
    q: 'Cosa è il Signal AI?',
    a: 'Auktora calcola signal su mercati con discrepanze prezzo-probabilità. Per ora gratis (BETA). Auktora Pro €9.99/mese sarà attivato dopo validation track record (>55% win rate, 6+ mesi).',
  },
  {
    q: 'Come diventa Creator?',
    a: 'Click "Diventa Creator" in /creator/apply. Servono minimo 30 trade Polymarket reali. Verified Creator riceve 30% del builder fee dei follower che ti copiano.',
  },
  {
    q: 'Auktora supporta Telegram?',
    a: 'Sì, bot @AuktoraBot per alert push trade follower + signal AI. Connetti via /me/settings → Telegram.',
  },
]

export default function HelpPage() {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <header>
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--font-2xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          Help & FAQ
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Risposte rapide. Per altro:{' '}
          <a href="mailto:support@auktora.com" style={{ color: 'var(--color-cta)' }}>
            support@auktora.com
          </a>
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {FAQS.map((f) => (
          <details
            key={f.q}
            style={{
              padding: 'var(--space-3)',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <summary
              style={{
                cursor: 'pointer',
                fontSize: 'var(--font-md)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              {f.q}
            </summary>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: 'var(--font-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
              }}
            >
              {f.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  )
}
