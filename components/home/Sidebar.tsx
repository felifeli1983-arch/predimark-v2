'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { SidebarPortfolio } from './SidebarPortfolio'
import { SidebarSignals } from './SidebarSignals'
import { SidebarActivity } from './SidebarActivity'
import { SidebarHotNow } from './SidebarHotNow'
import { SidebarWatchlist } from './SidebarWatchlist'
import { SidebarNews } from './SidebarNews'
import { CryptoLiveRail } from './CryptoLiveRail'

/**
 * Sidebar adattiva:
 * - Guest: CTA Sign in + Demo Mode + Hot Now + Activity
 * - Logged: Portfolio + Signals + Activity + Hot Now
 *
 * Sticky desktop. Hidden mobile (md:block).
 */
export function Sidebar() {
  const { authenticated, ready, login } = useAuth()

  return (
    <aside
      className="hidden md:flex"
      style={{
        flexDirection: 'column',
        gap: 12,
        position: 'sticky',
        top: 12,
        alignSelf: 'flex-start',
        width: '100%',
      }}
    >
      {ready && !authenticated && (
        <section
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-cta)',
            borderRadius: 10,
            padding: '14px',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: 4,
            }}
          >
            Inizia a tradare
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: 'var(--color-text-muted)',
              marginBottom: 10,
              lineHeight: 1.5,
            }}
          >
            Accedi per piazzare trade reali o esplora in modalità Demo.
          </p>
          <button
            type="button"
            onClick={login}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 7,
              background: 'var(--color-cta)',
              color: '#fff',
              border: 'none',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 6,
            }}
          >
            Sign in
          </button>
          <Link
            href="/?demo=1"
            style={{
              display: 'block',
              textAlign: 'center',
              fontSize: 11,
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
            }}
          >
            Prova in Demo Mode →
          </Link>
        </section>
      )}

      {/* Ordine adattivo da Doc 4 wireframe Pagina 1 sezione "Sidebar adattiva":
       *   Stato 1 (guest):     Demo CTA → Signals → HotNow → News → Activity
       *   Stato 2 (logged):    Portfolio → Signals → Watchlist → HotNow → Activity
       * Per ora rendiamo entrambe le facce + CryptoLiveRail come bonus stato. */}
      {authenticated ? <SidebarPortfolio /> : null}
      <SidebarSignals />
      {authenticated ? <SidebarWatchlist /> : null}
      <CryptoLiveRail />
      <SidebarHotNow />
      <SidebarNews />
      <SidebarActivity />
    </aside>
  )
}
