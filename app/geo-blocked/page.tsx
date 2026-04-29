import Link from 'next/link'
import { Globe } from 'lucide-react'

const COUNTRY_NAMES: Record<string, string> = {
  AU: 'Australia',
  BE: 'Belgio',
  BY: 'Bielorussia',
  CA: 'Canada',
  CN: 'Cina',
  CU: 'Cuba',
  DE: 'Germania',
  FR: 'Francia',
  GB: 'Regno Unito',
  IT: 'Italia',
  IR: 'Iran',
  JP: 'Giappone',
  KP: 'Corea del Nord',
  NL: 'Olanda',
  RU: 'Russia',
  SG: 'Singapore',
  SY: 'Siria',
  UA: 'Ucraina',
  US: 'Stati Uniti',
  VE: 'Venezuela',
}

interface Props {
  searchParams: Promise<{ country?: string; region?: string }>
}

export default async function GeoBlockedPage({ searchParams }: Props) {
  const params = await searchParams
  const country = params.country ?? 'UNKNOWN'
  const region = params.region
  const countryName = COUNTRY_NAMES[country] ?? country

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6) var(--space-4)',
        gap: 'var(--space-4)',
        textAlign: 'center',
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 'var(--radius-full)',
          background: 'color-mix(in srgb, var(--color-warning) 12%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-warning)',
        }}
      >
        <Globe size={40} />
      </div>

      <h1
        style={{
          margin: 0,
          fontSize: 'var(--font-2xl)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
        }}
      >
        Auktora non è disponibile nel tuo paese
      </h1>

      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-md)',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
        }}
      >
        Rilevato accesso da <strong>{countryName}</strong>
        {region ? ` (regione ${region})` : ''}.
        <br />
        Per motivi di compliance Auktora segue le stesse restrizioni geografiche di Polymarket.
      </p>

      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-muted)',
          lineHeight: 1.5,
        }}
      >
        Se utilizzi una VPN per accedere, disabilitala. L&apos;uso di servizi VPN per aggirare
        questa restrizione viola i nostri Termini di Servizio.
      </div>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-base)',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Torna alla home
        </Link>
      </div>

      <div
        style={{
          marginTop: 'var(--space-4)',
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
        }}
      >
        Pensi sia un errore? Contatta{' '}
        <a
          href="mailto:support@auktora.com"
          style={{ color: 'var(--color-cta)', textDecoration: 'none' }}
        >
          support@auktora.com
        </a>
      </div>
    </div>
  )
}
