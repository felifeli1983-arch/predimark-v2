'use client'

import { Globe } from 'lucide-react'
import {
  BLOCKED_COUNTRIES,
  CLOSE_ONLY_COUNTRIES,
  RESTRICTED_REGIONS,
} from '@/lib/polymarket/geoblock'

const COUNTRY_NAMES: Record<string, string> = {
  AU: 'Australia',
  BE: 'Belgio',
  BY: 'Bielorussia',
  BI: 'Burundi',
  CF: 'Repubblica Centrafricana',
  CD: 'Congo Dem.',
  CU: 'Cuba',
  DE: 'Germania',
  ET: 'Etiopia',
  FR: 'Francia',
  GB: 'Regno Unito',
  IR: 'Iran',
  IQ: 'Iraq',
  IT: 'Italia',
  JP: 'Giappone',
  KP: 'Corea del Nord',
  LB: 'Libano',
  LY: 'Libia',
  MM: 'Myanmar',
  NI: 'Nicaragua',
  NL: 'Olanda',
  RU: 'Russia',
  SO: 'Somalia',
  SS: 'Sud Sudan',
  SD: 'Sudan',
  SY: 'Siria',
  UM: 'US Outlying Islands',
  US: 'Stati Uniti',
  VE: 'Venezuela',
  YE: 'Yemen',
  ZW: 'Zimbabwe',
  PL: 'Polonia',
  SG: 'Singapore',
  TH: 'Thailandia',
  TW: 'Taiwan',
}

export default function AdminGeoBlockPage() {
  const blockedList = Array.from(BLOCKED_COUNTRIES).sort()
  const closeOnlyList = Array.from(CLOSE_ONLY_COUNTRIES).sort()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
          Geo-block Compliance
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Lista paesi/regioni bloccate. Definite in `lib/polymarket/geoblock.ts` (sync con
          Polymarket compliance docs). Modifiche richiedono code change + deploy (NO runtime edit
          per safety compliance).
        </p>
      </header>

      <Section
        title={`Blocked (${blockedList.length})`}
        subtitle="Trade vietato. Redirect a /geo-blocked."
        color="var(--color-danger)"
      >
        <div style={grid}>
          {blockedList.map((cc) => (
            <CountryBadge key={cc} code={cc} name={COUNTRY_NAMES[cc] ?? cc} />
          ))}
        </div>
      </Section>

      <Section
        title={`Close-only (${closeOnlyList.length})`}
        subtitle="Possono solo chiudere posizioni esistenti — no new trades."
        color="var(--color-warning)"
      >
        <div style={grid}>
          {closeOnlyList.map((cc) => (
            <CountryBadge key={cc} code={cc} name={COUNTRY_NAMES[cc] ?? cc} />
          ))}
        </div>
      </Section>

      <Section
        title={`Restricted regions (${RESTRICTED_REGIONS.length})`}
        subtitle="Sub-region OFAC sanctions o gambling-restricted (non l'intero paese)."
        color="var(--color-warning)"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {RESTRICTED_REGIONS.map((r) => (
            <div
              key={`${r.country}-${r.region}`}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>
                <strong>
                  {r.country}/{r.region}
                </strong>
                {' — '}
                <span style={{ color: 'var(--color-text-muted)' }}>{r.reason}</span>
              </span>
            </div>
          ))}
        </div>
      </Section>

      <div
        style={{
          padding: 'var(--space-3)',
          background: 'color-mix(in srgb, var(--color-warning) 8%, var(--color-bg-secondary))',
          border: '1px solid var(--color-warning)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: 'var(--color-warning)' }}>Hard-coded</strong>: queste liste sono nel
        codice (lib/polymarket/geoblock.ts) per garantire compliance rispettata anche se DB
        compromised. Modifiche richiedono PR + deploy. Audit log obbligatorio nel commit message.
      </div>
    </div>
  )
}

function Section({
  title,
  subtitle,
  color,
  children,
}: {
  title: string
  subtitle: string
  color: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        padding: 'var(--space-3)',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 'var(--font-md)',
            fontWeight: 700,
            color,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Globe size={14} /> {title}
        </h2>
        <p
          style={{
            margin: '2px 0 0',
            fontSize: 'var(--font-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  )
}

function CountryBadge({ code, name }: { code: string; name: string }) {
  return (
    <div
      style={{
        padding: 'var(--space-1) var(--space-2)',
        background: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-xs)',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <strong style={{ fontFamily: 'monospace' }}>{code}</strong>
      <span style={{ color: 'var(--color-text-muted)' }}>{name}</span>
    </div>
  )
}

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: 4,
}
