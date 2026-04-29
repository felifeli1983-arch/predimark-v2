'use client'

import Link from 'next/link'
import { CreditCard, Star } from 'lucide-react'

export default function MeBillingPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 'var(--space-3)' }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
          <CreditCard size={20} style={{ display: 'inline', marginRight: 8 }} />
          Billing & Subscription
        </h1>
      </header>

      <div
        style={{
          padding: 'var(--space-3)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <strong>Piano attuale: Free</strong>
        <p
          style={{
            margin: '8px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
          }}
        >
          ✅ Trading REAL/DEMO unlimited
          <br />
          ✅ Signal AI gratis (BETA)
          <br />✅ Watchlist + notifiche push
        </p>
      </div>

      <div
        style={{
          padding: 'var(--space-4)',
          background: 'color-mix(in srgb, var(--color-cta) 8%, var(--color-bg-secondary))',
          border: '2px solid var(--color-cta)',
          borderRadius: 'var(--radius-lg)',
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
          <Star
            size={18}
            style={{ display: 'inline', marginRight: 6, color: 'var(--color-cta)' }}
          />
          Auktora Pro €9.99/mese
        </h2>
        <p
          style={{
            margin: '8px 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          Coming soon. Sarà attivato dopo validation track record Signal AI (&gt;55% win rate, 6+
          mesi).
        </p>
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <li style={{ fontSize: 'var(--font-sm)' }}>⭐ Signal AI premium</li>
          <li style={{ fontSize: 'var(--font-sm)' }}>⭐ Copy trading auto-execute</li>
          <li style={{ fontSize: 'var(--font-sm)' }}>⭐ Analytics avanzate + calibration curve</li>
          <li style={{ fontSize: 'var(--font-sm)' }}>⭐ Telegram premium (€5/mese incluso)</li>
          <li style={{ fontSize: 'var(--font-sm)' }}>⭐ Position size suggestion AI</li>
        </ul>
      </div>

      <Link
        href="/pricing"
        style={{ fontSize: 'var(--font-sm)', color: 'var(--color-cta)', alignSelf: 'flex-start' }}
      >
        Vedi piani completi →
      </Link>
    </div>
  )
}
