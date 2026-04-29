import Link from 'next/link'

export const metadata = { title: 'Legal' }

const SECTIONS = [
  {
    href: '/legal/terms',
    title: 'Termini di Servizio',
    description: "Le condizioni d'uso di Auktora",
  },
  {
    href: '/legal/privacy',
    title: 'Privacy Policy',
    description: 'Come trattiamo i tuoi dati personali',
  },
  { href: '/legal/cookie', title: 'Cookie Policy', description: 'Cookie tecnici e analytics' },
  {
    href: '/legal/risk',
    title: 'Risk Disclosure',
    description: 'Rischi del trading prediction markets',
  },
  { href: '/legal/aml', title: 'AML / KYC', description: 'Anti-money laundering policy' },
]

const BLOCKED_COUNTRIES = [
  'Stati Uniti',
  'Italia',
  'Francia',
  'Germania',
  'Belgio',
  'Olanda',
  'Regno Unito',
  'Australia',
  'Giappone',
  'Singapore',
  'Cina',
  'India',
  'Russia',
  'Bielorussia',
  'Cuba',
  'Iran',
  'Iraq',
  'Libia',
  'Libano',
  'Myanmar',
  'Corea del Nord',
  'Siria',
  'Sudan',
  'Sud Sudan',
  'Somalia',
  'Venezuela',
  'Yemen',
  'Zimbabwe',
  'Nicaragua',
  'Etiopia',
  'Burundi',
  'Repubblica Centrafricana',
  'Congo Dem.',
]

export default function LegalPage() {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
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
          Legal
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Documentazione legale e compliance.
        </p>
      </header>

      <ul
        style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 'var(--space-2)' }}
      >
        {SECTIONS.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              style={{
                display: 'block',
                padding: 'var(--space-3)',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
              }}
            >
              <strong style={{ color: 'var(--color-text-primary)', fontSize: 'var(--font-md)' }}>
                {s.title} →
              </strong>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: 'var(--font-xs)',
                  color: 'var(--color-text-muted)',
                }}
              >
                {s.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <section
        style={{
          padding: 'var(--space-3)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 'var(--font-lg)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          Restrizioni geografiche
        </h2>
        <p
          style={{
            margin: '8px 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Auktora segue le stesse restrizioni di Polymarket. Trading bloccato dai seguenti
          paesi/regioni:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {BLOCKED_COUNTRIES.map((c) => (
            <span
              key={c}
              style={{
                fontSize: 'var(--font-xs)',
                padding: '2px 8px',
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-muted)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {c}
            </span>
          ))}
        </div>
        <p
          style={{
            margin: '12px 0 0',
            fontSize: 'var(--font-xs)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5,
          }}
        >
          Sub-regioni: Crimea, Donetsk, Luhansk (Ucraina), Ontario (Canada). L&apos;uso di VPN per
          aggirare queste restrizioni viola i Termini di Servizio.
        </p>
      </section>

      <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
        Per richieste compliance:{' '}
        <a href="mailto:legal@auktora.com" style={{ color: 'var(--color-cta)' }}>
          legal@auktora.com
        </a>
      </p>
    </div>
  )
}
