'use client'

import Link from 'next/link'
import { Key, Lock } from 'lucide-react'

/**
 * /me/sessions — Session keys per copy trading auto-execute.
 *
 * Schema `copy_trading_sessions` esiste già (mig 005) ma execution real
 * richiede MA6.1 — Privy session keys + bot relayer.
 *
 * Per ora pagina mostra status placeholder + future explanation.
 */
export default function MeSessionsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 'var(--space-3)' }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
          <Key size={20} style={{ display: 'inline', marginRight: 8 }} />
          Session Keys
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Autorizzazioni firmate per esecuzione copy trade automatica.
        </p>
      </header>

      <div
        style={{
          padding: 'var(--space-4)',
          background: 'color-mix(in srgb, var(--color-warning) 10%, var(--color-bg-secondary))',
          border: '1px solid var(--color-warning)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 'var(--font-md)',
            fontWeight: 700,
            color: 'var(--color-warning)',
          }}
        >
          <Lock size={14} style={{ display: 'inline', marginRight: 6 }} />
          Disponibile in MA6.1
        </h2>
        <p
          style={{
            margin: '8px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
          }}
        >
          Auto-copy execution richiede session keys Privy (firmi una volta sola, durata 24h/7d/30d).
          Il bot Auktora esegue copy trade automaticamente in atomic batch col Creator copiato —
          fair price garantito.
        </p>
        <ul
          style={{
            margin: '12px 0 0',
            paddingLeft: 20,
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
          }}
        >
          <li>Budget max per session ($500 default)</li>
          <li>Max per trade ($50 default)</li>
          <li>Max trades/day (10 default)</li>
          <li>Allowed categories (Politics, Crypto, Sports, ecc.)</li>
          <li>Revoca in 1 click in qualsiasi momento</li>
        </ul>
      </div>

      <div
        style={{
          padding: 'var(--space-3)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          Per ora puoi configurare i copy params in{' '}
          <Link href="/me/following" style={{ color: 'var(--color-cta)' }}>
            /me/following
          </Link>
          . Quando MA6.1 sarà attivo, il setting esistente verrà automaticamente applicato.
        </p>
      </div>
    </div>
  )
}
